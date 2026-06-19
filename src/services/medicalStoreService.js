import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  Timestamp,
  query,
  where
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION_NAME = 'medicalStores'

export const getMedicalStores = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    const stores = []
    snapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() })
    })
    return stores
  } catch (error) {
    console.error('Error getting medical stores:', error)
    throw error
  }
}

export const getMedicalStoreById = async (storeId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, storeId)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting medical store:', error)
    throw error
  }
}

export const addMedicalStore = async (storeData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...storeData,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding medical store:', error)
    throw error
  }
}

export const updateMedicalStore = async (storeId, storeData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, storeId)
    await updateDoc(docRef, {
      ...storeData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating medical store:', error)
    throw error
  }
}

export const deleteMedicalStore = async (storeId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, storeId))
  } catch (error) {
    console.error('Error deleting medical store:', error)
    throw error
  }
}

export const getStoresByPincode = async (pincode) => {
  try {
    // Array-contains is used to find stores that service a particular pincode
    const q = query(
      collection(db, COLLECTION_NAME),
      where('serviceAreas', 'array-contains', pincode),
      where('isActive', '==', true)
    )
    const snapshot = await getDocs(q)
    const stores = []
    snapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() })
    })
    return stores
  } catch (error) {
    console.error('Error querying stores by pincode:', error)
    throw error
  }
}
