import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { ROLES } from '../config/rbac'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null) // 'ADMIN', 'MEDICAL_STORE', 'LABORATORY'
  const [entityId, setEntityId] = useState(null)
  const [entityData, setEntityData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Fetch role from Firestore adminUsers collection
        try {
          const adminDoc = await getDoc(doc(db, 'adminUsers', currentUser.uid))
          if (adminDoc.exists()) {
            const data = adminDoc.data()
            const userRole = data.role || ROLES.ADMIN // default to ADMIN for legacy
            setRole(userRole)
            console.log(`✅ User role loaded: ${userRole}`)

            if (userRole === ROLES.MEDICAL_STORE && data.linkedEntityId) {
              setEntityId(data.linkedEntityId)
              const storeDoc = await getDoc(doc(db, 'medicalStores', data.linkedEntityId))
              if (storeDoc.exists()) {
                setEntityData(storeDoc.data())
              }
            } else if (userRole === ROLES.LABORATORY && data.linkedEntityId) {
              setEntityId(data.linkedEntityId)
              const labDoc = await getDoc(doc(db, 'laboratories', data.linkedEntityId))
              if (labDoc.exists()) {
                setEntityData(labDoc.data())
              }
            }
          } else {
            // No adminUsers doc found — deny access
            console.error('❌ No adminUsers doc found, access denied')
            setRole(null)
            await signOut(auth)
          }
        } catch (error) {
          console.error('❌ Error fetching user role:', error)
          setRole(null)
        }
      } else {
        setUser(null)
        setRole(null)
        setEntityId(null)
        setEntityData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
      console.log('User logged out')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    user,
    role,
    entityId,
    entityData,
    loading,
    logout,
    isAdmin: role === ROLES.ADMIN,
    isMedicalStore: role === ROLES.MEDICAL_STORE,
    isLaboratory: role === ROLES.LABORATORY,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
