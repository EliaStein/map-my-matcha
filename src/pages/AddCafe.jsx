import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJsApiLoader } from '@react-google-maps/api'
import { ChevronLeft, MapPin, Plus, X, Camera, Leaf } from 'lucide-react'
import { Button, Input, Tag } from '../components/common'
import { addCafe } from '../services/cafes'
import { uploadImage, compressImage } from '../services/storage'
import { track } from '../services/analytics'

// Resolve the typed address to coordinates via the Maps JS Geocoder.
// Returns null (cafe still saves, just won't appear on the map) if the
// API isn't loaded or the address can't be resolved.
async function geocodeAddress(address) {
  if (!window.google?.maps?.Geocoder) return null
  try {
    const geocoder = new window.google.maps.Geocoder()
    const { results } = await geocoder.geocode({ address })
    const loc = results?.[0]?.geometry?.location
    return loc ? { lat: loc.lat(), lng: loc.lng() } : null
  } catch (err) {
    console.error('Geocoding failed:', err)
    return null
  }
}

const FEATURE_OPTIONS = [
  { id: 'isOrganic', label: 'Organic', emoji: '🌱' },
  { id: 'isCeremonial', label: 'Ceremonial Grade', emoji: '🏆' },
  { id: 'hasWhisk', label: 'Whisked', emoji: '🥄' },
  { id: 'hasNonDairyMilk', label: 'Non-Dairy Milk', emoji: '🥛' },
  { id: 'hasWifi', label: 'WiFi', emoji: '📶' }
]

const PRICE_LEVELS = [
  { level: 1, label: '$' },
  { level: 2, label: '$$' },
  { level: 3, label: '$$$' },
  { level: 4, label: '$$$$' }
]

export default function AddCafe() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load the Maps JS API so geocodeAddress works on submit
  useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [priceLevel, setPriceLevel] = useState(2)
  const [features, setFeatures] = useState({})
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)

  const toggleFeature = (featureId) => {
    setFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }))
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove))
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file, 1200, 0.8)
        setCoverImage(compressed)
        setCoverImagePreview(URL.createObjectURL(compressed))
      } catch (err) {
        console.error('Error processing image:', err)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !address.trim()) {
      setError('Name and address are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      let coverImageUrl = null

      if (coverImage) {
        const timestamp = Date.now()
        const path = `cafes/user-submitted/${timestamp}.jpg`
        coverImageUrl = await uploadImage(coverImage, path)
      }

      const location = await geocodeAddress(address.trim())

      const cafeData = {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        location,
        coverImage: coverImageUrl || 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&q=80',
        images: [],
        priceLevel,
        tags,
        isOrganic: features.isOrganic || false,
        isCeremonial: features.isCeremonial || false,
        hasWhisk: features.hasWhisk || false,
        hasNonDairyMilk: features.hasNonDairyMilk || false,
        hasWifi: features.hasWifi || false
      }

      const newCafe = await addCafe(cafeData)
      track('cafe_added', { cafe_name: cafeData.name, geocoded: location !== null })
      navigate(`/cafe/${newCafe.id}`)
    } catch (err) {
      console.error('Error adding cafe:', err)
      setError('Failed to add cafe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-pattern relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-matcha-medium/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -left-20 w-64 h-64 bg-matcha-light/40 rounded-full blur-3xl" />
        <Leaf className="absolute top-32 right-[15%] w-8 h-8 text-matcha-medium/20 animate-float" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add a Cafe</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>
              {coverImagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null)
                      setCoverImagePreview(null)
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-matcha-dark hover:bg-matcha-light/10 transition-colors">
                  <Camera className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload a photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Name */}
            <Input
              label="Cafe Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Matcha Magic"
              required
            />

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-matcha-dark focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about this cafe..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-matcha-dark focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Price Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Level
              </label>
              <div className="flex gap-2">
                {PRICE_LEVELS.map(({ level, label }) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriceLevel(level)}
                    className={`
                      flex-1 py-3 rounded-xl font-medium transition-all
                      ${priceLevel === level
                        ? 'bg-matcha-dark text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleFeature(id)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-full
                      border-2 transition-all
                      ${features[id]
                        ? 'border-matcha-dark bg-matcha-light text-matcha-darker'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    <span>{emoji}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (up to 5)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-matcha-dark focus:outline-none transition-colors"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      variant="matcha"
                      selected
                      removable
                      onRemove={() => removeTag(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!name.trim() || !address.trim()}
            >
              Add Cafe
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
