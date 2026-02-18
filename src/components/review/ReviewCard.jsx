import { User } from 'lucide-react'
import { Rating } from '../common'

export default function ReviewCard({ review }) {
  const formatDate = (date) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-matcha-light flex items-center justify-center flex-shrink-0 overflow-hidden">
          {review.userPhotoURL ? (
            <img
              src={review.userPhotoURL}
              alt={review.userDisplayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-matcha-dark" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-gray-900 truncate">
              {review.userDisplayName || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <Rating value={review.rating} size="sm" />
        </div>
      </div>

      {/* Review Text */}
      {review.text && (
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          {review.text}
        </p>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review photo ${index + 1}`}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  )
}
