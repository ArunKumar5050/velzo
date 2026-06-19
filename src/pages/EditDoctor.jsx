import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Upload, UserCircle2 } from 'lucide-react'
import { getDoctorById, updateDoctor } from '../services/doctorService'
import { uploadToCloudinary } from '../services/cloudinaryService'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function EditDoctor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    rating: 5.0,
    whatsapp: '',
    available: true,
    imageUrl: '',
  })

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        const data = await getDoctorById(id)
        setFormData({
          name: data.name || '',
          specialty: data.specialty || '',
          experience: data.experience || '',
          rating: data.rating || 5.0,
          whatsapp: data.whatsapp || '',
          available: data.available ?? true,
          imageUrl: data.imageUrl || '',
        })
        if (data.imageUrl) {
          setImagePreview(data.imageUrl)
        }
      } catch (error) {
        console.error('Error fetching doctor:', error)
        toast.error('Failed to load doctor details')
        navigate('/doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.specialty) {
      toast.error('Name and Specialty are required')
      return
    }

    try {
      setSaving(true)
      
      let finalImageUrl = formData.imageUrl
      if (imageFile) {
        toast.loading('Uploading image...', { id: 'upload' })
        finalImageUrl = await uploadToCloudinary(imageFile)
        toast.success('Image uploaded successfully', { id: 'upload' })
      }

      await updateDoctor(id, {
        name: formData.name,
        specialty: formData.specialty,
        experience: formData.experience,
        rating: formData.rating,
        whatsapp: formData.whatsapp,
        available: formData.available,
        imageUrl: finalImageUrl,
      })

      toast.success('Doctor updated successfully')
      navigate('/doctors')
    } catch (error) {
      console.error('Error updating doctor:', error)
      toast.error(error.message || 'Failed to update doctor')
      toast.dismiss('upload')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading Doctor Details..." />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/doctors"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Doctor</h1>
            <p className="text-gray-500 text-sm mt-1">Update consultant profile</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium disabled:opacity-50 shadow-sm"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="relative group cursor-pointer">
              {imagePreview ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center">
                  <UserCircle2 size={64} className="text-gray-300" />
                </div>
              )}
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                <Upload size={24} className="mb-1" />
                <span className="text-xs font-medium">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-4 text-sm text-gray-500 font-medium">Change Profile Photo</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Krishna"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Specialty *</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="e.g. Pediatrician"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 15 years"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="e.g. 918949360406"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900">Available for Consultation</span>
                  <span className="block text-xs text-gray-500">Toggle if the doctor is currently available</span>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
