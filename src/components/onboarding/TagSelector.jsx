import { Check } from 'lucide-react'

export default function TagSelector({
  tags,
  selected,
  onChange,
  columns = 2
}) {
  const toggleTag = (tagId) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter(id => id !== tagId))
    } else {
      onChange([...selected, tagId])
    }
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {tags.map((tag) => {
        const isSelected = selected.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`
              relative flex items-center gap-3 p-4 rounded-xl
              border-2 transition-all duration-200
              text-left
              ${isSelected
                ? 'border-matcha-dark bg-matcha-light/50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <span className="text-2xl">{tag.emoji}</span>
            <span className={`text-sm font-medium ${isSelected ? 'text-matcha-darker' : 'text-gray-700'}`}>
              {tag.label}
            </span>
            {isSelected && (
              <div className="absolute top-2 right-2">
                <Check className="w-4 h-4 text-matcha-dark" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
