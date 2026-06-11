import { useState } from 'react'
import { Star, Camera, X } from 'lucide-react'
import { Button } from '../common'
import { useAuth } from '../../context/AuthContext'
import { uploadReviewImage, compressImage } from '../../services/storage'
import { track } from '../../services/analytics'

export default function ReviewForm({ onSubmit, onCancel }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 3) {
      setError('Maximum 3 images allowed')
      return
    }

    const newImages = []
    for (const file of files) {
      const compressed = await compressImage(file)
      const preview = URL.createObjectURL(compressed)
      newImages.push({ file: compressed, preview })
    }
    setImages(prev => [...prev, ...newImages])
    setError('')
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload images into the user's own folder (enforced by storage rules)
      const imageUrls = []
      for (let i = 0; i < images.length; i++) {
        const url = await uploadReviewImage(user.uid, images[i].file, i)
        imageUrls.push(url)
      }

      await onSubmit({
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoURL: user.photoURL,
        rating,
        text: text.trim(),
        images: imageUrls
      })

      track('review_submitted', { rating, has_photos: images.length > 0 })

      // Reset form
      setRating(0)
      setText('')
      setImages([])
    } catch (err) {
      console.error(err)
      setError('Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-8 h-8 ${
                  value <= rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (optional)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="
            w-full px-4 py-3 rounded-xl border-2 border-gray-200
            text-gray-900 placeholder-gray-400
            transition-all duration-200 resize-none
            focus:outline-none focus:border-matcha-dark focus:ring-2 focus:ring-matcha-medium/20
          "
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (optional)
        </label>

        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative w-20 h-20">
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {images.length < 3 && (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-matcha-dark hover:bg-matcha-light/20 transition-colors">
              <Camera className="w-6 h-6 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={rating === 0}
        >
          Submit Review
        </Button>
      </div>
    </form>
  )
}
