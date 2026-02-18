import ReviewCard from './ReviewCard'
import { Loader } from '../common'
import { MessageSquare } from 'lucide-react'

export default function ReviewList({ reviews, loading, emptyMessage = 'No reviews yet' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader text="Loading reviews..." />
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}
