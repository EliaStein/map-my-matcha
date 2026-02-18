import { X } from 'lucide-react'

export default function Tag({
  children,
  variant = 'default',
  size = 'md',
  selected = false,
  removable = false,
  onClick,
  onRemove,
  className = ''
}) {
  const variants = {
    default: selected
      ? 'bg-matcha-dark text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    matcha: selected
      ? 'bg-matcha-dark text-white'
      : 'bg-matcha-light text-matcha-dark hover:bg-matcha-medium/40',
    outline: selected
      ? 'bg-matcha-dark text-white border-matcha-dark'
      : 'bg-white text-gray-700 border-gray-300 hover:border-matcha-dark hover:text-matcha-dark'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const Component = onClick ? 'button' : 'span'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        transition-all duration-200
        ${variant === 'outline' ? 'border-2' : ''}
        ${variants[variant]}
        ${sizes[size]}
        ${onClick ? 'cursor-pointer active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-0.5 hover:bg-black/10 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Component>
  )
}
