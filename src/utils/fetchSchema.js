import { db } from '../services/firebase'
import { collection, getDocs, limit, query } from 'firebase/firestore'

/**
 * Fetch database schema from Firestore
 * Lists all collections and sample documents with their structure
 */
export const fetchDatabaseSchema = async () => {
  try {
    console.log('🔍 Fetching Firestore Database Schema...\n')

    // Common collection names to check
    const commonCollections = [
      'users',
      'products',
      'orders',
      'categories',
      'customers',
      'items',
      'transactions',
      'inventory',
      'reviews',
      'payments',
      'reviews',
      'cart',
      'wishlist',
      'subscriptions',
      'notifications',
      'settings',
      'analytics',
    ]

    const schema = {}
    let foundCollections = []

    // Check each common collection
    for (const collectionName of commonCollections) {
      try {
        const q = query(collection(db, collectionName), limit(1))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          foundCollections.push(collectionName)
          const sampleDoc = snapshot.docs[0]
          const data = sampleDoc.data()

          schema[collectionName] = {
            docCount: snapshot.size,
            sampleDocId: sampleDoc.id,
            fields: Object.keys(data),
            sampleData: data,
            fieldTypes: {},
          }

          // Determine field types
          for (const [key, value] of Object.entries(data)) {
            schema[collectionName].fieldTypes[key] = typeof value
          }

          console.log(`✅ Collection: ${collectionName}`)
          console.log(`   Fields: ${Object.keys(data).join(', ')}`)
          console.log(`   Sample Document:`, data)
          console.log('')
        }
      } catch (error) {
        // Collection doesn't exist, skip
      }
    }

    if (foundCollections.length === 0) {
      console.warn('⚠️ No common collections found in database')
      console.log('Collections might have different names.')
      console.log('Check Firebase Console for actual collection names.')
      return null
    }

    console.log(`\n📊 Found ${foundCollections.length} collections:`)
    console.log(foundCollections.join(', '))

    // Log full schema as JSON
    console.log('\n📋 Full Schema (JSON):')
    console.log(JSON.stringify(schema, null, 2))

    return schema
  } catch (error) {
    console.error('❌ Error fetching schema:', error)
    throw error
  }
}

/**
 * Fetch a specific collection with all documents
 */
export const fetchCollection = async (collectionName, limitCount = 10) => {
  try {
    console.log(`🔍 Fetching collection: ${collectionName}`)

    const q = query(collection(db, collectionName), limit(limitCount))
    const snapshot = await getDocs(q)

    const docs = []
    snapshot.forEach((doc) => {
      docs.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    console.log(`✅ Found ${docs.length} documents in ${collectionName}:`)
    console.log(JSON.stringify(docs, null, 2))

    return docs
  } catch (error) {
    console.error(`❌ Error fetching collection ${collectionName}:`, error)
    throw error
  }
}

/**
 * Display schema in a user-friendly format
 */
export const displaySchemaReport = (schema) => {
  if (!schema) {
    console.log('No schema data available')
    return
  }

  console.log('\n' + '='.repeat(80))
  console.log('📊 DATABASE SCHEMA REPORT')
  console.log('='.repeat(80) + '\n')

  for (const [collectionName, info] of Object.entries(schema)) {
    console.log(`📁 Collection: ${collectionName}`)
    console.log(`   Fields: ${info.fields.join(', ')}`)
    console.log(`   Field Types:`)
    for (const [field, type] of Object.entries(info.fieldTypes)) {
      console.log(`     • ${field}: ${type}`)
    }
    console.log('')
  }

  console.log('='.repeat(80) + '\n')
}
