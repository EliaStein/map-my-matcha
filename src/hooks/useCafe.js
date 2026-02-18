import { useState, useEffect } from 'react'
import { getCafeById } from '../services/cafes'

export function useCafe(cafeId) {
  const [cafe, setCafe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cafeId) {
      setLoading(false)
      return
    }

    const fetchCafe = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCafeById(cafeId)
        setCafe(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCafe()
  }, [cafeId])

  return { cafe, loading, error }
}
