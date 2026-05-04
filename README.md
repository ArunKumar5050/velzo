# 🎯 ONWAY Admin Dashboard

A modern, professional SaaS-style Admin Dashboard built with React (Vite), Tailwind CSS, React Router, and Firebase Firestore.

## ✨ Features

- **Modern Dashboard UI** - Professional design inspired by Shopify, Stripe, and modern admin panels
- **Dark Sidebar Navigation** - Fixed sidebar with active link highlighting
- **Responsive Layout** - Works seamlessly on desktop and tablet
- **Product Management** - Full CRUD operations for products
- **Order Management** - Track and manage customer orders with status updates
- **Beautiful Components** - Reusable, polished UI components (Cards, Buttons, Modals)
- **Real-time Data** - Firebase Firestore integration for live data
- **Status Badges** - Color-coded order status indicators
- **Smooth Animations** - Transitions and fade-in effects
- **Empty States** - User-friendly empty state messages
- **Loading States** - Spinner during data fetching
- **Toast Notifications** - Success/error alerts using react-hot-toast

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router v6
- **Backend**: Firebase Firestore
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   └── index.js
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── AddProduct.jsx
│   │   └── Orders.jsx
│   ├── services/           # Firebase operations
│   │   ├── firebase.js
│   │   ├── productService.js
│   │   └── orderService.js
│   ├── App.jsx            # Main app with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- A Firebase project with Firestore enabled

### Installation

1. **Clone or extract the project**
```bash
cd "onway admin"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Get your Firebase config credentials
   - Update `src/services/firebase.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

4. **Start the development server**
```bash
npm run dev
```

The app will open automatically at `http://localhost:5173`

5. **Build for production**
```bash
npm run build
```

## 📊 Pages & Features

### 1. Dashboard
- **4 Summary Cards**: Total Products, Total Orders, Pending Orders, Total Revenue
- **Recent Orders Table**: Shows last 5 orders with status
- **Recent Products Grid**: Shows last 3 products
- **Trend Indicators**: Shows % change from previous month

### 2. Products
- **Table View**: All products with image, name, category, price, stock
- **Edit/Delete Actions**: Inline action buttons
- **Add Product Button**: Quick access to add new product
- **Empty State**: Helpful message when no products

### 3. Add Product
- **Centered Form Card**: Professional form design
- **Floating Labels**: Smooth, modern input fields
- **Image Preview**: Live image preview
- **Validation**: Required field checks
- **Success Toast**: Confirmation message on success

### 4. Orders
- **Expandable Order Cards**: Click to view details
- **Status Management**: Change order status with buttons
- **Color-coded Status Badges**: Visual status indicators
- **Order Stats**: Summary of pending, confirmed, delivered
- **Order Details**: User ID, item count, total price, created date

## 🎨 Design System

### Colors
- **Primary Blue**: #3B82F6
- **Success Green**: #10B981
- **Warning Orange**: #F59E0B
- **Danger Red**: #EF4444

### Components

#### Button
```jsx
<Button variant="primary" size="md">
  Click me
</Button>
```

#### Card
```jsx
<Card hoverable>
  <p>Card content</p>
</Card>
```

#### StatCard
```jsx
<StatCard
  icon={PackageIcon}
  title="Total Products"
  value={42}
  color="blue"
  trend={12}
/>
```

## 🔥 Firebase Firestore Structure

### Collections

#### `products`
```json
{
  "name": "Product Name",
  "category": "Electronics",
  "price": 99.99,
  "description": "Product description",
  "stock": 50,
  "image": "https://...",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `orders`
```json
{
  "userId": "user123",
  "itemCount": 3,
  "totalPrice": 299.99,
  "status": "pending",
  "notes": "Optional notes",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 👨‍💻 Usage Examples

### Fetch Products
```javascript
import { getProducts } from './services/productService'

const products = await getProducts()
```

### Add Order
```javascript
import { addOrder } from './services/orderService'

await addOrder({
  userId: 'user123',
  itemCount: 2,
  totalPrice: 199.99,
  status: 'pending'
})
```

### Show Toast
```javascript
import toast from 'react-hot-toast'

toast.success('Operation successful')
toast.error('Something went wrong')
```

## 🎯 Key UI/UX Features

✅ **Soft Shadows**: Cards use subtle shadows for depth
✅ **Smooth Transitions**: 200ms transitions for all interactive elements
✅ **Rounded Corners**: 2xl (rounded-2xl) for cards for modern look
✅ **Hover Effects**: Elevate cards on hover
✅ **Active States**: Clear visual feedback for active navigation
✅ **Animations**: Fade-in and slide-in animations
✅ **Responsive**: Mobile-first design principles
✅ **Dark Sidebar**: Professional contrast with light content
✅ **Empty States**: Helpful guidance when no data
✅ **Loading States**: Clear feedback during data fetching

## 🔄 State Management

The app uses React hooks for state management:
- `useState` for local component state
- `useEffect` for side effects and data fetching
- `useNavigate` for routing

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `src/services/firebase.js`
- Check Firestore rules allow read/write access
- Ensure Firestore database is enabled in Firebase Console

### Styling Issues
- Clear Tailwind cache: `npm run build` then `npm run dev`
- Verify tailwind.config.js has correct content paths

### Port Already in Use
- Change port in vite.config.js `server.port`
- Or kill process on port 5173

## 🤝 Contributing

Feel free to customize:
- Colors in `tailwind.config.js`
- Component styles in component files
- Add more pages/routes in `src/pages/`
- Extend services for more Firestore collections

## 📄 License

This project is open source and available for personal and commercial use.

## 🎉 Ready to Use!

The dashboard is production-ready with:
- Clean, maintainable code structure
- Reusable components
- Professional styling
- Error handling
- Loading states
- Toast notifications
- Responsive design

Happy coding! 🚀
