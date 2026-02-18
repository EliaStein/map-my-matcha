export default function Card({
  children,
  padding = 'md',
  onClick,
  className = '',
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-sm
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200 w-full text-left' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  )
}
