import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION_NAME = 'doctors'

// Get all doctors
export const getDoctors = async () => {
  try {
    const collectionRef = collection(db, COLLECTION_NAME)
    const snapshot = await getDocs(collectionRef)
    
    const doctors = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      doctors.push({
        id: doc.id,
        ...data
      })
    })
    
    console.log(`✅ Fetched ${doctors.length} doctors`)
    return doctors
  } catch (error) {
    console.error('Error in getDoctors():', error)
    return []
  }
}

// Get a single doctor by ID
export const getDoctorById = async (doctorId) => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    
    let doctor = null
    snapshot.forEach((doc) => {
      if (doc.id === doctorId) {
        doctor = {
          id: doc.id,
          ...doc.data()
        }
      }
    })
    
    if (doctor) {
      console.log(`✅ Fetched doctor: ${doctorId}`)
      return doctor
    } else {
      throw new Error('Doctor not found')
    }
  } catch (error) {
    console.error('Error fetching doctor:', error)
    throw error
  }
}

// Add a new doctor
export const addDoctor = async (doctorData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...doctorData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log(`✅ Doctor added with ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error('Error adding doctor:', error)
    throw error
  }
}

// Update a doctor
export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const doctorRef = doc(db, COLLECTION_NAME, doctorId)
    await updateDoc(doctorRef, {
      ...doctorData,
      updatedAt: Timestamp.now(),
    })
    console.log(`✅ Doctor ${doctorId} updated`)
  } catch (error) {
    console.error('Error updating doctor:', error)
    throw error
  }
}

// Delete a doctor
export const deleteDoctor = async (doctorId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, doctorId))
    console.log(`✅ Doctor deleted`)
  } catch (error) {
    console.error('Error deleting doctor:', error)
    throw error
  }
}
