import { db } from '../services/firebase'
import { collection, getDocs } from 'firebase/firestore'

/**
 * Scan all possible collection names to find products
 */
export const scanAllCollections = async () => {
  console.log('🔍 Scanning for all collections with data...\n')

  // Extensive list of possible collection names
  const possibleNames = [
    // Common English names
    'products', 'items', 'goods', 'inventory', 'product', 'item',
    'articles', 'catalog', 'shop', 'store', 'merchandise',
    
    // Variations
    'Products', 'Items', 'Goods', 'Product', 'Item',
    'PRODUCTS', 'ITEMS', 'GOODS',
    
    // With prefixes/suffixes
    'all_products', 'all_items', 'shop_products', 'store_items',
    'product_list', 'item_list', 'goods_list',
    
    // Singular/plural
    'good', 'merchandise', 'articles', 'listings',
    
    // Other variations
    'services', 'offerings', 'models', 'sku', 'skus',
    'collection', 'collections', 'data', 'records',
  ]

  const collections = []

  for (const collectionName of possibleNames) {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      
      if (snapshot.size > 0) {
        const sampleDoc = snapshot.docs[0]
        const data = sampleDoc.data()
        
        collections.push({
          name: collectionName,
          count: snapshot.size,
          fields: Object.keys(data),
          sampleData: data,
        })

        console.log(`✅ FOUND: "${collectionName}" with ${snapshot.size} documents`)
        console.log(`   Fields: ${Object.keys(data).join(', ')}`)
        console.log(`   Sample data:`, data)
        console.log('')
      }
    } catch (error) {
      // Collection doesn't exist, skip silently
    }
  }

  if (collections.length === 0) {
    console.warn('❌ No collections found with any data!')
    console.log('Make sure:')
    console.log('1. Firebase is properly configured')
    console.log('2. Firestore database has collections')
    console.log('3. Collections have documents')
  } else {
    console.log(`\n📊 Total collections found: ${collections.length}`)
    console.log('\n✅ Copy the collection name you want to use in Products page')
  }

  return collections
}

export default scanAllCollections
