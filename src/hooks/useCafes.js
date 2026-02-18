import { useState, useEffect, useCallback } from 'react'
import { getCafes, searchCafes } from '../services/cafes'

export function useCafes(filters = {}) {
  const [cafes, setCafes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCafes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCafes(filters)
      setCafes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchCafes()
  }, [fetchCafes])

  const search = async (term) => {
    if (!term.trim()) {
      fetchCafes()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await searchCafes(term)
      setCafes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    cafes,
    loading,
    error,
    refetch: fetchCafes,
    search
  }
}
