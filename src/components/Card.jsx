export const Card = ({ 
  children, 
  className = '',
  hoverable = false,
  ...props 
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft p-6 transition-all duration-200 ${
        hoverable ? 'hover:shadow-card hover:scale-[1.02] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  color = 'blue',
  trend = null 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card className="animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  )
}

export default Card
