import { useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Plus, ShoppingCart, Zap, LogOut } from 'lucide-react'

export const Sidebar = ({ onLogout }) => {
  const location = useLocation()

  const links = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/add-product', icon: Plus, label: 'Add Product' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/diagnostic', icon: Zap, label: 'Diagnostic', color: 'orange' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          ONWAY
        </h1>
        <p className="text-gray-400 text-xs mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const active = isActive(link.path)
          
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
