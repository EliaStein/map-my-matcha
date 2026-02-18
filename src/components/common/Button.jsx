import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-ring disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-matcha-dark text-white hover:bg-matcha-darker active:scale-[0.98]',
    secondary: 'bg-matcha-light text-matcha-dark hover:bg-matcha-medium/30 active:scale-[0.98]',
    outline: 'border-2 border-matcha-dark text-matcha-dark hover:bg-matcha-light active:scale-[0.98]',
    ghost: 'text-matcha-dark hover:bg-matcha-light/50 active:scale-[0.98]',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
