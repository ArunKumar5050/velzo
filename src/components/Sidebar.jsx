import { useLocation, NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { getSidebarLinks, ROLES } from '../config/rbac'

export const Sidebar = ({ onLogout, role, entityData }) => {
  const location = useLocation()

  // Guard against missing role during load
  if (!role) return null;

  const links = getSidebarLinks(role)
  const isActive = (path) => location.pathname === path

  const getRoleTitle = () => {
    switch (role) {
      case ROLES.ADMIN: return 'Admin Dashboard';
      case ROLES.MEDICAL_STORE: return 'Medical Store Portal';
      case ROLES.LABORATORY: return 'Laboratory Portal';
      default: return 'Portal';
    }
  }

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          ONWAY
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          {getRoleTitle()}
        </p>
        {entityData && entityData.name && (
          <p className="text-blue-300 text-sm font-semibold mt-2 truncate">
            {entityData.name}
          </p>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const hasSubLinks = !!link.subLinks
          const isSubLinkActive = hasSubLinks && link.subLinks.some(sub => isActive(sub.path))
          const active = isActive(link.path) || isSubLinkActive
          
          if (hasSubLinks) {
            return (
              <div key={link.label} className="space-y-1">
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 font-medium ${isSubLinkActive ? 'text-white' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </div>
                </div>
                <div className="ml-10 space-y-1 border-l border-gray-700 pl-2">
                  {link.subLinks.map(subLink => (
                    <NavLink
                      key={subLink.path}
                      to={subLink.path}
                      className={`block px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                        isActive(subLink.path)
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {subLink.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <NavLink
              key={link.path || link.label}
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
