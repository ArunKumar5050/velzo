export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

export const EmptyState = ({ icon: Icon, title, description, action = null }) => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          {Icon && <Icon size={32} className="text-gray-400" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        {action && action}
      </div>
    </div>
  )
}

export default { LoadingSpinner, EmptyState }
