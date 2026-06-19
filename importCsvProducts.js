import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

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

async function importProducts() {
  console.log('Logging in as admin...');
  await signInWithEmailAndPassword(auth, 'arunprajapat629@gmail.com', 'Karan@6684');
  console.log('Logged in!');
  
  console.log('🚀 Starting to seed products from CSV...');
  
  const csvFilePath = path.join(process.cwd(), 'jai_suresh_medicose_products.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  const lines = fileContent.split('\n');
  
  let successCount = 0;
  
  // Start from line 1 to skip headers
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma
    const parts = line.split(',');
    
    if (parts.length >= 5) {
      const name = parts[0].trim();
      const priceStr = parts[1].trim();
      const price = priceStr ? parseFloat(priceStr) : 0;
      
   
      
      const brand = parts[parts.length - 1].trim();
      const description = parts.slice(3, parts.length - 1).join(',').trim();
      
      const product = {
        name: name,
        price: price,
        stock: 0,
        description: description,
        brand: brand,
        category: ['Medicine'],
        // Default fields based on schema seen in seedMedicalProducts.js
        originalPrice: price,
        dosageForm: name.toLowerCase().includes('syp') || name.toLowerCase().includes('syrup') ? 'Syrup' : name.toLowerCase().includes('inj') ? 'Injection' : name.toLowerCase().includes('drop') ? 'Drops' : 'Tablet/Capsule',
        manufacturer: brand,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/medicine-placeholder.jpg',
        prescriptionRequired: false,
        rating: 4.5,
        reviews: 0,
        deliveryTime: 15,
        returnDays: 0,
        warranty: null,
      };

      try {
        const productId = `med_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const docRef = await addDoc(collection(db, 'products'), {
          ...product,
          id: productId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ Added: ${product.name} (doc: ${docRef.id})`);
        successCount++;
        
        // Delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 50));
      } catch (error) {
        console.error(`❌ Failed to add ${product.name}:`, error.message);
      }
    } else {
        console.warn(`⚠️ Skipped line ${i + 1} due to insufficient columns: ${line}`);
    }
  }

  console.log(`\n🎉 Done! ${successCount} products added successfully.`);
  process.exit(0);
}

importProducts();
