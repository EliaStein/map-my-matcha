import { useState, useEffect, useCallback } from 'react'
import { getReviewsByCafe, getReviewsByUser, createReview } from '../services/reviews'

export function useReviews(cafeId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = useCallback(async () => {
    if (!cafeId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getReviewsByCafe(cafeId)
      setReviews(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cafeId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const addReview = async (reviewData) => {
    const newReview = await createReview({
      ...reviewData,
      cafeId
    })
    setReviews(prev => [newReview, ...prev])
    return newReview
  }

  return {
    reviews,
    loading,
    error,
    addReview,
    refetch: fetchReviews
  }
}

export function useUserReviews(userId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getReviewsByUser(userId)
        setReviews(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [userId])

  return { reviews, loading, error }
}
