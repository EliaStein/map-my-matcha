import { DollarSign } from 'lucide-react'

export default function PriceSelector({ value, onChange }) {
  const priceOptions = [
    { level: 1, label: 'Budget-friendly' },
    { level: 2, label: 'Moderate' },
    { level: 3, label: 'Upscale' },
    { level: 4, label: 'Premium' }
  ]

  return (
    <div className="space-y-3">
      {priceOptions.map(({ level, label }) => {
        const isSelected = value === level
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl
              border-2 transition-all duration-200
              ${isSelected
                ? 'border-matcha-dark bg-matcha-light/50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <DollarSign
                  key={i}
                  className={`w-5 h-5 -ml-1 first:ml-0 ${
                    i < level ? 'text-matcha-dark' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-medium ${isSelected ? 'text-matcha-darker' : 'text-gray-700'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
