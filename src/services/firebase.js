import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCHPn-jMxmflg2cJPccFFue8o1SpSzVyNM',
  authDomain: 'onway-f5999.firebaseapp.com',
  projectId: 'onway-f5999',
  storageBucket: 'onway-f5999.firebasestorage.app',
  messagingSenderId: '40420149902',
  appId: '1:40420149902:web:8fcfcb3279f0ade03a97df',
  measurementId: 'G-8F47CPBZD8',
}

// Initialize Firebase Primary App
const app = initializeApp(firebaseConfig)

// Initialize Firebase Secondary App (Used exclusively for creating partner accounts without logging out Admin)
const secondaryApp = initializeApp(firebaseConfig, 'Secondary')

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)
export const secondaryAuth = getAuth(secondaryApp)

console.log('✅ Firebase initialized for admin dashboard')

export default app
