import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Phone, Star, UserCircle2 } from 'lucide-react'
import { getDoctors, deleteDoctor } from '../services/doctorService'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const data = await getDoctors()
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${name}?`)) {
      try {
        await deleteDoctor(id)
        toast.success('Doctor deleted successfully')
        fetchDoctors()
      } catch (error) {
        console.error('Error deleting doctor:', error)
        toast.error('Failed to delete doctor')
      }
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading Doctors..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultants Directory</h1>
          <p className="text-gray-500 mt-1">Manage your healthcare professionals and their profiles</p>
        </div>
        <Link
          to="/add-doctor"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>Add New Doctor</span>
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle2 size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Doctors Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Your directory is currently empty. Start by adding your first healthcare professional.
          </p>
          <Link
            to="/add-doctor"
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-100 transition-colors font-medium"
          >
            <Plus size={20} />
            <span>Add First Doctor</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {doctor.imageUrl ? (
                  <img 
                    src={doctor.imageUrl} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <UserCircle2 size={64} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${
                    doctor.available 
                      ? 'bg-green-500/90 text-white border border-green-400/50' 
                      : 'bg-red-500/90 text-white border border-red-400/50'
                  }`}>
                    {doctor.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{doctor.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-yellow-700">{doctor.rating || 'N/A'}</span>
                  </div>
                </div>
                
                <p className="text-blue-600 font-medium text-sm mb-4">{doctor.specialty}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium text-gray-900">{doctor.experience}</span>
                  </div>
                  {doctor.whatsapp && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Phone size={14} /> WhatsApp
                      </span>
                      <span className="font-medium text-gray-900">{doctor.whatsapp}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                  >
                    <Edit2 size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(doctor.id, doctor.name)}
                    className="flex items-center justify-center w-10 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                    title="Delete Doctor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
