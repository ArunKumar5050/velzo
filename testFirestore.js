import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, or, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "fake",
  authDomain: "onway-f5999.firebaseapp.com",
  projectId: "onway-f5999",
  storageBucket: "onway-f5999.appspot.com",
  messagingSenderId: "fake",
  appId: "fake"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(
      collection(db, 'products'),
      or(
        where('category', 'array-contains', 'Medicine'),
        where('category', '==', 'Medicine')
      )
    );
    const snap = await getDocs(q);
    console.log('Products found:', snap.docs.length);
    snap.docs.forEach(d => console.log(d.id, d.data().name, d.data().category, d.data().price, d.data().stock));
  } catch (err) {
    console.error('FIREBASE ERROR:', err);
  }
  process.exit(0);
}

test();
