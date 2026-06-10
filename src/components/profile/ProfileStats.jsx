import { Heart, MessageSquare } from 'lucide-react'

export default function ProfileStats({ reviewCount = 0, favoriteCount = 0 }) {
  const stats = [
    { icon: MessageSquare, label: 'Reviews', value: reviewCount },
    { icon: Heart, label: 'Favorites', value: favoriteCount }
  ]

  return (
    <div className="flex justify-center gap-8 py-4 px-6 bg-matcha-light/30 rounded-xl">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Icon className="w-4 h-4 text-matcha-dark" />
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  )
}
