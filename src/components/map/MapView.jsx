import { useState, useCallback, useEffect, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import { Loader, Rating } from '../common'
import LocationButton from './LocationButton'

// Create matcha marker icon matching the app logo exactly
const createMatchaMarkerIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <!-- Shadow -->
      <rect x="2" y="2" width="36" height="36" rx="10" fill="rgba(0,0,0,0.2)"/>
      <!-- Dark green rounded square background (matches logo) -->
      <rect x="0" y="0" width="36" height="36" rx="10" fill="#4A7C3F"/>
      <!-- Matcha cup emoji as text -->
      <text x="18" y="26" font-size="20" text-anchor="middle">🍵</text>
    </svg>
  `
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim())
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

// Default to Rittenhouse Square, Philadelphia
const defaultCenter = {
  lat: 39.9496,
  lng: -75.1718
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  zoomControlOptions: {
    position: 3 // google.maps.ControlPosition.TOP_RIGHT
  },
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

export default function MapView({ cafes, userLocation, onRequestLocation }) {
  const navigate = useNavigate()
  const [, setMap] = useState(null)
  const [selectedCafe, setSelectedCafe] = useState(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  })

  // Memoize the marker icon URL
  const matchaMarkerUrl = useMemo(() => createMatchaMarkerIcon(), [])

  const onLoad = useCallback((map) => {
    setMap(map)
  }, [])

  // Automatically request location when map view opens
  useEffect(() => {
    if (!userLocation && onRequestLocation) {
      onRequestLocation()
    }
  }, []) // Only run once on mount

  const center = userLocation || defaultCenter

  const handleMarkerClick = (cafe) => {
    setSelectedCafe(cafe)
  }

  const handleInfoWindowClick = () => {
    if (selectedCafe) {
      navigate(`/cafe/${selectedCafe.id}`)
    }
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">Error loading maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <Loader text="Loading map..." />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        options={mapOptions}
        onLoad={onLoad}
      >
        {/* User Location Marker */}
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4A7C3F',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 3
            }}
          />
        )}

        {/* Cafe Markers */}
        {cafes.map((cafe) => (
          cafe.location && (
            <MarkerF
              key={cafe.id}
              position={{ lat: cafe.location.lat, lng: cafe.location.lng }}
              onClick={() => handleMarkerClick(cafe)}
              icon={{
                url: matchaMarkerUrl,
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20)
              }}
            />
          )
        ))}

        {/* Info Window */}
        {selectedCafe && selectedCafe.location && (
          <InfoWindowF
            position={{ lat: selectedCafe.location.lat, lng: selectedCafe.location.lng }}
            onCloseClick={() => setSelectedCafe(null)}
          >
            <button
              onClick={handleInfoWindowClick}
              className="p-1 text-left min-w-[180px]"
            >
              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedCafe.name}
              </h3>
              {selectedCafe.totalReviews > 0
                ? <Rating value={selectedCafe.averageRating || 0} size="sm" showValue />
                : <p className="text-xs text-gray-400">No reviews yet</p>
              }
              <p className="text-xs text-gray-500 mt-1">
                Tap to view details
              </p>
            </button>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Location Button */}
      {!userLocation && onRequestLocation && (
        <LocationButton onClick={onRequestLocation} />
      )}
    </div>
  )
}
