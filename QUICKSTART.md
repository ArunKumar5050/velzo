# ⚡ Quick Start Guide

Get your ONWAY Admin Dashboard running in 5 minutes!

## 1️⃣ Install Dependencies
```bash
npm install
```

This will install:
- React 18
- Vite
- Tailwind CSS
- React Router
- Firebase
- Lucide Icons
- React Hot Toast

## 2️⃣ Configure Firebase

### Get Your Firebase Credentials:
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" → Create a new project
3. Name it "ONWAY Admin Dashboard"
4. Enable Firestore when prompted
5. Go to Project Settings (gear icon)
6. Copy "Your apps" web config
7. Open `src/services/firebase.js`
8. Replace the `firebaseConfig` object with your credentials

### Example Firebase Config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC9_3h5g7k9l0m1n2o3p4q5r6s7t8u9",
  authDomain: "onway-admin-a1b2c3.firebaseapp.com",
  projectId: "onway-admin-a1b2c3",
  storageBucket: "onway-admin-a1b2c3.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890klmn"
}
```

## 3️⃣ Start Development Server
```bash
npm run dev
```

The app opens automatically at `http://localhost:5173`

## 4️⃣ Add Sample Data (Optional)

Open [DEMO_SETUP.md](./DEMO_SETUP.md) and follow the guide to add sample products and orders via Firebase Console.

## 5️⃣ Start Building! 🎉

The dashboard is now running with Firestore integration ready.

---

## 🎯 Quick Features Reference

### View/Add Products
- Go to Products page
- Click "Add Product" button
- Fill form and submit
- View all products in table

### Manage Orders
- Go to Orders page
- Click order to expand details
- Change status with buttons

### View Dashboard
- Home page shows stats
- 4 summary cards with trends
- Recent orders & products

---

## 💡 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🔍 Firestore Collections Required

Make sure your Firestore has these collections:

```
📦 Firestore Database
├── 📁 products/
│   └── (documents with product data)
└── 📁 orders/
    └── (documents with order data)
```

---

## 🎨 Customize the Dashboard

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#YOUR_COLOR',
  success: '#YOUR_COLOR',
}
```

### Change Logo
Edit `src/components/Sidebar.jsx`:
```javascript
<h1 className="text-2xl font-bold">Your Brand Name</h1>
```

### Add More Pages
1. Create new file in `src/pages/`
2. Add route in `src/App.jsx`
3. Add sidebar link in `src/components/Sidebar.jsx`

---

## ⚠️ Common Issues

### ❌ "firebase is not a constructor"
**Fix**: Make sure firebaseConfig is correctly set in `src/services/firebase.js`

### ❌ "Cannot find module 'firebase'"
**Fix**: Run `npm install` again

### ❌ Port 5173 already in use
**Fix**: Change port in `vite.config.js` or kill process on port 5173

### ❌ Firestore returns empty
**Fix**: Check Firestore rules allow read/write access in Firebase Console

---

## 📚 Next Steps

- ✅ Read [README.md](./README.md) for full documentation
- ✅ Check [DEMO_SETUP.md](./DEMO_SETUP.md) to add sample data
- ✅ Customize components to match your brand
- ✅ Deploy to Firebase Hosting or Vercel

---

## 🚀 Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy
```

---

**You're all set! Happy coding! 🎉**

Have questions? Check the README.md file for more details.
