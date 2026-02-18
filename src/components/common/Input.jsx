import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl border-2 bg-white
          text-gray-900 placeholder-gray-400
          transition-all duration-200
          focus:outline-none focus:border-matcha-dark focus:ring-2 focus:ring-matcha-medium/20
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200/50' : 'border-gray-200'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
