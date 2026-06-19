import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCHPn-jMxmflg2cJPccFFue8o1SpSzVyNM',
  authDomain: 'onway-f5999.firebaseapp.com',
  projectId: 'onway-f5999',
  storageBucket: 'onway-f5999.firebasestorage.app',
  messagingSenderId: '40420149902',
  appId: '1:40420149902:web:8fcfcb3279f0ade03a97df',
  measurementId: 'G-8F47CPBZD8',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function deleteImportedProducts() {
  try {
    console.log('Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'arunprajapat629@gmail.com', 'Karan@6684');
    console.log('Logged in!');
    
    console.log('Fetching recently imported products (category: "Medicine")...');
    
    // The previous script added products with category "Medicine"
    const q = query(collection(db, 'products'), where('category', '==', 'Medicine'));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} products to delete.`);
    
    let deleteCount = 0;
    
    for (const document of querySnapshot.docs) {
      await deleteDoc(doc(db, 'products', document.id));
      deleteCount++;
      if (deleteCount % 50 === 0) {
        console.log(`Deleted ${deleteCount} products...`);
      }
    }
    
    console.log(`\n🎉 Successfully deleted ${deleteCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteImportedProducts();
