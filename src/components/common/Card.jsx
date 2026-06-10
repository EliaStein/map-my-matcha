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

  // Interactive cards render as a div with button semantics rather than a
  // real <button>: cards contain nested buttons (e.g. the favorite heart),
  // and <button> inside <button> is invalid HTML.
  const interactive = Boolean(onClick)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(e)
    }
  }

  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={`
        bg-white rounded-2xl shadow-sm
        ${interactive ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200 w-full text-left' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
