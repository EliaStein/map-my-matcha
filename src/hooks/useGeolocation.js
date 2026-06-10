import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }, [])

  return {
    location,
    error,
    loading,
    requestLocation
  }
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

export function sortByDistance(cafes, userLocation) {
  if (!userLocation) return cafes

  return [...cafes].sort((a, b) => {
    const distA = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      a.location?.lat || 0,
      a.location?.lng || 0
    )
    const distB = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      b.location?.lat || 0,
      b.location?.lng || 0
    )
    return distA - distB
  })
}

export function formatDistance(miles) {
  if (miles < 0.1) {
    return 'Nearby'
  } else if (miles < 1) {
    return `${Math.round(miles * 5280)} ft`
  } else {
    return `${miles.toFixed(1)} mi`
  }
}
