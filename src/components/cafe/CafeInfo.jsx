import { MapPin, Clock, Phone, Globe, DollarSign, Navigation } from 'lucide-react'
import { Rating, Tag, Button } from '../common'

export default function CafeInfo({ cafe }) {
  const handleGetDirections = () => {
    const { lat, lng } = cafe.location || {}
    if (lat && lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        '_blank'
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {cafe.name}
          </h1>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[...Array(4)].map((_, i) => (
              <DollarSign
                key={i}
                className={`w-4 h-4 -ml-1 first:ml-0 ${
                  i < (cafe.priceLevel || 2) ? 'text-matcha-dark' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {cafe.totalReviews > 0 && (
          <div className="flex items-center gap-3">
            <Rating value={cafe.averageRating || 0} showValue />
            <span className="text-sm text-gray-500">
              ({cafe.totalReviews} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {cafe.description && (
        <p className="text-gray-600 leading-relaxed">
          {cafe.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {cafe.isOrganic && <Tag variant="matcha" selected>🌱 Organic</Tag>}
        {cafe.isCeremonial && <Tag variant="matcha" selected>🏆 Ceremonial</Tag>}
        {cafe.hasWhisk && <Tag variant="matcha" selected>🥄 Whisked</Tag>}
        {cafe.hasNonDairyMilk && <Tag>🥛 Non-Dairy</Tag>}
        {cafe.hasWifi && <Tag>📶 WiFi</Tag>}
        {cafe.tags?.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      {/* Location */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-matcha-dark flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-900 font-medium">
              {cafe.address}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          className="mt-4"
          onClick={handleGetDirections}
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </Button>
      </div>
    </div>
  )
}
