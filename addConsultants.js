import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

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
const auth = getAuth(app)

const dummyDoctors = [
  {
    name: 'Dr. Ramesh Kumar',
    specialty: 'General Physician',
    whatsapp: '919876543210',
    imageUrl: '',
    available: true,
    experience: '12 years',
    rating: 4.8
  },
  {
    name: 'Dr. Sarah Smith',
    specialty: 'Dermatologist',
    whatsapp: '919876543211',
    imageUrl: '',
    available: true,
    experience: '8 years',
    rating: 4.9
  },
  {
    name: 'Dr. Rahul Sharma',
    specialty: 'Pediatrician',
    whatsapp: '919876543212',
    imageUrl: '',
    available: true,
    experience: '15 years',
    rating: 4.7
  },
  {
    name: 'Dr. Anita Desai',
    specialty: 'Dietitian & Nutritionist',
    whatsapp: '919876543213',
    imageUrl: '',
    available: true,
    experience: '10 years',
    rating: 4.6
  }
];

const addDoctors = async () => {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'arunprajapat629@gmail.com', 'Karan@6684')
    console.log('Logged in as Admin! UID:', cred.user.uid)
    
    const doctorsRef = collection(db, 'doctors');
    
    for (const doc of dummyDoctors) {
      const docRef = await addDoc(doctorsRef, doc);
      console.log('Added doctor:', doc.name, 'with ID:', docRef.id);
    }
    
    console.log('Successfully added all dummy doctors!');
    process.exit(0);
  } catch(e) {
    console.error('Error adding doctors:', e)
    process.exit(1);
  }
}

addDoctors();
