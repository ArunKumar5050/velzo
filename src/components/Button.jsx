export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 justify-center'
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    primary: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-soft',
    secondary: disabled
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95',
    danger: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    success: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-green-600 text-white hover:bg-green-700 active:scale-95',
    ghost: disabled
      ? 'text-gray-400 cursor-not-allowed'
      : 'text-gray-700 hover:bg-gray-100 active:scale-95',
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
