# Firestore Real-Time Listeners Guide for Admin Portal

## Table of Contents
1. Overview
2. Architecture
3. Security Rules
4. Implementation Guide
5. Code Examples
6. Indexing Setup
7. Performance Optimization
8. Error Handling
9. Best Practices
10. Cost Comparison

---

## 1. Overview

Real-time listeners provide instant updates when data changes in Firestore without continuous polling. Perfect for admin portals that need to display live order updates.

### Benefits Over Polling:
- **Instant Updates**: Data appears milliseconds after change (vs 5-30s with polling)
- **Cost Efficient**: Pay only for actual changes, not continuous reads
- **Server Load**: No unnecessary requests
- **Better UX**: Live dashboard without manual refresh
- **Scalability**: Automatically scales with Firebase infrastructure

### Cost Comparison (1000 orders/day):
```
Polling (every 10 seconds):  ~8,640 reads/day = $0.43/day
Real-time Listeners:         ~1,000 reads/day = $0.05/day
Savings: 88% cost reduction
```

---

## 2. Architecture

### Data Structure (Your Current Setup):
```
Firestore Database:
├── users/
│   ├── {userId}/
│   │   └── orders/
│   │       ├── {orderId}
│   │       │   ├── status: "processing"
│   │       │   ├── items: [...]
│   │       │   ├── totalAmount: 500
│   │       │   ├── createdAt: timestamp
│   │       │   └── updatedAt: timestamp
│   │       └── {orderId2}
│   └── {userId2}
```

### Admin Portal Architecture:
```
Admin Portal App
    ↓
OrdersService (with Real-time Listeners)
    ↓
Firestore (collectionGroup query)
    ↓
Admin Context/State Management
    ↓
UI Components (Dashboard, Order List, etc.)
```

---

## 3. Security Rules Setup

### Important: Firestore Security Rules
Protect data while allowing admin access.

```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin-only collection for configuration
    match /admins/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Users collection - admins can read all orders
    match /users/{userId}/orders/{document=**} {
      // Users can read/write their own orders
      allow read, write: if isOwner(userId);
      
      // Admins can read all orders
      allow read: if isAdmin();
    }
    
    // Helper functions
    function isAdmin() {
      return get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
  }
}
```

### Setup Admin Role in Firestore:
1. Create `/admins` collection in Firestore
2. Add document with admin UID as ID
3. Set `isAdmin: true`

```javascript
// Script to create admin user (run once)
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const db = admin.firestore();

async function createAdmin(adminUID) {
  await db.collection('admins').doc(adminUID).set({
    isAdmin: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Admin created:', adminUID);
}

// Usage:
createAdmin('YOUR_ADMIN_UID_HERE');
```

---

## 4. Implementation Guide

### Step 1: Create Admin Orders Service

Create file: `services/adminOrdersService.ts`

```typescript
import { db } from '@/config/firebase';
import {
    collection,
    collectionGroup,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
    updateDoc,
    doc,
    Timestamp,
} from 'firebase/firestore';

export interface AdminOrder {
  id: string;
  userId: string;
  items: any[];
  shippingAddress: any;
  paymentMethod: any;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled';
  deliveryTime?: number;
  estimatedDelivery?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
  userEmail?: string;
  userName?: string;
}

/**
 * Listen to ALL orders across all users in real-time
 * Best for admin dashboard showing all orders
 */
export const listenToAllOrders = (
  onSuccess: (orders: AdminOrder[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  try {
    // Use collectionGroup to query orders across all users
    const ordersQuery = query(
      collectionGroup(db, 'orders'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders: AdminOrder[] = [];
        snapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
          } as AdminOrder);
        });
        onSuccess(orders);
      },
      (error) => {
        console.error('Error listening to all orders:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up listener:', error);
    onError(error as Error);
    return () => {};
  }
};

/**
 * Listen to orders with specific status filter
 * E.g., only "processing" or "shipped" orders
 */
export const listenToOrdersByStatus = (
  status: string,
  onSuccess: (orders: AdminOrder[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  try {
    const ordersQuery = query(
      collectionGroup(db, 'orders'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders: AdminOrder[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === status) {
            orders.push({
              id: doc.id,
              ...data,
            } as AdminOrder);
          }
        });
        onSuccess(orders);
      },
      (error) => {
        console.error('Error listening to orders by status:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up listener:', error);
    onError(error as Error);
    return () => {};
  }
};

/**
 * Listen to orders from last N hours
 * Useful for "Recent Orders" dashboard
 */
export const listenToRecentOrders = (
  hoursBack: number = 24,
  onSuccess: (orders: AdminOrder[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  try {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const ordersQuery = query(
      collectionGroup(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders: AdminOrder[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
          if (createdAt >= cutoffTime) {
            orders.push({
              id: doc.id,
              ...data,
            } as AdminOrder);
          }
        });
        onSuccess(orders);
      },
      (error) => {
        console.error('Error listening to recent orders:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up listener:', error);
    onError(error as Error);
    return () => {};
  }
};

/**
 * Update order status (admin functionality)
 */
export const updateOrderStatusAdmin = async (
  userId: string,
  orderId: string,
  newStatus: string,
  notes?: string
): Promise<void> => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    
    const updateData: any = {
      status: newStatus,
      updatedAt: Timestamp.now(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(orderRef, updateData);
    console.log('Order status updated successfully');
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get user details for order (name, email)
 * Note: You may want to add user info to orders document
 */
export const enrichOrderWithUserData = async (
  order: AdminOrder,
  getUserData: (userId: string) => Promise<any>
): Promise<AdminOrder> => {
  try {
    const userData = await getUserData(order.userId);
    return {
      ...order,
      userEmail: userData.email,
      userName: userData.displayName,
    };
  } catch (error) {
    console.error('Error enriching order data:', error);
    return order;
  }
};
```

### Step 2: Create Admin Orders Context

Create file: `context/AdminOrdersContext.tsx`

```typescript
import { auth } from '@/config/firebase';
import {
  listenToAllOrders,
  listenToOrdersByStatus,
  listenToRecentOrders,
  updateOrderStatusAdmin,
  AdminOrder,
} from '@/services/adminOrdersService';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AdminOrdersContextType {
  allOrders: AdminOrder[];
  processingOrders: AdminOrder[];
  shippedOrders: AdminOrder[];
  recentOrders: AdminOrder[];
  isLoading: boolean;
  error: string | null;
  updateOrderStatus: (userId: string, orderId: string, status: string, notes?: string) => Promise<void>;
  stats: {
    totalOrders: number;
    processingCount: number;
    shippedCount: number;
    deliveredToday: number;
  };
}

const AdminOrdersContext = createContext<AdminOrdersContextType | undefined>(undefined);

export const AdminOrdersProvider = ({ children }: { children: ReactNode }) => {
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);
  const [processingOrders, setProcessingOrders] = useState<AdminOrder[]>([]);
  const [shippedOrders, setShippedOrders] = useState<AdminOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Set up listeners when admin is authenticated
  useEffect(() => {
    let unsubscribeAll: (() => void) | null = null;
    let unsubscribeProcessing: (() => void) | null = null;
    let unsubscribeShipped: (() => void) | null = null;
    let unsubscribeRecent: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        setIsLoading(true);
        setError(null);

        try {
          // Listen to all orders
          unsubscribeAll = listenToAllOrders(
            (orders) => {
              setAllOrders(orders);
              setIsLoading(false);
            },
            (err) => {
              console.error('All orders listener error:', err);
              setError(err.message);
              setIsLoading(false);
            }
          );

          // Listen to processing orders
          unsubscribeProcessing = listenToOrdersByStatus(
            'processing',
            setProcessingOrders,
            (err) => console.error('Processing orders error:', err)
          );

          // Listen to shipped orders
          unsubscribeShipped = listenToOrdersByStatus(
            'shipped',
            setShippedOrders,
            (err) => console.error('Shipped orders error:', err)
          );

          // Listen to recent orders (last 24 hours)
          unsubscribeRecent = listenToRecentOrders(
            24,
            setRecentOrders,
            (err) => console.error('Recent orders error:', err)
          );
        } catch (err: any) {
          console.error('Error setting up listeners:', err);
          setError(err.message);
          setIsLoading(false);
        }
      } else {
        // User logged out - clean up listeners
        if (unsubscribeAll) unsubscribeAll();
        if (unsubscribeProcessing) unsubscribeProcessing();
        if (unsubscribeShipped) unsubscribeShipped();
        if (unsubscribeRecent) unsubscribeRecent();

        setAllOrders([]);
        setProcessingOrders([]);
        setShippedOrders([]);
        setRecentOrders([]);
        setError(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeAll) unsubscribeAll();
      if (unsubscribeProcessing) unsubscribeProcessing();
      if (unsubscribeShipped) unsubscribeShipped();
      if (unsubscribeRecent) unsubscribeRecent();
    };
  }, []);

  const updateOrderStatus = async (
    userId: string,
    orderId: string,
    status: string,
    notes?: string
  ) => {
    try {
      await updateOrderStatusAdmin(userId, orderId, status, notes);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Calculate stats from orders
  const stats = {
    totalOrders: allOrders.length,
    processingCount: processingOrders.length,
    shippedCount: shippedOrders.length,
    deliveredToday: allOrders.filter((order) => {
      const isDelivered = order.status === 'delivered';
      const isToday =
        order.updatedAt?.toDate?.()?.toDateString() === new Date().toDateString();
      return isDelivered && isToday;
    }).length,
  };

  return (
    <AdminOrdersContext.Provider
      value={{
        allOrders,
        processingOrders,
        shippedOrders,
        recentOrders,
        isLoading,
        error,
        updateOrderStatus,
        stats,
      }}
    >
      {children}
    </AdminOrdersContext.Provider>
  );
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrdersContext);
  if (!context) {
    throw new Error('useAdminOrders must be used within AdminOrdersProvider');
  }
  return context;
};
```

### Step 3: Use in Admin Dashboard

Example component: `app/admin/dashboard.tsx`

```typescript
import { useAdminOrders } from '@/context/AdminOrdersContext';
import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function AdminDashboard() {
  const {
    allOrders,
    processingOrders,
    shippedOrders,
    recentOrders,
    isLoading,
    error,
    updateOrderStatus,
    stats,
  } = useAdminOrders();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading real-time orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  const handleStatusUpdate = async (userId: string, orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(userId, orderId, newStatus);
      Alert.alert('Success', 'Order status updated');
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Processing" value={stats.processingCount} />
        <StatCard label="Shipped" value={stats.shippedCount} />
        <StatCard label="Delivered Today" value={stats.deliveredToday} />
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders (Real-time)</Text>
        <FlatList
          data={recentOrders.slice(0, 10)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onStatusChange={(status) => handleStatusUpdate(item.userId, item.id, status)}
            />
          )}
        />
      </View>

      {/* Processing Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Processing Orders</Text>
        <FlatList
          data={processingOrders}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onStatusChange={(status) => handleStatusUpdate(item.userId, item.id, status)}
            />
          )}
        />
      </View>

      {/* Shipped Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipped Orders</Text>
        <FlatList
          data={shippedOrders}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onStatusChange={(status) => handleStatusUpdate(item.userId, item.id, status)}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}

interface OrderCardProps {
  order: AdminOrder;
  onStatusChange: (status: string) => void;
}

function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'processing':
        return '#FF9800';
      case 'shipped':
        return '#2196F3';
      case 'delivered':
        return '#8BC34A';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const statusOptions = ['processing', 'shipped', 'in-transit', 'delivered', 'cancelled'];

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order ID: {order.id.substring(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <Text style={styles.orderInfo}>Amount: ₹{order.totalAmount}</Text>
      <Text style={styles.orderInfo}>Items: {order.items.length}</Text>
      <Text style={styles.orderInfo}>Created: {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleString()}</Text>

      <View style={styles.statusButtons}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusBtn,
              order.status === status && styles.statusBtnActive,
            ]}
            onPress={() => onStatusChange(status)}
          >
            <Text style={styles.statusBtnText}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
  },
  statusBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  statusBtnActive: {
    backgroundColor: '#2196F3',
  },
  statusBtnText: {
    fontSize: 11,
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
});

type AdminOrder = any; // Import from service
```

---

## 5. Code Examples

### Example 1: Simple Real-time Order List

```typescript
import { useAdminOrders } from '@/context/AdminOrdersContext';

export function AdminOrdersList() {
  const { allOrders, isLoading } = useAdminOrders();

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={allOrders}
      renderItem={({ item }) => (
        <View>
          <Text>Order {item.id}: {item.status}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Example 2: Real-time Statistics

```typescript
export function AdminStats() {
  const { stats, isLoading } = useAdminOrders();

  if (isLoading) return <Text>Calculating...</Text>;

  return (
    <View>
      <Text>Total Orders: {stats.totalOrders}</Text>
      <Text>Processing: {stats.processingCount}</Text>
      <Text>Shipped: {stats.shippedCount}</Text>
      <Text>Delivered Today: {stats.deliveredToday}</Text>
    </View>
  );
}
```

### Example 3: Manual Status Update

```typescript
const handleUpdateStatus = async () => {
  const { updateOrderStatus } = useAdminOrders();
  
  try {
    await updateOrderStatus(userId, orderId, 'shipped', 'Sent via Fedex');
    Alert.alert('Success', 'Order updated!');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Example 4: Filter Real-time Data

```typescript
export function PendingOrdersOnly() {
  const { allOrders } = useAdminOrders();
  
  const pendingOrders = allOrders.filter(
    order => order.status === 'confirmed' || order.status === 'processing'
  );

  return (
    <FlatList
      data={pendingOrders}
      renderItem={({ item }) => <OrderItem order={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

## 6. Firestore Indexing Setup

Real-time listeners with `collectionGroup` queries require proper indexing.

### Required Indexes:

**Index 1: For All Orders**
```
Collection: orders
Fields:
  - updatedAt (Descending)
```

**Index 2: For Orders by Status**
```
Collection: orders
Fields:
  - status (Ascending)
  - updatedAt (Descending)
```

**Index 3: For Recent Orders**
```
Collection: orders
Fields:
  - createdAt (Descending)
```

### How to Create Indexes:

#### Option A: Firebase Console (Manual)
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to Firestore Database → Indexes
4. Click "Create Index"
5. Collection: `orders`
6. Add fields as shown above
7. Create Index

#### Option B: Auto-create (Let Firebase Create)
When you run a query that needs an index, Firestore shows a link in console to create it. Click it!

#### Option C: Firebase CLI (Automated)
```bash
# Install CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy indexes from firestore.indexes.json
firebase deploy --only firestore:indexes
```

### firestore.indexes.json Example:
```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

---

## 7. Performance Optimization

### 1. Limit Real-time Data (Don't Listen to Everything)

```typescript
// ❌ BAD: Listening to ALL fields
onSnapshot(ordersQuery, (snapshot) => {
  // Large payload every change
});

// ✅ GOOD: Use select() to get only needed fields
import { query, collectionGroup, orderBy, select } from 'firebase/firestore';

const optimizedQuery = query(
  collectionGroup(db, 'orders'),
  select(['id', 'status', 'totalAmount', 'updatedAt'])
  // This is not available - use client-side filtering instead
);
```

### 2. Paginate Results

```typescript
// Only listen to most recent 50 orders
import { limit } from 'firebase/firestore';

const paginatedQuery = query(
  collectionGroup(db, 'orders'),
  orderBy('updatedAt', 'desc'),
  limit(50)
);

onSnapshot(paginatedQuery, (snapshot) => {
  // Max 50 documents
});
```

### 3. Clean Up Listeners When Not Needed

```typescript
// Good practice: Unsubscribe when component unmounts
useEffect(() => {
  const unsubscribe = listenToAllOrders(
    (orders) => setOrders(orders),
    (error) => console.error(error)
  );

  return () => {
    // This is CRITICAL for performance
    unsubscribe();
  };
}, []);
```

### 4. Use Multiple Specific Listeners Instead of One Large

```typescript
// ❌ INEFFICIENT: One listener for all statuses
const allStatusesQuery = query(collectionGroup(db, 'orders'));

// ✅ EFFICIENT: Separate listeners for each status
const processingQuery = query(
  collectionGroup(db, 'orders'),
  where('status', '==', 'processing')
);
const shippedQuery = query(
  collectionGroup(db, 'orders'),
  where('status', '==', 'shipped')
);
```

### 5. Debounce Updates on Client

```typescript
// Avoid re-rendering too frequently
import { useDeferredValue } from 'react';

export function OrdersList() {
  const { allOrders } = useAdminOrders();
  
  // Defer updates - batches changes together
  const deferredOrders = useDeferredValue(allOrders);

  return <FlatList data={deferredOrders} />;
}
```

---

## 8. Error Handling

### Common Errors and Solutions:

#### Error: "Missing or insufficient permissions"
```
Cause: Security rules don't allow admin to read orders
Solution: Check firestore.rules - ensure isAdmin() check is correct
```

#### Error: "The query requires an index"
```
Cause: Multi-field queries need Firestore indexes
Solution: Create index in Firebase Console or click link in error message
```

#### Error: "Quota exceeded"
```
Cause: Too many concurrent listeners or large documents
Solution: Limit listeners, use pagination, optimize data structure
```

#### Error: "Offline" - No updates coming through
```
Cause: Network issue or Firestore offline
Solution: Check internet, add error callback handling, implement retry logic
```

### Robust Error Handling Pattern:

```typescript
export const listenToOrdersWithRetry = (
  onSuccess: (orders: AdminOrder[]) => void,
  onError: (error: Error) => void,
  maxRetries: number = 3
): Unsubscribe => {
  let retryCount = 0;
  let currentUnsubscribe: (() => void) | null = null;

  const setupListener = () => {
    try {
      currentUnsubscribe = listenToAllOrders(
        (orders) => {
          retryCount = 0; // Reset on success
          onSuccess(orders);
        },
        (error) => {
          console.error(`Listener error (attempt ${retryCount + 1}):`, error);

          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying in 5 seconds...`);
            setTimeout(setupListener, 5000);
          } else {
            onError(new Error(`Failed after ${maxRetries} retries: ${error.message}`));
          }
        }
      );
    } catch (error) {
      onError(error as Error);
    }
  };

  setupListener();

  return () => {
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }
  };
};
```

---

## 9. Best Practices

### ✅ DO:
1. **Clean up listeners** when component unmounts
2. **Use collectionGroup** for cross-user queries (admin use)
3. **Implement proper security rules** before going live
4. **Create necessary Firestore indexes** upfront
5. **Paginate results** for large datasets
6. **Handle errors gracefully** with user feedback
7. **Test offline behavior** for better UX
8. **Monitor Firestore usage** in Firebase Console
9. **Use Context API** to share listeners across app
10. **Add loading and error states** to UI

### ❌ DON'T:
1. **Don't listen to all data** if you only need some
2. **Don't forget to unsubscribe** from listeners
3. **Don't store sensitive data** in order documents visible to admins
4. **Don't overuse collectionGroup** queries (they're slow)
5. **Don't update state in listener callback unnecessarily**
6. **Don't forget security rules** - test them!
7. **Don't use listeners for one-time fetches** (use `getDocs` instead)
8. **Don't ignore error callbacks**
9. **Don't rely on client-side filtering** for security
10. **Don't create indexes without proper field planning**

---

## 10. Cost Comparison

### Polling vs Real-time Listeners (Monthly Estimate)

#### Scenario: 5,000 orders/month, admin checks every 10 seconds for 10 hours/day

**Polling Method:**
```
Checks per day: 36 × 10 hours = 3,600 checks
Reads per check: 1 (fetch all orders)
Total reads/month: 3,600 × 20 days = 72,000 reads
Cost: 72,000 × $0.06 per 100k = $4.32/month
```

**Real-time Listeners:**
```
Listener writes: 5,000/month
Listener reads: 5,000/month (on change)
Total reads/month: 5,000 (one setup) + 5,000 (changes) = 10,000
Cost: 10,000 × $0.06 per 100k = $0.60/month
Savings: 86% less expensive
```

**At Scale (100,000 orders/month):**
```
Polling: $86.40/month
Real-time: $12/month
Savings: 86% reduction = $74.40/month saved
```

---

## Implementation Checklist

- [ ] Create `services/adminOrdersService.ts` with listener functions
- [ ] Create `context/AdminOrdersContext.tsx` for state management
- [ ] Wrap admin app with `<AdminOrdersProvider>`
- [ ] Create Firestore indexes for collectionGroup queries
- [ ] Update Firestore security rules to allow admin access
- [ ] Create admin user in `/admins` collection
- [ ] Build admin dashboard components
- [ ] Test real-time updates
- [ ] Test error handling (offline mode)
- [ ] Monitor Firestore usage in Firebase Console
- [ ] Document admin features

---

## Quick Reference Commands

```bash
# Create Firestore indexes
firebase deploy --only firestore:indexes

# Monitor Firestore in real-time
firebase emulators:start --only firestore

# Check current usage
firebase firestore:indexes

# Update security rules
firebase deploy --only firestore:rules
```

---

## Troubleshooting

**Q: Updates not showing up?**
A: Check if unsubscribe is being called too early. Add console.logs to verify listener is active.

**Q: Too many read costs?**
A: Reduce number of listeners, use pagination (limit()), or combine multiple listeners into one.

**Q: Latency in updates?**
A: Check network. Firestore should update within 100ms. If slower, check Firestore indexes are created.

**Q: Listeners randomly stop?**
A: Network interruption. Implement retry logic and reload page on long disconnection.

**Q: Performance degradation over time?**
A: Memory leak - likely not unsubscribing from listeners. Check useEffect cleanup functions.

---

## Next Steps

1. Implement the admin orders service and context
2. Create necessary Firestore indexes
3. Set up admin security rules
4. Build admin dashboard UI
5. Test end-to-end
6. Monitor costs and performance
7. Iterate based on feedback

---

**Last Updated: April 2026**
**Version: 1.0**
