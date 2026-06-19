import { useState, useEffect } from 'react'
import { Calendar, User, Phone, MapPin, Activity, CheckCircle, Clock, XCircle, FileText } from 'lucide-react'
import Card from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { subscribeToLabAppointments, listenToLabAppointments, updateAppointmentStatus } from '../services/labAppointmentService'
import { autoAssignUnassignedAppointments } from '../services/assignmentService'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200'
}

export default function LabAppointments() {
  const { isAdmin, isLaboratory, entityId } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    setLoading(true)

    const handleAppointmentsUpdate = (data) => {
      setAppointments(data)
      setLoading(false)
    }

    let unsubscribe = () => {}

    if (isAdmin) {
      unsubscribe = subscribeToLabAppointments(handleAppointmentsUpdate)
    } else if (isLaboratory && entityId) {
      unsubscribe = listenToLabAppointments(entityId, handleAppointmentsUpdate)
    }

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [isAdmin, isLaboratory, entityId])

  const handleAutoAssign = async () => {
    try {
      setIsAssigning(true)
      const count = await autoAssignUnassignedAppointments(appointments)
      if (count > 0) {
        toast.success(`Successfully assigned ${count} appointments`)
      } else {
        toast.info('No unassigned appointments found with valid pincodes')
      }
    } catch (error) {
      toast.error('Failed to auto-assign appointments')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleStatusUpdate = async (appointment, newStatus) => {
    try {
      const loadingId = toast.loading('Updating status...')
      await updateAppointmentStatus(appointment.ref, newStatus)
      
      // Update local state
      setAppointments(prev => prev.map(app => 
        app.id === appointment.id ? { ...app, status: newStatus } : app
      ))
      
      toast.success(`Status updated to ${newStatus}`, { id: loadingId })
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date'
    // Handle Firestore Timestamps or regular dates/strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAppointments = filter === 'All' 
    ? appointments 
    : appointments.filter(a => a.status === filter)

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-blue-600" />
            Lab Appointments
          </h1>
          <p className="text-gray-500 mt-1">Manage all diagnostic lab test bookings from the app.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {isAdmin && (
            <button
              onClick={handleAutoAssign}
              disabled={isAssigning}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm font-medium hover:bg-blue-700 transition-colors ${
                isAssigning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isAssigning ? 'Assigning...' : 'Auto-Assign Bookings'}
            </button>
          )}

          {/* Filter */}
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === status 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching lab appointments..." />
      ) : filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
          <p className="text-gray-500">There are no {filter.toLowerCase()} appointments at this time.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Patient Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="text-gray-400" size={18} />
                    <span className="font-semibold text-gray-900 text-lg">{apt.name || 'Unknown Patient'}</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2">
                      Age: {apt.age || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span>{apt.mobile || apt.phone || 'No phone provided'}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span className="text-sm">
                      {apt.address?.building && `${apt.address.building}, `}
                      {apt.landmark && `${apt.landmark}, `}
                      {apt.address?.pincode || apt.pincode || ''}
                      {!apt.address && !apt.landmark && 'Address not provided'}
                    </span>
                  </div>
                </div>

                {/* Tests Info */}
                <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 text-blue-800 font-medium">
                    <FileText size={18} />
                    Tests Booked
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {apt.tests && Array.isArray(apt.tests) && apt.tests.length > 0 ? (
                      apt.tests.map((test, idx) => (
                        <span key={idx} className="bg-white border border-blue-200 text-blue-700 text-sm px-3 py-1 rounded-lg shadow-sm">
                          {typeof test === 'string' ? test : test.name || 'Unknown Test'}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">No specific tests listed</span>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex-1 lg:flex-none flex flex-col justify-between items-start lg:items-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                  <div className="flex flex-col items-start lg:items-end w-full mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                      <Clock size={14} />
                      Booked On
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {formatDate(apt.createdAt)}
                    </div>
                  </div>

                  <div className="w-full">
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Update Status:</p>
                    <select
                      value={apt.status || 'Pending'}
                      onChange={(e) => handleStatusUpdate(apt, e.target.value)}
                      className={`w-full appearance-none px-4 py-2 rounded-lg font-semibold border focus:ring-2 focus:outline-none transition-colors cursor-pointer ${STATUS_COLORS[apt.status || 'Pending']}`}
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="Confirmed">✅ Confirmed</option>
                      <option value="Completed">🎉 Completed</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>
                
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
