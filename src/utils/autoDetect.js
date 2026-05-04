import { db } from '../services/firebase'
import { collection, getDocs } from 'firebase/firestore'

/**
 * Automatically detect database structure
 * Returns all collections and sample data
 */
export const detectDatabaseStructure = async () => {
  try {
    console.log('🔍 Scanning Firestore database...')

    // List of common collection names to check
    const commonCollections = [
      'users',
      'products',
      'orders',
      'categories',
      'customers',
      'items',
      'transactions',
      'sales',
      'purchases',
      'inventory',
      'reviews',
      'payments',
      'cart',
      'wishlist',
      'subscriptions',
      'notifications',
      'settings',
      'analytics',
    ]

    const structure = {}
    const foundCollections = []

    for (const collectionName of commonCollections) {
      try {
        const docsSnapshot = await getDocs(collection(db, collectionName))
        
        if (docsSnapshot.size > 0) {
          foundCollections.push(collectionName)
          const sampleDoc = docsSnapshot.docs[0]
          const data = sampleDoc.data()
          
          structure[collectionName] = {
            count: docsSnapshot.size,
            isEmpty: false,
            fields: Object.keys(data),
            sampleId: sampleDoc.id,
            sampleData: data,
          }
          
          console.log(`✅ ${collectionName}: ${docsSnapshot.size} documents`)
          console.log(`   Fields: ${Object.keys(data).join(', ')}`)
        }
      } catch (error) {
        // Collection doesn't exist, skip
      }
    }

    console.log('\n📊 Collections Found:')
    console.log(foundCollections)
    console.log('\n📋 Full Structure:')
    console.log(JSON.stringify(structure, null, 2))

    return { collections: foundCollections, structure }
  } catch (error) {
    console.error('Error detecting structure:', error)
    throw error
  }
}

/**
 * Find products collection by name
 * Checks common product collection names
 */
export const findProductsCollection = async () => {
  const commonNames = ['products', 'items', 'goods', 'inventory', 'product', 'item']
  
  for (const name of commonNames) {
    try {
      const docsSnapshot = await getDocs(collection(db, name))
      if (docsSnapshot.size > 0) {
        console.log(`✅ Found products collection: "${name}"`)
        return name
      }
    } catch (error) {
      // Collection doesn't exist, continue
    }
  }
  
  console.warn('⚠️ No products collection found')
  return null
}

/**
 * Find orders collection by name
 * Checks common order collection names
 */
export const findOrdersCollection = async () => {
  const commonNames = ['orders', 'transactions', 'sales', 'purchases', 'order']
  
  for (const name of commonNames) {
    try {
      const docsSnapshot = await getDocs(collection(db, name))
      if (docsSnapshot.size > 0) {
        console.log(`✅ Found orders collection: "${name}"`)
        return name
      }
    } catch (error) {
      // Collection doesn't exist, continue
    }
  }
  
  console.warn('⚠️ No orders collection found')
  return null
}
