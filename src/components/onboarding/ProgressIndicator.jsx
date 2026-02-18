export default function ProgressIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {[...Array(total)].map((_, index) => (
        <div
          key={index}
          className={`
            h-1.5 rounded-full transition-all duration-300
            ${index < current ? 'bg-matcha-dark' : 'bg-gray-200'}
            ${index === current - 1 ? 'w-8' : 'w-4'}
          `}
        />
      ))}
    </div>
  )
}
