import { useEffect, useState } from 'react'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner'
import { Modal } from '../components/Modal'
import { getProducts, deleteProduct } from '../services/productService'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export const Products = () => {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const CATEGORIES = [
    "Vitamins & Supplements",
    "Homeopathic Medicine",
    "Monitoring Devices",
    "Protein & Supplements",
    "Sexual Wellness",
    "Ayurvedic Wellness",
    "Food & Nutrition",
    "Skin Care",
    "Men Care",
    "Women Care",
    "Pain Relief",
    "Hair Care",
    "Oral Care",
    "Cold, Cough & Flu",
    "First Aid",
    "Mental Wellness",
    "Baby Care",
    "Respiratory Care",
    "Medicine",
    "Pharmacy",
    "Lab Tests",
    "Consultant",
    "Sunscreen",
    "Face Wash",
    "Lip Care",
    "Soap & Body Wash"
  ]

  useEffect(() => {
    fetchProducts()
  }, [location.key]) // Refetch when navigating back

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteModal.productId)
      setProducts(products.filter((p) => p.id !== deleteModal.productId))
      setDeleteModal({ isOpen: false, productId: null })
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  if (loading) return <LoadingSpinner message="Loading products..." />

  const filteredProducts = products.filter((p) => {
    const searchMatch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase())

    let categoryMatch = true
    if (selectedCategory) {
      if (Array.isArray(p.category)) {
        categoryMatch = p.category.includes(selectedCategory)
      } else {
        categoryMatch = p.category === selectedCategory
      }
    }

    return searchMatch && categoryMatch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/add-product')}
          >
            <Plus size={20} />
            Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-soft flex flex-col sm:flex-row gap-4 border border-gray-100">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products by name, brand, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="sm:w-64 flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid/Table */}
      {products.length === 0 ? (
        <Card>
          <EmptyState
            icon={Plus}
            title="No products yet"
            description="Create your first product to get started"
            action={
              isAdmin ? (
                <Button
                  variant="primary"
                  onClick={() => navigate('/add-product')}
                >
                  Add Product
                </Button>
              ) : null
            }
          />
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <EmptyState
            title="No matches found"
            description="Try adjusting your search or category filter"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product, index) => {
            try {
              return (
                <Card key={product.id || product.docId || index} className="hover:shadow-card transition-all duration-200">
                  <div className="flex items-start justify-between gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name || 'Product'}
                          className="w-28 h-28 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="112" height="112"%3E%3Crect fill="%23e5e7eb" width="112" height="112"/%3E%3Ctext x="50%" y="50%" font-family="sans-serif" font-size="12" fill="%239ca3af" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      )}
                      {!product.imageUrl && (
                        <div className="w-28 h-28 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                          {product.brand && (
                            <p className="text-sm text-gray-500">Brand: {product.brand}</p>
                          )}
                        </div>
                        {product.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-yellow-500">★ {product.rating}</span>
                            {product.reviews && (
                              <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price Section */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice !== product.price && (
                          <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>

                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {/* Category */}
                        {product.category && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-600 mb-1">Categories</p>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(product.category) ? (
                                product.category.map((cat, i) => (
                                  <span key={i} className="text-xs inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                    {cat}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                  {product.category}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stock */}
                        {product.stock !== undefined && (
                          <div>
                            <p className="text-xs text-gray-600">Stock</p>
                            <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock} units
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ID */}
                      <p className="text-xs text-gray-400">ID: {product.id}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, productId: product.id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            } catch (error) {
              console.error(`Error rendering product ${index}:`, error)
              return (
                <Card key={index}>
                  <p className="text-red-600">Error rendering product {index}</p>
                </Card>
              )
            }
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        title="Delete Product"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, productId: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Products
