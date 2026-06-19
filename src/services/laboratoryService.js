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

const COLLECTION_NAME = 'laboratories'

export const getLaboratories = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    const labs = []
    snapshot.forEach((doc) => {
      labs.push({ id: doc.id, ...doc.data() })
    })
    return labs
  } catch (error) {
    console.error('Error getting laboratories:', error)
    throw error
  }
}

export const getLaboratoryById = async (labId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, labId)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting laboratory:', error)
    throw error
  }
}

export const addLaboratory = async (labData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...labData,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding laboratory:', error)
    throw error
  }
}

export const updateLaboratory = async (labId, labData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, labId)
    await updateDoc(docRef, {
      ...labData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating laboratory:', error)
    throw error
  }
}

export const deleteLaboratory = async (labId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, labId))
  } catch (error) {
    console.error('Error deleting laboratory:', error)
    throw error
  }
}

export const getLabsByPincode = async (pincode) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('serviceAreas', 'array-contains', pincode),
      where('isActive', '==', true)
    )
    const snapshot = await getDocs(q)
    const labs = []
    snapshot.forEach((doc) => {
      labs.push({ id: doc.id, ...doc.data() })
    })
    return labs
  } catch (error) {
    console.error('Error querying labs by pincode:', error)
    throw error
  }
}
