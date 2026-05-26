import { useNavigate } from 'react-router-dom'
import { MapPin, Heart, DollarSign } from 'lucide-react'
import { Tag, Card } from '../common'
import { useFavorites } from '../../hooks'
import { useAuth } from '../../context/AuthContext'
import CafePlaceholderImage from './CafePlaceholderImage'

export default function CafeCard({ cafe, distance }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isAuthenticated && isFavorite(cafe.id)

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    toggleFavorite(cafe.id)
  }

  return (
    <Card
      padding="none"
      onClick={() => navigate(`/cafe/${cafe.id}`)}
      className="overflow-hidden card-hover"
    >
      {/* Cover Image */}
      <div className="relative h-40 md:h-48">
        {cafe.coverImage
          ? <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover" />
          : <CafePlaceholderImage className="w-full h-full" />
        }
        <button
          onClick={handleFavoriteClick}
          className={`
            absolute top-3 right-3 p-2 rounded-full
            ${favorited ? 'bg-red-500' : 'bg-white/90 backdrop-blur-sm'}
            shadow-md transition-all duration-200
            hover:scale-110 active:scale-95
          `}
        >
          <Heart
            className={`w-5 h-5 ${favorited ? 'fill-white text-white' : 'text-gray-600'}`}
          />
        </button>

        {/* Price Level */}
        <div className="absolute bottom-3 left-3 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          {[...Array(4)].map((_, i) => (
            <DollarSign
              key={i}
              className={`w-3.5 h-3.5 -ml-1 first:ml-0 ${
                i < (cafe.priceLevel || 2) ? 'text-matcha-dark' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {cafe.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{cafe.address}</span>
          {distance && (
            <span className="text-matcha-dark font-medium ml-auto flex-shrink-0">
              {distance}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {cafe.isOrganic && (
            <Tag size="sm" variant="matcha">Organic</Tag>
          )}
          {cafe.isCeremonial && (
            <Tag size="sm" variant="matcha">Ceremonial</Tag>
          )}
          {cafe.hasWifi && (
            <Tag size="sm">WiFi</Tag>
          )}
          {cafe.hasNonDairyMilk && (
            <Tag size="sm">Non-Dairy</Tag>
          )}
        </div>
      </div>
    </Card>
  )
}
