import { Star } from 'lucide-react'

export default function Rating({
  value = 0,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const sizePixels = {
    sm: 14,
    md: 20,
    lg: 24
  }

  const handleClick = (rating) => {
    if (interactive && onChange) {
      onChange(rating)
    }
  }

  const getStarType = (index) => {
    const starPosition = index + 1
    if (value >= starPosition) {
      return 'full'
    } else if (value >= starPosition - 0.5) {
      return 'half'
    }
    return 'empty'
  }

  const starSize = sizeClasses[size]
  const pixelSize = sizePixels[size]

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      <div className="inline-flex items-center gap-0.5">
        {[...Array(max)].map((_, index) => {
          const starType = getStarType(index)

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(index + 1)}
              className={`
                relative inline-block
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-transform duration-100
                disabled:cursor-default
              `}
              style={{ width: pixelSize, height: pixelSize }}
            >
              {starType === 'full' && (
                <Star
                  className={`${starSize} fill-amber-400 text-amber-400`}
                />
              )}
              {starType === 'half' && (
                <span
                  className="relative block"
                  style={{ width: pixelSize, height: pixelSize }}
                >
                  {/* Empty star background */}
                  <Star
                    className={`absolute top-0 left-0 ${starSize} fill-gray-200 text-gray-200`}
                  />
                  {/* Half filled star - clipped */}
                  <span
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: pixelSize / 2, height: pixelSize }}
                  >
                    <Star
                      className={`${starSize} fill-amber-400 text-amber-400`}
                    />
                  </span>
                </span>
              )}
              {starType === 'empty' && (
                <Star
                  className={`${starSize} fill-gray-200 text-gray-200`}
                />
              )}
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-gray-600">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
