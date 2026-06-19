import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, setDoc, Timestamp, addDoc } from 'firebase/firestore'
import { db, secondaryAuth } from './firebase'
import { ROLES } from '../config/rbac'

/**
 * Creates a Medical Store partner and their admin user account.
 * Uses secondaryAuth to avoid logging out the current admin.
 */
export const createMedicalStorePartner = async (storeData, authData) => {
  try {
    // 1. Create User in Secondary Auth
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      authData.email,
      authData.password
    )
    const user = userCredential.user

    // 2. Create the Medical Store document in Firestore
    const storeRef = await addDoc(collection(db, 'medicalStores'), {
      ...storeData,
      email: authData.email,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    // 3. Create the adminUsers linkage document
    await setDoc(doc(db, 'adminUsers', user.uid), {
      email: authData.email,
      role: ROLES.MEDICAL_STORE,
      linkedEntityId: storeRef.id,
      createdAt: Timestamp.now(),
    })

    // 4. Sign out the secondary auth so it doesn't persist
    await signOut(secondaryAuth)

    return { success: true, storeId: storeRef.id, uid: user.uid }
  } catch (error) {
    console.error('Error creating Medical Store partner:', error)
    // Make sure we sign out secondary Auth even if it fails midway
    if (secondaryAuth.currentUser) {
      await signOut(secondaryAuth).catch(console.error)
    }
    throw error
  }
}

/**
 * Creates a Laboratory partner and their admin user account.
 * Uses secondaryAuth to avoid logging out the current admin.
 */
export const createLaboratoryPartner = async (labData, authData) => {
  try {
    // 1. Create User in Secondary Auth
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      authData.email,
      authData.password
    )
    const user = userCredential.user

    // 2. Create the Laboratory document in Firestore
    const labRef = await addDoc(collection(db, 'laboratories'), {
      ...labData,
      email: authData.email,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    // 3. Create the adminUsers linkage document
    await setDoc(doc(db, 'adminUsers', user.uid), {
      email: authData.email,
      role: ROLES.LABORATORY,
      linkedEntityId: labRef.id,
      createdAt: Timestamp.now(),
    })

    // 4. Sign out the secondary auth so it doesn't persist
    await signOut(secondaryAuth)

    return { success: true, labId: labRef.id, uid: user.uid }
  } catch (error) {
    console.error('Error creating Laboratory partner:', error)
    if (secondaryAuth.currentUser) {
      await signOut(secondaryAuth).catch(console.error)
    }
    throw error
  }
}
