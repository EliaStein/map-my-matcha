import { useState, useEffect, useCallback, useRef } from 'react'
import { getCafesPage, searchCafes } from '../services/cafes'

export function useCafes(filters = {}) {
  const [cafes, setCafes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)

  // Stable key so a new (but equal) filters object doesn't refetch
  const filtersKey = JSON.stringify(filters)
  const cursorRef = useRef(null)
  // Guards against a slow response overwriting a newer one
  const requestIdRef = useRef(0)

  const fetchCafes = useCallback(async () => {
    const requestId = ++requestIdRef.current
    try {
      setLoading(true)
      setError(null)
      cursorRef.current = null
      const page = await getCafesPage({ filters: JSON.parse(filtersKey) })
      if (requestId !== requestIdRef.current) return
      setCafes(page.cafes)
      cursorRef.current = page.cursor
      setHasMore(page.hasMore)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err.message)
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [filtersKey])

  useEffect(() => {
    fetchCafes()
  }, [fetchCafes])

  const loadMore = async () => {
    if (!cursorRef.current || loadingMore || loading) return

    const requestId = requestIdRef.current
    try {
      setLoadingMore(true)
      const page = await getCafesPage({
        filters: JSON.parse(filtersKey),
        cursor: cursorRef.current
      })
      if (requestId !== requestIdRef.current) return
      setCafes(prev => [...prev, ...page.cafes])
      cursorRef.current = page.cursor
      setHasMore(page.hasMore)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const search = async (term) => {
    if (!term.trim()) {
      fetchCafes()
      return
    }

    const requestId = ++requestIdRef.current
    try {
      setLoading(true)
      setError(null)
      const data = await searchCafes(term)
      if (requestId !== requestIdRef.current) return
      setCafes(data)
      setHasMore(false)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err.message)
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }

  return {
    cafes,
    loading,
    loadingMore,
    hasMore,
    error,
    refetch: fetchCafes,
    loadMore,
    search
  }
}
