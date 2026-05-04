// Quick Firebase test script
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCHPn-jMxmflg2cJPccFFue8o1SpSzVyNM',
  authDomain: 'onway-f5999.firebaseapp.com',
  projectId: 'onway-f5999',
  storageBucket: 'onway-f5999.firebasestorage.app',
  messagingSenderId: '40420149902',
  appId: '1:40420149902:web:8fcfcb3279f0ade03a97df',
  measurementId: 'G-8F47CPBZD8',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

console.log('🔍 Testing Firebase connection...')
console.log('Firebase initialized:', app.name)
console.log('Firestore DB:', db)

// Test getting products
const testGetProducts = async () => {
  try {
    console.log('\n📊 Fetching from "products" collection...')
    const snapshot = await getDocs(collection(db, 'products'))
    console.log(`✅ Got snapshot with ${snapshot.size} documents`)
    
    const products = []
    snapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`)
      console.log(`Data:`, doc.data())
      products.push({ id: doc.id, ...doc.data() })
    })
    
    console.log(`\n✅ Total products fetched: ${products.length}`)
    console.log('Products:', JSON.stringify(products, null, 2))
    
    return products
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
  }
}

testGetProducts()
