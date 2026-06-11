import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { addFavorite, removeFavorite } from '../services/users'
import { track } from '../services/analytics'

export function useFavorites() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFavorites(userProfile?.favorites || [])
  }, [userProfile])

  const isFavorite = useCallback((cafeId) => {
    return favorites.includes(cafeId)
  }, [favorites])

  const toggleFavorite = async (cafeId) => {
    if (!user) return

    setLoading(true)
    try {
      if (isFavorite(cafeId)) {
        await removeFavorite(user.uid, cafeId)
        setFavorites(prev => prev.filter(id => id !== cafeId))
        track('favorite_toggled', { cafe_id: cafeId, favorited: false })
      } else {
        await addFavorite(user.uid, cafeId)
        setFavorites(prev => [...prev, cafeId])
        track('favorite_toggled', { cafe_id: cafeId, favorited: true })
      }
      await refreshUserProfile()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    loading
  }
}
