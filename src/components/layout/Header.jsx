import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header({
  title,
  showBack = false,
  rightAction,
  className = ''
}) {
  const navigate = useNavigate()

  return (
    <header className={`sticky top-0 md:top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-2 min-w-[60px]">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>

          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>

          <div className="flex items-center gap-2 min-w-[60px] justify-end">
            {rightAction}
          </div>
        </div>
      </div>
    </header>
  )
}
