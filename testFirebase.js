import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
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

const makeAdmin = async () => {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'arunprajapat629@gmail.com', 'Karan@6684')
    const uid = cred.user.uid
    console.log('Logged in! UID:', uid)
    
    const adminRef = doc(db, 'adminUsers', uid)
    const adminDoc = await getDoc(adminRef)
    if (!adminDoc.exists()) {
      console.log('Creating admin record...')
      await setDoc(adminRef, { role: 'admin', email: 'arunprajapat629@gmail.com' })
      console.log('Admin record created!')
    } else {
      console.log('Admin record already exists:', adminDoc.data())
    }
  } catch(e) {
    console.error(e)
  }
}
makeAdmin()
