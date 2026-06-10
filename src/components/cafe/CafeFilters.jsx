import { useState } from 'react'
import { Filter, X, Check } from 'lucide-react'
import { Tag } from '../common'

const FILTER_OPTIONS = [
  { id: 'isOrganic', label: 'Organic', emoji: '🌱' },
  { id: 'isCeremonial', label: 'Ceremonial', emoji: '🏆' },
  { id: 'hasWifi', label: 'WiFi', emoji: '📶' },
  { id: 'hasNonDairyMilk', label: 'Non-Dairy', emoji: '🥛' },
  { id: 'hasWhisk', label: 'Whisked', emoji: '🥄' }
]

export default function CafeFilters({ filters, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = Object.values(filters).filter(Boolean).length

  const toggleFilter = (filterId) => {
    onChange({
      ...filters,
      [filterId]: !filters[filterId]
    })
  }

  const clearFilters = () => {
    onChange({})
  }

  return (
    <div>
      {/* Filter Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full
            border-2 transition-all duration-200
            ${activeCount > 0
              ? 'border-matcha-dark bg-matcha-light text-matcha-dark'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {activeCount > 0 && (
            <span className="ml-1 w-5 h-5 bg-matcha-dark text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">Filter by</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = filters[option.id]
              return (
                <button
                  key={option.id}
                  onClick={() => toggleFilter(option.id)}
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-lg
                    border-2 transition-all duration-200
                    ${isActive
                      ? 'border-matcha-dark bg-matcha-light/50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{option.emoji}</span>
                  <span className={`text-sm font-medium ${isActive ? 'text-matcha-darker' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                  {isActive && <Check className="w-4 h-4 text-matcha-dark" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeCount > 0 && !isOpen && (
        <div className="flex flex-wrap gap-2 mt-3">
          {FILTER_OPTIONS.filter(opt => filters[opt.id]).map((option) => (
            <Tag
              key={option.id}
              variant="matcha"
              selected
              removable
              onRemove={() => toggleFilter(option.id)}
            >
              {option.emoji} {option.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  )
}
