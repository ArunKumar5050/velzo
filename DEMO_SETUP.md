# Demo Setup Guide

This guide will help you populate your dashboard with sample data for testing.

## 📝 Sample Products Data

Here's sample data to add to your Firestore `products` collection:

### Sample Product 1
```json
{
  "name": "Wireless Headphones Pro",
  "category": "Electronics",
  "price": 199.99,
  "description": "Premium wireless headphones with noise cancellation and 30-hour battery life",
  "stock": 45,
  "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Sample Product 2
```json
{
  "name": "Premium Leather Watch",
  "category": "Accessories",
  "price": 149.99,
  "description": "Classic design with genuine leather strap and water-resistant dial",
  "stock": 32,
  "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "createdAt": "2024-01-14T14:20:00Z",
  "updatedAt": "2024-01-14T14:20:00Z"
}
```

### Sample Product 3
```json
{
  "name": "Ultra-Fast USB-C Cable",
  "category": "Electronics",
  "price": 24.99,
  "description": "3-meter fast charging cable with data transfer capability",
  "stock": 150,
  "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
  "createdAt": "2024-01-13T09:15:00Z",
  "updatedAt": "2024-01-13T09:15:00Z"
}
```

## 📦 Sample Orders Data

Here's sample data to add to your Firestore `orders` collection:

### Sample Order 1
```json
{
  "userId": "user_001",
  "itemCount": 2,
  "totalPrice": 224.98,
  "status": "pending",
  "notes": "Customer requested expedited shipping",
  "createdAt": "2024-01-16T08:30:00Z",
  "updatedAt": "2024-01-16T08:30:00Z"
}
```

### Sample Order 2
```json
{
  "userId": "user_002",
  "itemCount": 1,
  "totalPrice": 199.99,
  "status": "confirmed",
  "notes": "Payment verified",
  "createdAt": "2024-01-15T16:45:00Z",
  "updatedAt": "2024-01-16T10:20:00Z"
}
```

### Sample Order 3
```json
{
  "userId": "user_003",
  "itemCount": 3,
  "totalPrice": 374.97,
  "status": "delivered",
  "notes": "Delivered on scheduled date",
  "createdAt": "2024-01-14T11:00:00Z",
  "updatedAt": "2024-01-16T14:30:00Z"
}
```

## 🔧 How to Add Sample Data

### Option 1: Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Click "Create collection" → enter `products`
5. Click "Add document" and paste the sample JSON
6. Repeat for `orders` collection

### Option 2: Programmatically
Create a `seedData.js` file in your project:

```javascript
import { addProduct } from './src/services/productService'
import { addOrder } from './src/services/orderService'

async function seedDatabase() {
  // Add sample products
  await addProduct({
    name: "Wireless Headphones Pro",
    category: "Electronics",
    price: 199.99,
    description: "Premium wireless headphones with noise cancellation",
    stock: 45,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  })

  // Add sample orders
  await addOrder({
    userId: "user_001",
    itemCount: 2,
    totalPrice: 224.98,
    status: "pending",
    notes: "Customer requested expedited shipping"
  })

  console.log('✅ Sample data added successfully!')
}

seedDatabase()
```

Then run in browser console.

## ✅ Testing Checklist

After setting up sample data:

- [ ] Dashboard shows correct totals
- [ ] Products page displays all items
- [ ] Orders page shows all orders
- [ ] Can add new products from "Add Product" page
- [ ] Can update order status
- [ ] Delete functionality works
- [ ] Toast notifications appear
- [ ] Responsive design works on mobile

## 🎨 UI Testing Tips

- **Light Mode**: Check all colors display correctly
- **Shadows**: Verify card shadows are subtle but visible
- **Hover Effects**: Test interactive elements respond smoothly
- **Animations**: Check fade-in and scale animations work
- **Mobile**: Test on 375px and 768px viewports
- **Navigation**: Verify active link highlighting

## 🚀 Next Steps

1. Add authentication (Firebase Auth)
2. Add user profile management
3. Add advanced filtering/search
4. Add CSV export functionality
5. Add charts/graphs for analytics
6. Add dark mode toggle
7. Add image upload to Firebase Storage
8. Add pagination for large datasets
