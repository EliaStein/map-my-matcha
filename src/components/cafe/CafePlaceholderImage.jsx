export default function CafePlaceholderImage({ className = '' }) {
  return (
    <div
      className={`bg-gradient-to-br from-matcha-light via-matcha-medium/30 to-matcha-dark/20 flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <span className="text-5xl select-none">🍵</span>
      <span className="text-sm font-medium text-matcha-dark/70">No photos yet</span>
    </div>
  )
}
