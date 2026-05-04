import { useEffect, useState } from 'react'
import { PackageIcon, ShoppingCart, AlertCircle, TrendingUp } from 'lucide-react'
import Card, { StatCard } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { getProducts } from '../services/productService'
import { getOrders } from '../services/orderService'

export const Dashboard = () => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsData, ordersData] = await Promise.all([
          getProducts(),
          getOrders(),
        ])
        setProducts(productsData)
        setOrders(ordersData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const pendingOrders = orders.filter((order) => order.status === 'pending').length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

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
      </div>

      {/* Recent Orders */}
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
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Items</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Total</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{order.id.substring(0, 8)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.itemCount || 0} items</td>
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

      {/* Recent Products */}
      <Card className="animate-slideIn">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Products</h2>
          
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No products yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-soft transition-all duration-200">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160"%3E%3Crect fill="%23e5e7eb" width="160" height="160"/%3E%3Ctext x="50%" y="50%" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  {product.brand && (
                    <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-lg font-bold text-gray-900">₹{product.price}</p>
                    {product.originalPrice && product.originalPrice !== product.price && (
                      <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {product.rating && (
                      <span className="text-sm font-semibold text-yellow-500">★ {product.rating}</span>
                    )}
                    {product.stock !== undefined && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {product.stock} in stock
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
