import { X } from 'lucide-react'

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }) => {
  if (!isOpen) return null

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-card w-full ${widthClasses[maxWidth]} animate-fadeIn`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      label: 'Pending',
    },
    confirmed: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Confirmed',
    },
    delivered: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Delivered',
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Cancelled',
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  )
}

export default { Modal, StatusBadge }
