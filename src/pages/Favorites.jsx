import { useState, useEffect } from 'react'
import { Heart, Leaf } from 'lucide-react'
import { Header } from '../components/layout'
import { CafeCard } from '../components/cafe'
import { Loader } from '../components/common'
import { useFavorites } from '../hooks'
import { getCafeById } from '../services/cafes'

export default function Favorites() {
  const { favorites } = useFavorites()
  const [cafes, setCafes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavoriteCafes = async () => {
      if (!favorites || favorites.length === 0) {
        setCafes([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const cafePromises = favorites.map(id => getCafeById(id))
        const results = await Promise.all(cafePromises)
        setCafes(results.filter(Boolean))
      } catch (error) {
        console.error('Error fetching favorite cafes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavoriteCafes()
  }, [favorites])

  return (
    <div className="min-h-screen relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-[5%] w-48 h-48 bg-red-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-matcha-light/20 rounded-full blur-3xl" />
        <Leaf className="absolute top-40 left-[15%] w-6 h-6 text-matcha-medium/20 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Desktop top padding */}
      <div className="hidden md:block h-16" />

      <Header title="Favorites" />

      <div className="relative z-10 px-4 md:px-6 py-4 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader text="Loading favorites..." />
          </div>
        ) : cafes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Tap the heart icon on any cafe to save it to your favorites for easy access later
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {cafes.length} saved cafe{cafes.length !== 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {cafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
