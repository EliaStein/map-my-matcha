import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Map, List, MapPin, Plus } from 'lucide-react'
import { SearchBar, Loader } from '../components/common'
import { Header } from '../components/layout'
import { CafeList, CafeFilters } from '../components/cafe'
import MapView from '../components/map/MapView'
import { useCafes, useGeolocation, useSearch, sortByDistance, formatDistance, calculateDistance } from '../hooks'
import { getAllCafes } from '../services/cafes'

export default function Discovery() {
  const [viewMode, setViewMode] = useState('list')
  const [filters, setFilters] = useState({})
  const { cafes, loading, loadingMore, hasMore, loadMore, error } = useCafes(filters)
  const [allMapCafes, setAllMapCafes] = useState([])
  const [mapCafesLoaded, setMapCafesLoaded] = useState(false)

  useEffect(() => {
    if (viewMode === 'map' && !mapCafesLoaded) {
      const { maxPrice, ...serverFilters } = filters
      getAllCafes(serverFilters).then(data => {
        setAllMapCafes(data)
        setMapCafesLoaded(true)
      })
    }
  }, [viewMode, mapCafesLoaded])

  useEffect(() => {
    setMapCafesLoaded(false)
  }, [filters])
  const { location, requestLocation, loading: locationLoading } = useGeolocation()
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(
    cafes,
    ['name', 'address', 'tags', 'searchTerms']
  )

  // Sort by distance if we have user location
  const sortedCafes = useMemo(() => {
    return location ? sortByDistance(filteredItems, location) : filteredItems
  }, [filteredItems, location])

  const getDistance = (cafe) => {
    if (!location || !cafe.location) return null
    const distance = calculateDistance(
      location.lat,
      location.lng,
      cafe.location.lat,
      cafe.location.lng
    )
    return formatDistance(distance)
  }

  return (
    <div className="min-h-screen relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-matcha-medium/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-[5%] w-48 h-48 bg-matcha-light/30 rounded-full blur-3xl" />
      </div>

      {/* Desktop top padding for fixed nav */}
      <div className="hidden md:block h-16" />

      <Header
        title="Discover Matcha"
        rightAction={
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={viewMode === 'list' ? 'Show map' : 'Show list'}
          >
            {viewMode === 'list' ? (
              <Map className="w-5 h-5 text-gray-700" />
            ) : (
              <List className="w-5 h-5 text-gray-700" />
            )}
          </button>
        }
      />

      <div className="relative z-10 px-4 md:px-6 py-4 max-w-6xl mx-auto">
        {/* Search & Filters row */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search matcha cafes..."
            />
          </div>

          <div className="flex items-center gap-3">
            <CafeFilters filters={filters} onChange={setFilters} />

            {!location ? (
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-matcha-dark bg-matcha-light rounded-full hover:bg-matcha-medium/30 transition-colors whitespace-nowrap"
              >
                <MapPin className="w-4 h-4" />
                <span>{locationLoading ? 'Getting...' : 'Near me'}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-sm text-matcha-dark bg-matcha-light/50 px-3 py-2 rounded-full">
                <MapPin className="w-4 h-4" />
                Nearby
              </span>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && sortedCafes.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            {sortedCafes.length} cafe{sortedCafes.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <CafeList
                cafes={sortedCafes}
                loading={loading}
                emptyMessage={searchTerm ? 'No cafes match your search' : 'No cafes found'}
                getDistance={getDistance}
              />
            </div>
            {!loading && hasMore && !searchTerm && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-matcha-dark text-matcha-dark font-medium rounded-full hover:bg-matcha-light transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <Loader size="sm" /> : null}
                  {loadingMore ? 'Loading...' : 'Load more cafes'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] rounded-xl overflow-hidden shadow-lg">
            <MapView
              cafes={location ? sortByDistance(allMapCafes, location) : allMapCafes}
              userLocation={location}
              onRequestLocation={requestLocation}
            />
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Link
        to="/add-cafe"
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 w-14 h-14 bg-matcha-dark text-white rounded-full shadow-lg flex items-center justify-center hover:bg-matcha-darker hover:scale-105 active:scale-95 transition-all"
        title="Add a cafe"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}
