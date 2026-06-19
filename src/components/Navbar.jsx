import { User, ChevronDown, Store, TestTube, ShieldCheck } from 'lucide-react'
import { ROLES } from '../config/rbac'
import { useAuth } from '../context/AuthContext'

export const Navbar = ({ title = 'Dashboard', role, entityData }) => {
  const { user } = useAuth();

  const getRoleIcon = () => {
    switch (role) {
      case ROLES.ADMIN: return <ShieldCheck size={18} />;
      case ROLES.MEDICAL_STORE: return <Store size={18} />;
      case ROLES.LABORATORY: return <TestTube size={18} />;
      default: return <User size={18} />;
    }
  }

  const getRoleColors = () => {
    switch (role) {
      case ROLES.ADMIN: return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case ROLES.MEDICAL_STORE: return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      case ROLES.LABORATORY: return 'bg-gradient-to-br from-purple-500 to-purple-600';
      default: return 'bg-gray-500';
    }
  }

  const getRoleLabel = () => {
    switch (role) {
      case ROLES.ADMIN: return 'Administrator';
      case ROLES.MEDICAL_STORE: return 'Medical Store';
      case ROLES.LABORATORY: return 'Laboratory';
      default: return 'User';
    }
  }

  return (
    <div className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 h-16 shadow-soft z-10">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getRoleColors()}`}>
              {getRoleIcon()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                {entityData?.name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleLabel()}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
