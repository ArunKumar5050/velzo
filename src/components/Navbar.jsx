import { User, ChevronDown } from 'lucide-react'

export const Navbar = ({ title = 'Dashboard' }) => {
  return (
    <div className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 h-16 shadow-soft z-10">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
