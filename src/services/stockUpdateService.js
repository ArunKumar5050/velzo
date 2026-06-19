/**
 * Stock Update Service
 * Matches extracted bill items against existing Firestore products,
 * then updates existing ones or creates new ones.
 */

import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION_NAME = 'products'

/**
 * Normalize a product name for fuzzy matching.
 * Lowercases, removes extra spaces, strips common suffixes/units.
 */
const normalizeName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check how well two product names match.
 * Returns a score between 0 (no match) and 1 (exact match).
 */
const calculateMatchScore = (extractedName, existingName) => {
  const a = normalizeName(extractedName)
  const b = normalizeName(existingName)

  // Exact match only (ignoring case and extra spaces)
  if (a === b) return 1.0

  // If not an exact match, do not associate them
  return 0
}

/**
 * Find the best matching product from a list of existing products.
 * Returns { product, score } or null if no good match found.
 */
const findBestMatch = (itemName, existingProducts) => {
  let bestMatch = null
  let bestScore = 0

  for (const product of existingProducts) {
    const score = calculateMatchScore(itemName, product.name || '')
    if (score > bestScore) {
      bestScore = score
      bestMatch = product
    }
  }

  // Threshold: require at least 0.5 score to consider a match
  if (bestScore >= 0.5 && bestMatch) {
    return { product: bestMatch, score: bestScore }
  }

  return null
}

/**
 * Pre-match all extracted items against existing products.
 * Returns items annotated with match info for UI review.
 *
 * @param {Array<{name, price, quantity}>} extractedItems
 * @returns {Promise<Array<{name, price, quantity, matchStatus, matchedProduct}>>}
 */
export const preMatchItems = async (extractedItems) => {
  // Fetch all existing products once
  const snapshot = await getDocs(collection(db, COLLECTION_NAME))
  const existingProducts = []
  snapshot.forEach((docSnap) => {
    existingProducts.push({
      docId: docSnap.id,
      ...docSnap.data(),
    })
  })

  return extractedItems.map((item) => {
    const match = findBestMatch(item.name, existingProducts)
    if (match) {
      return {
        ...item,
        matchStatus: 'existing',
        matchedProduct: match.product,
        matchScore: match.score,
        matchedName: match.product.name,
        currentStock: match.product.stock || 0,
        currentPrice: match.product.price || 0,
      }
    } else {
      return {
        ...item,
        matchStatus: 'new',
        matchedProduct: null,
        matchScore: 0,
        matchedName: null,
        currentStock: 0,
        currentPrice: 0,
      }
    }
  })
}

/**
 * Commit the reviewed items to Firestore.
 * Updates existing products (increment stock, update price).
 * Creates new products for unmatched items.
 *
 * @param {Array} reviewedItems - Items after user review/edit
 * @returns {Promise<{updated: number, created: number, errors: string[]}>}
 */
export const commitStockUpdates = async (reviewedItems) => {
  const results = { updated: 0, created: 0, errors: [] }

  for (const item of reviewedItems) {
    try {
      if (item.matchStatus === 'existing' && item.matchedProduct) {
        // Update existing product: increment stock, update price
        const productRef = doc(db, COLLECTION_NAME, item.matchedProduct.docId)
        const newStock = (item.matchedProduct.stock || 0) + item.quantity
        
        await updateDoc(productRef, {
          stock: newStock,
          price: item.price,
          updatedAt: Timestamp.now(),
        })
        results.updated++
      } else {
        // Create new product
        await addDoc(collection(db, COLLECTION_NAME), {
          name: item.name,
          price: item.price,
          stock: item.quantity,
          category: ['Medicine'],
          imageUrl: '',
          description: '',
          brand: '',
          id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        results.created++
      }
    } catch (error) {
      console.error(`Error processing "${item.name}":`, error)
      results.errors.push(`${item.name}: ${error.message}`)
    }
  }

  return results
}
