import {
  collectionGroup,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  where
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Subscribe to all lab appointments across all users for real-time updates.
 */
export const subscribeToLabAppointments = (callback) => {
  const q = query(collectionGroup(db, 'labAppointments'))
  
  return onSnapshot(q, (snapshot) => {
    const appointments = []
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      const userId = docSnap.ref.parent.parent?.id
      
      appointments.push({
        id: docSnap.id,
        userId: userId || 'unknown',
        ref: docSnap.ref,
        ...data,
      })
    })

    appointments.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })
    
    callback(appointments)
  }, (error) => {
    console.error('Error in lab appointments listener:', error)
  })
}

/**
 * Subscribe to lab appointments assigned to a specific lab.
 */
export const listenToLabAppointments = (labId, callback) => {
  const q = query(
    collectionGroup(db, 'labAppointments'),
    where('assignedLabId', '==', labId)
  )
  
  return onSnapshot(q, (snapshot) => {
    const appointments = []
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      const userId = docSnap.ref.parent.parent?.id
      
      appointments.push({
        id: docSnap.id,
        userId: userId || 'unknown',
        ref: docSnap.ref,
        ...data,
      })
    })

    appointments.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })
    
    callback(appointments)
  }, (error) => {
    console.error(`Error in lab ${labId} appointments listener:`, error)
  })
}

/**
 * Fetch all lab appointments across all users using a collectionGroup query.
 */
export const getAllLabAppointments = async () => {
  try {
    // collectionGroup queries require an index if we use order by or where clauses.
    // We fetch all documents in the 'labAppointments' subcollections.
    const q = query(collectionGroup(db, 'labAppointments'))
    const snapshot = await getDocs(q)
    
    const appointments = []
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      // The parent of a subcollection document is the subcollection itself.
      // The parent of the subcollection is the user document.
      // e.g. path: users/{userId}/labAppointments/{docId}
      const userId = docSnap.ref.parent.parent?.id
      
      appointments.push({
        id: docSnap.id,
        userId: userId || 'unknown',
        ref: docSnap.ref, // Storing the full reference makes updating easy
        ...data,
      })
    })

    // Sort descending by createdAt (newest first)
    // We sort client-side to avoid needing a complex composite index right away.
    appointments.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })
    
    console.log(`✅ Fetched ${appointments.length} lab appointments`)
    return appointments
  } catch (error) {
    console.error('Error fetching lab appointments:', error)
    throw error
  }
}

/**
 * Update the status of a specific lab appointment.
 * 
 * @param {Object} appointmentRef - The Firestore document reference of the appointment
 * @param {string} newStatus - The new status ('Pending', 'Confirmed', 'Completed', 'Cancelled')
 */
export const updateAppointmentStatus = async (appointmentRef, newStatus) => {
  try {
    await updateDoc(appointmentRef, {
      status: newStatus,
      updatedAt: new Date()
    })
    console.log(`✅ Appointment status updated to ${newStatus}`)
  } catch (error) {
    console.error('Error updating appointment status:', error)
    throw error
  }
}
