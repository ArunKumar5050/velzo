import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  Timestamp,
  collectionGroup,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

// Get all orders from all users' subcollections
export const getOrders = async () => {
  try {
    console.log('📦 Starting to fetch orders...')
    
    const orders = []

    // Try Method 1: Using collectionGroup (no orderBy to avoid index requirements)
    try {
      console.log('🔍 Trying Method 1: collectionGroup query...')
      const ordersGroup = collectionGroup(db, 'orders')
      const groupSnapshot = await getDocs(ordersGroup)
      console.log(`✅ Method 1 Success: Found ${groupSnapshot.docs.length} orders via collectionGroup`)

      // Extract user ID from the document reference path
      groupSnapshot.forEach((orderDoc) => {
        const ref = orderDoc.ref
        const pathSegments = ref.path.split('/')
        const userId = pathSegments[1] // users/{userId}/orders/{orderId}
        
        orders.push({
          id: orderDoc.id,
          userId: userId,
          ...orderDoc.data(),
        })
      })

      // If we got orders, fetch user details
      if (orders.length > 0) {
        console.log('👥 Fetching user details for orders...')
        const userIds = [...new Set(orders.map(o => o.userId))]
        
        for (const userId of userIds) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              orders.forEach(order => {
                if (order.userId === userId) {
                  order.userName = userData.name || 'Unknown'
                  order.userEmail = userData.email || ''
                  order.userPhone = userData.phone || ''
                }
              })
            }
          } catch (e) {
            console.warn(`Could not fetch user ${userId}:`, e.message)
          }
        }
      }

      // Sort by createdAt descending
      orders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0
        const timeB = b.createdAt?.toMillis?.() || 0
        return timeB - timeA
      })

      console.log(`✅ Total orders: ${orders.length}`)
      if (orders.length > 0) {
        console.log('📦 Sample order:', orders[0])
      }
      return orders
    } catch (groupError) {
      console.log('⚠️  Method 1 failed, trying Method 2:', groupError.message)

      // Try Method 2: Fetch all users and their orders
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        console.log(`👥 Found ${usersSnapshot.docs.length} users`)
        
        // Iterate through each user and fetch their orders subcollection
        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id
          const userData = userDoc.data()
          console.log(`📋 Fetching orders for user: ${userId}`)
          
          try {
            const ordersSnapshot = await getDocs(
              collection(db, 'users', userId, 'orders')
            )
            console.log(`  └─ Found ${ordersSnapshot.docs.length} orders for this user`)
            
            ordersSnapshot.forEach((orderDoc) => {
              const orderData = orderDoc.data()
              orders.push({
                id: orderDoc.id,
                userId: userId,
                userName: userData.name || 'Unknown',
                userEmail: userData.email || '',
                userPhone: userData.phone || '',
                ...orderData,
              })
            })
          } catch (error) {
            console.warn(`⚠️  Could not fetch orders for user ${userId}:`, error.message)
          }
        }

        // Sort by date
        orders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0
          const timeB = b.createdAt?.toMillis?.() || 0
          return timeB - timeA
        })

        console.log(`✅ Method 2 Success: Fetched ${orders.length} total orders`)
        if (orders.length > 0) {
          console.log('📦 Sample order:', orders[0])
        }
        return orders
      } catch (method2Error) {
        console.error('❌ Method 2 also failed:', method2Error)
        throw method2Error
      }
    }
  } catch (error) {
    console.error('❌ Error getting orders:', error)
    return []
  }
}

// Add a new order
export const addOrder = async (userId, orderData) => {
  try {
    const docRef = await addDoc(
      collection(db, 'users', userId, 'orders'),
      {
        ...orderData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    )
    console.log(`✅ Order added with ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error('Error adding order:', error)
    throw error
  }
}

// Update an order
export const updateOrder = async (userId, orderId, orderData) => {
  try {
    console.log(`📝 Updating order ${orderId} for user ${userId}`)
    console.log('📝 New data:', orderData)
    
    const orderRef = doc(db, 'users', userId, 'orders', orderId)
    
    const updatePayload = {
      ...orderData,
      updatedAt: Timestamp.now(),
    }
    
    await updateDoc(orderRef, updatePayload)
    console.log(`✅ Order ${orderId} updated successfully in Firestore`)
    return true
  } catch (error) {
    console.error(`❌ Error updating order ${orderId}:`, error.message)
    throw error
  }
}

// Real-time listener for orders using onSnapshot
// Returns an unsubscribe function to clean up the listener
export const listenToAllOrders = (onSuccess, onError) => {
  console.log('🔔 Setting up real-time listener for all orders...')
  
  try {
    // Use collectionGroup WITHOUT orderBy to avoid index requirement
    // We'll sort in JavaScript instead
    const ordersQuery = collectionGroup(db, 'orders')

    const unsubscribe = onSnapshot(
      ordersQuery,
      async (snapshot) => {
        console.log(`🔔 Real-time update: ${snapshot.docs.length} orders`)
        const orders = []

        // Extract orders from snapshot
        snapshot.forEach((orderDoc) => {
          const ref = orderDoc.ref
          const pathSegments = ref.path.split('/')
          const userId = pathSegments[1] // users/{userId}/orders/{orderId}

          orders.push({
            id: orderDoc.id,
            userId: userId,
            ...orderDoc.data(),
          })
        })

        // Sort by updatedAt descending in JavaScript (avoids index requirement)
        orders.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0
          const timeB = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0
          return timeB - timeA
        })

        // Fetch user details for each order
        if (orders.length > 0) {
          console.log('👥 Fetching user details...')
          const userIds = [...new Set(orders.map(o => o.userId))]

          for (const userId of userIds) {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId))
              if (userDoc.exists()) {
                const userData = userDoc.data()
                orders.forEach(order => {
                  if (order.userId === userId) {
                    order.userName = userData.name || 'Unknown'
                    order.userEmail = userData.email || ''
                    order.userPhone = userData.phone || ''
                  }
                })
              }
            } catch (e) {
              console.warn(`Could not fetch user ${userId}:`, e.message)
            }
          }
        }

        console.log(`✅ Real-time listener: ${orders.length} total orders with user data`)
        onSuccess(orders)
      },
      (error) => {
        console.error('❌ Real-time listener error:', error.message)
        onError(error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('❌ Error setting up real-time listener:', error)
    onError(error)
    return () => {}
  }
}

// Delete an order
export const deleteOrder = async (userId, orderId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'orders', orderId))
    console.log(`✅ Order ${orderId} deleted`)
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}
