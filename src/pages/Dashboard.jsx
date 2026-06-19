import { useEffect, useState } from 'react'
import { PackageIcon, ShoppingCart, AlertCircle, TrendingUp, Activity, ClipboardList } from 'lucide-react'
import Card, { StatCard } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { getProducts } from '../services/productService'
import { listenToAllOrders, listenToStoreOrders } from '../services/orderService'
import { subscribeToLabAppointments, listenToLabAppointments } from '../services/labAppointmentService'
import { useAuth } from '../context/AuthContext'

export const Dashboard = () => {
  const { isAdmin, isMedicalStore, isLaboratory, entityId } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeOrders = () => {}
    let unsubscribeAppointments = () => {}

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch products if Admin or Medical Store
        if (isAdmin || isMedicalStore) {
          const productsData = await getProducts()
          setProducts(productsData)
        }

        // Set up real-time listeners based on role
        if (isAdmin) {
          unsubscribeOrders = listenToAllOrders(setOrders, console.error)
          unsubscribeAppointments = subscribeToLabAppointments(setAppointments)
        } else if (isMedicalStore && entityId) {
          unsubscribeOrders = listenToStoreOrders(entityId, setOrders, console.error)
        } else if (isLaboratory && entityId) {
          unsubscribeAppointments = listenToLabAppointments(entityId, setAppointments)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      unsubscribeOrders()
      unsubscribeAppointments()
    }
  }, [isAdmin, isMedicalStore, isLaboratory, entityId])

  const pendingOrders = orders.filter((order) => order.status === 'pending').length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  const pendingAppointments = appointments.filter(a => a.status === 'Pending').length

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(isAdmin || isMedicalStore) && (
          <>
            <StatCard
              icon={PackageIcon}
              title="Total Products"
              value={products.length}
              color="blue"
              trend={12}
            />
            <StatCard
              icon={ShoppingCart}
              title="Total Orders"
              value={orders.length}
              color="green"
              trend={8}
            />
            <StatCard
              icon={AlertCircle}
              title="Pending Orders"
              value={pendingOrders}
              color="orange"
              trend={-3}
            />
            <StatCard
              icon={TrendingUp}
              title="Total Revenue"
              value={`₹${totalRevenue.toLocaleString()}`}
              color="blue"
              trend={15}
            />
          </>
        )}
        {(isAdmin || isLaboratory) && (
          <>
            <StatCard
              icon={Activity}
              title="Total Lab Tests"
              value={appointments.length}
              color="purple"
            />
            <StatCard
              icon={ClipboardList}
              title="Pending Lab Tests"
              value={pendingAppointments}
              color="orange"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        {(isAdmin || isMedicalStore) && (
          <Card className="animate-slideIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Order ID</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Total</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{order.id.substring(0, 8)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            ₹{order.totalPrice || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700'
                                : order.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-green-50 text-green-700'
                            }`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Recent Appointments */}
        {(isAdmin || isLaboratory) && (
          <Card className="animate-slideIn">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Lab Tests</h2>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No lab appointments yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Test ID</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Patient</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((apt) => (
                        <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{apt.id.substring(0, 8)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {apt.patientName || apt.name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              apt.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

    </div>
  )
}

export default Dashboard
