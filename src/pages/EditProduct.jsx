import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { getProductById, updateProduct } from '../services/productService'
import { uploadToCloudinary } from '../services/cloudinaryService'
import { Upload, X, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    stock: '',
    brand: '',
    warranty: '',
    returnDays: '',
  })
  const [originalImageUrl, setOriginalImageUrl] = useState('')

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const product = await getProductById(id)
        
        setFormData({
          name: product.name || '',
          price: product.price || '',
          originalPrice: product.originalPrice || '',
          category: product.category || '',
          description: product.description || '',
          imageUrl: product.imageUrl || '',
          imageFile: null,
          stock: product.stock || '',
          brand: product.brand || '',
          warranty: product.warranty || '',
          returnDays: product.returnDays || '',
        })
        setOriginalImageUrl(product.imageUrl || '')
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product details')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      const uploadedUrl = await uploadToCloudinary(file)
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: uploadedUrl,
      }))
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Image upload failed:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: originalImageUrl, // Revert to original
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.price) {
      toast.error('Please fill in product name and price')
      return
    }

    // Validate that image upload is complete if in progress
    if (uploading) {
      toast.error('Please wait for image upload to complete')
      return
    }

    try {
      setSaving(true)

      // Build product data
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
      }

      // Add optional fields
      if (formData.originalPrice) productData.originalPrice = parseFloat(formData.originalPrice)
      if (formData.category) productData.category = formData.category
      if (formData.description) productData.description = formData.description
      if (formData.imageUrl) productData.imageUrl = formData.imageUrl
      if (formData.stock) productData.stock = parseInt(formData.stock) || 0
      if (formData.brand) productData.brand = formData.brand
      if (formData.warranty) productData.warranty = formData.warranty
      if (formData.returnDays) productData.returnDays = parseInt(formData.returnDays) || 0

      // Get the product's docId for update
      const product = await getProductById(id)
      await updateProduct(product.docId, productData)
      
      toast.success('Product updated successfully!')
      navigate('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading product details..." />

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product information</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="animate-slideIn">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Product Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">-- Select or leave blank --</option>
              <option value="grocery">Grocery</option>
              <option value="beauty">Beauty</option>
              <option value="medicine">Medicine</option>
              <option value="baby">Baby</option>
              <option value="electronic">Electronic</option>
            </select>
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Price <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Product Image
            </label>
            <div className="space-y-3">
              {/* Upload Area */}
              {!formData.imageUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <div className="bg-gray-50 rounded-lg p-4 inline-block">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-48 w-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="192" height="192"%3E%3Crect fill="%23e5e7eb" width="192" height="192"/%3E%3Ctext x="50%" y="50%" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                  <button
                    onClick={removeImage}
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm">Uploading to Cloudinary...</span>
                </div>
              )}
            </div>
          </div>

          {/* Original Price & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Original Price
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Product brand"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Warranty & Return Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Warranty
              </label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                placeholder="e.g., 1 Year, 2 Years"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Return Days
              </label>
              <input
                type="number"
                name="returnDays"
                value={formData.returnDays}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/products')}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default EditProduct
