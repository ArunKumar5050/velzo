import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, ScanLine, Check, X, Edit3, Trash2, Plus, ArrowLeft,
  CheckCircle2, AlertCircle, Package, Sparkles, RefreshCw, FileImage,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { extractItemsFromBill } from '../services/geminiService'
import { preMatchItems, commitStockUpdates } from '../services/stockUpdateService'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 'upload', label: 'Upload Bill', icon: Upload },
  { id: 'scanning', label: 'Scanning', icon: ScanLine },
  { id: 'review', label: 'Review & Edit', icon: Edit3 },
  { id: 'done', label: 'Done', icon: Check },
]

export default function BillScanner() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [currentStep, setCurrentStep] = useState('upload')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [extractedItems, setExtractedItems] = useState([])
  const [processing, setProcessing] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [results, setResults] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  // Handle file selection
  const handleFile = useCallback((file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, etc.)')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be smaller than 15MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  // Start AI scanning
  const handleScan = async () => {
    if (!imageFile) {
      toast.error('Please upload a bill image first')
      return
    }

    try {
      setProcessing(true)
      setCurrentStep('scanning')

      // Step 1: Extract items from image via Gemini
      toast.loading('Reading your bill...', { id: 'scan' })
      const rawItems = await extractItemsFromBill(imageFile)
      
      if (rawItems.length === 0) {
        toast.error('No items found in the bill. Try a clearer image.', { id: 'scan' })
        setCurrentStep('upload')
        return
      }

      toast.loading(`Found ${rawItems.length} items. Matching with inventory...`, { id: 'scan' })

      // Step 2: Match against existing products
      const matchedItems = await preMatchItems(rawItems)
      
      setExtractedItems(matchedItems)
      setCurrentStep('review')
      toast.success(`Extracted ${matchedItems.length} items from bill`, { id: 'scan' })
    } catch (error) {
      console.error('Scan error:', error)
      toast.error(error.message || 'Failed to scan bill', { id: 'scan' })
      setCurrentStep('upload')
    } finally {
      setProcessing(false)
    }
  }

  // Edit an item in the review table
  const updateItem = (index, field, value) => {
    setExtractedItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // Remove an item from the list
  const removeItem = (index) => {
    setExtractedItems(prev => prev.filter((_, i) => i !== index))
  }

  // Add a manual item
  const addManualItem = () => {
    setExtractedItems(prev => [
      ...prev,
      {
        name: '',
        price: 0,
        quantity: 1,
        matchStatus: 'new',
        matchedProduct: null,
        matchScore: 0,
        matchedName: null,
        currentStock: 0,
        currentPrice: 0,
      },
    ])
  }

  // Commit all changes to Firestore
  const handleCommit = async () => {
    const validItems = extractedItems.filter(item => item.name.trim() !== '')
    if (validItems.length === 0) {
      toast.error('No valid items to update')
      return
    }

    try {
      setCommitting(true)
      toast.loading('Updating stock...', { id: 'commit' })

      const result = await commitStockUpdates(validItems)
      setResults(result)
      setCurrentStep('done')

      if (result.errors.length > 0) {
        toast.error(`Done with ${result.errors.length} errors`, { id: 'commit' })
      } else {
        toast.success(
          `Updated ${result.updated} products, created ${result.created} new!`,
          { id: 'commit' }
        )
      }
    } catch (error) {
      console.error('Commit error:', error)
      toast.error(error.message || 'Failed to update stock', { id: 'commit' })
    } finally {
      setCommitting(false)
    }
  }

  // Reset to start over
  const handleReset = () => {
    setCurrentStep('upload')
    setImageFile(null)
    setImagePreview(null)
    setExtractedItems([])
    setResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const existingCount = extractedItems.filter(i => i.matchStatus === 'existing').length
  const newCount = extractedItems.filter(i => i.matchStatus === 'new').length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="text-amber-500" size={28} />
              Bill Scanner
            </h1>
            <p className="text-gray-500 mt-1">Upload a bill to auto-update your stock inventory</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const stepIndex = STEPS.findIndex(s => s.id === currentStep)
            const thisIndex = index
            const isActive = step.id === currentStep
            const isCompleted = thisIndex < stepIndex

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-full transition-colors duration-300 ${
                      thisIndex < stepIndex ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Step: Upload */}
      {currentStep === 'upload' && (
        <Card className="animate-fadeIn">
          <div className="space-y-6">
            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                  : imagePreview
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Bill preview"
                      className="max-h-72 rounded-xl shadow-lg mx-auto"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReset()
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 size={18} />
                    <span className="font-medium">{imageFile?.name}</span>
                    <span className="text-gray-400 text-sm">
                      ({(imageFile?.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                    <FileImage size={32} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Drop your bill image here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or click to browse • JPG, PNG up to 15MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Scan button */}
            {imagePreview && (
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleScan}
                  disabled={processing}
                  className="px-8"
                >
                  <ScanLine size={20} />
                  {processing ? 'Scanning...' : 'Scan Bill'}
                </Button>
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h4 className="font-semibold text-amber-800 text-sm mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                Tips for Best Results
              </h4>
              <ul className="text-amber-700 text-sm space-y-1.5">
                <li>• Take a clear, well-lit photo of the bill</li>
                <li>• Ensure all text is visible and not cut off</li>
                <li>• Printed bills work better than handwritten ones</li>
                <li>• You can always edit the results before saving</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Step: Scanning Animation */}
      {currentStep === 'scanning' && (
        <Card className="animate-fadeIn">
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <ScanLine size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">Scanning Your Bill</h3>
              <p className="text-gray-500 mt-2 max-w-md">
                The scanner is reading the bill, extracting medicine names, prices, and quantities...
              </p>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </Card>
      )}

      {/* Step: Review & Edit */}
      {currentStep === 'review' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary Bar */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {existingCount} existing (will update)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {newCount} new (will create)
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {extractedItems.length} total items
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={addManualItem}>
                  <Plus size={16} />
                  Add Item
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  <RefreshCw size={16} />
                  Rescan
                </Button>
              </div>
            </div>
          </Card>

          {/* Bill Image Preview (collapsed) */}
          {imagePreview && (
            <details className="bg-white rounded-2xl shadow-soft border border-gray-100">
              <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <FileImage size={16} />
                View Original Bill Image
              </summary>
              <div className="px-6 pb-4">
                <img src={imagePreview} alt="Bill" className="max-h-64 rounded-xl shadow-sm" />
              </div>
            </details>
          )}

          {/* Items Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3">Medicine Name</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3">Price (₹)</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3">Qty</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3">Inventory Info</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {extractedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      {/* Status badge */}
                      <td className="py-3 px-3">
                        {item.matchStatus === 'existing' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 size={12} />
                            Update
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Plus size={12} />
                            New
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm font-medium"
                          placeholder="Medicine name"
                        />
                        {item.matchedName && item.matchedName !== item.name && (
                          <p className="text-xs text-gray-400 mt-1 px-1">
                            Matched: <span className="font-medium">{item.matchedName}</span>
                          </p>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 w-28">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                          step="0.01"
                          min="0"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 w-20">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                          min="0"
                        />
                      </td>

                      {/* Inventory Info */}
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {item.matchStatus === 'existing' ? (
                          <div className="space-y-0.5">
                            <p>Current stock: <span className="font-semibold text-gray-700">{item.currentStock}</span></p>
                            <p>After update: <span className="font-semibold text-green-600">{item.currentStock + item.quantity}</span></p>
                            <p>Price: ₹{item.currentPrice} → <span className="font-semibold text-blue-600">₹{item.price}</span></p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">New product will be created</span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {extractedItems.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Package size={32} className="mx-auto mb-2" />
                <p>No items. Add manually or rescan the bill.</p>
              </div>
            )}
          </Card>

          {/* Commit Button */}
          {extractedItems.length > 0 && (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="lg" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleCommit}
                disabled={committing}
              >
                <CheckCircle2 size={20} />
                {committing
                  ? 'Updating Stock...'
                  : `Confirm & Update ${extractedItems.length} Items`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step: Done */}
      {currentStep === 'done' && results && (
        <Card className="animate-fadeIn">
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Stock Updated Successfully!</h3>
              <p className="text-gray-500 mt-2">Your inventory has been updated based on the bill.</p>
            </div>

            {/* Results summary */}
            <div className="flex justify-center gap-6">
              <div className="bg-green-50 rounded-xl px-6 py-4 border border-green-100">
                <p className="text-3xl font-bold text-green-600">{results.updated}</p>
                <p className="text-sm text-green-700 font-medium">Products Updated</p>
              </div>
              <div className="bg-blue-50 rounded-xl px-6 py-4 border border-blue-100">
                <p className="text-3xl font-bold text-blue-600">{results.created}</p>
                <p className="text-sm text-blue-700 font-medium">New Products Created</p>
              </div>
            </div>

            {/* Errors */}
            {results.errors.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-left max-w-md mx-auto">
                <h4 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {results.errors.length} Error(s)
                </h4>
                <ul className="text-red-700 text-xs space-y-1">
                  {results.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="secondary" size="lg" onClick={handleReset}>
                <ScanLine size={18} />
                Scan Another Bill
              </Button>
              <Button variant="primary" size="lg" onClick={() => navigate('/products')}>
                <Package size={18} />
                View Products
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
