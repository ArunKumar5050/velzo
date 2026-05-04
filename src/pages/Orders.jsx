import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Card from '../components/Card'
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner'
import { StatusBadge } from '../components/Modal'
import { listenToAllOrders, updateOrder } from '../services/orderService'
import toast from 'react-hot-toast'

export const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    console.log('📝 Orders.jsx: Setting up real-time listener...')
    setLoading(true)

    // Set up real-time listener
    const unsubscribe = listenToAllOrders(
      (orders) => {
        console.log('📝 Orders.jsx: Real-time update received:', orders.length, 'orders')
        setOrders(orders)
        setLoading(false)
      },
      (error) => {
        console.error('📝 Orders.jsx: Listener error:', error)
        toast.error('Failed to load orders')
        setLoading(false)
      }
    )

    // Cleanup listener when component unmounts
    return () => {
      console.log('🔌 Orders.jsx: Cleaning up real-time listener')
      unsubscribe()
    }
  }, [])

  const handleStatusChange = async (orderId, newStatus, userId) => {
    try {
      setUpdatingOrderId(orderId)
      console.log(`📝 Updating order ${orderId} to status: ${newStatus}`)
      
      await updateOrder(userId, orderId, { status: newStatus })
      
      console.log(`✅ Order ${orderId} updated successfully`)
      toast.success(`Order status updated to ${newStatus}`)
      setUpdatingOrderId(null)
      // Real-time listener will automatically update the UI
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
      setUpdatingOrderId(null)
    }
  }

  if (loading) return <LoadingSpinner message="Loading orders..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">Manage customer orders and track shipments</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <EmptyState
            title="No orders yet"
            description="Orders will appear here when customers place them"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="animate-fadeIn hover:shadow-card transition-all duration-200">
              {/* Order Header */}
              <div
                className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Order {order.id.substring(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.userName || 'User'} • {order.items?.length || 0} items • ₹{order.totalAmount || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status || 'pending'} />
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform duration-200 ${
                    expandedOrder === order.id ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-slideIn">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Name</p>
                        <p className="font-semibold text-gray-900">{order.userName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Email</p>
                        <p className="font-semibold text-gray-900">{order.userEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Phone</p>
                        <p className="font-semibold text-gray-900">{order.userPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">User ID</p>
                        <p className="font-semibold text-gray-900 text-sm">{order.userId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="font-semibold text-gray-900 mt-1">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="font-semibold text-gray-900 mt-1">${order.subtotal || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Fee</p>
                      <p className="font-semibold text-gray-900 mt-1">${order.deliveryFee || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tax</p>
                      <p className="font-semibold text-gray-900 mt-1">${order.tax || 0}</p>
                    </div>
                    <div className="md:col-span-1">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-lg text-blue-600 mt-1">₹{order.totalAmount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {order.createdAt
                          ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    {order.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-semibold text-gray-900 mt-1">{order.estimatedDelivery}</p>
                      </div>
                    )}
                    {order.deliveryTime !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Delivery Time (mins)</p>
                        <p className="font-semibold text-gray-900 mt-1">{order.deliveryTime}</p>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  {order.items && order.items.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items ({order.items.length})</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.brand}</p>
                              <p className="text-xs text-gray-600 mt-1">Qty: {item.quantity} × ${item.price}</p>
                            </div>
                            <p className="font-semibold text-gray-900">${item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipping & Payment Info */}
                  {(order.shippingAddress || order.paymentMethod) && (
                    <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {order.shippingAddress && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                          <p className="text-sm text-gray-600">{order.shippingAddress.name}</p>
                          <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                          <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                          <p className="text-xs text-gray-500 mt-2 capitalize">Type: {order.shippingAddress.type}</p>
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
                          <p className="text-sm text-gray-600">{order.paymentMethod.label}</p>
                          <p className="text-xs text-gray-500 mt-2 capitalize">Type: {order.paymentMethod.type}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Management */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Update Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['confirmed', 'processing', 'shipped', 'in-transit', 'delivered', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(order.id, status, order.userId)}
                          disabled={updatingOrderId === order.id}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                            order.status === status
                              ? 'bg-blue-600 text-white shadow-soft'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } ${updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updatingOrderId === order.id ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              Updating...
                            </span>
                          ) : (
                            status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes/Description */}
                  {order.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <p className="text-gray-600 text-sm">Confirmed Orders</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {orders.filter((o) => o.status === 'confirmed').length}
            </p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">In Transit</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {orders.filter((o) => ['processing', 'shipped', 'in-transit'].includes(o.status)).length}
            </p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Delivered Orders</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {orders.filter((o) => o.status === 'delivered').length}
            </p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Orders
