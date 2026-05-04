import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Common collection names to try
const COLLECTION_NAMES = ['products', 'items', 'goods', 'inventory']

let PRODUCTS_COLLECTION = null

// Auto-detect collection name
const getCollectionName = async () => {
  if (PRODUCTS_COLLECTION) return PRODUCTS_COLLECTION

  for (const collectionName of COLLECTION_NAMES) {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      if (snapshot.size > 0 || collectionName === 'products') {
        PRODUCTS_COLLECTION = collectionName
        console.log(`✅ Using collection: "${collectionName}"`)
        return collectionName
      }
    } catch (error) {
      // Try next collection
    }
  }

  PRODUCTS_COLLECTION = 'products'
  return PRODUCTS_COLLECTION
}

// Get all products
export const getProducts = async () => {
  try {
    const collectionName = 'products'
    const collectionRef = collection(db, collectionName)
    const snapshot = await getDocs(collectionRef)
    
    const products = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Use product's internal id if it exists, otherwise use Firestore doc.id
      products.push({
        docId: doc.id, // Firestore document ID (for delete/update operations)
        id: data.id || doc.id, // Product's internal id
        ...data
      })
    })
    
    console.log(`✅ Fetched ${products.length} products`)
    return products
  } catch (error) {
    console.error('Error in getProducts():', error)
    return []
  }
}

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const collectionName = 'products'
    const snapshot = await getDocs(collection(db, collectionName))
    
    let product = null
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Match by internal id or by doc id
      if (data.id === productId || doc.id === productId) {
        product = {
          docId: doc.id, // Firestore document ID (for update operations)
          id: data.id || doc.id, // Product's internal id
          ...data
        }
      }
    })
    
    if (product) {
      console.log(`✅ Fetched product: ${productId}`)
      return product
    } else {
      throw new Error('Product not found')
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

// Add a new product
export const addProduct = async (productData) => {
  try {
    const collectionName = 'products'
    
    // Generate a unique ID for the product if not provided
    const productId = productData.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const docRef = await addDoc(collection(db, collectionName), {
      ...productData,
      id: productId, // Explicitly set the id field
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log(`✅ Product added with ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

// Update a product
export const updateProduct = async (productId, productData) => {
  try {
    const collectionName = 'products'
    const productRef = doc(db, collectionName, productId)
    await updateDoc(productRef, {
      ...productData,
      updatedAt: Timestamp.now(),
    })
    console.log(`✅ Product ${productId} updated`)
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    // productId can be either the product's internal id or the docId
    // We need to find and delete by Firestore document ID
    const collectionName = 'products'
    const snapshot = await getDocs(collection(db, collectionName))
    
    let docIdToDelete = null
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Match by internal id or by doc id
      if (data.id === productId || doc.id === productId) {
        docIdToDelete = doc.id
      }
    })
    
    if (docIdToDelete) {
      await deleteDoc(doc(db, collectionName, docIdToDelete))
      console.log(`✅ Product deleted`)
    } else {
      throw new Error('Product not found')
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}
