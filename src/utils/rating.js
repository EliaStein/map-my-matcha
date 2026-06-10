// Pure helpers for a cafe's denormalized rating stats
// ({ averageRating, totalReviews, ratingDistribution }).
// Called inside Firestore transactions so concurrent reviews can't
// clobber each other's counts.

function cloneDistribution(cafe) {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, ...(cafe.ratingDistribution || {}) }
}

export function addRatingToStats(cafe, rating) {
  const previousTotal = (cafe.averageRating || 0) * (cafe.totalReviews || 0)
  const totalReviews = (cafe.totalReviews || 0) + 1
  const averageRating = Math.round(((previousTotal + rating) / totalReviews) * 10) / 10

  const ratingDistribution = cloneDistribution(cafe)
  ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1

  return { averageRating, totalReviews, ratingDistribution }
}

export function removeRatingFromStats(cafe, rating) {
  const previousTotal = (cafe.averageRating || 0) * (cafe.totalReviews || 0)
  const totalReviews = Math.max((cafe.totalReviews || 0) - 1, 0)
  const averageRating = totalReviews === 0
    ? 0
    : Math.round(((previousTotal - rating) / totalReviews) * 10) / 10

  const ratingDistribution = cloneDistribution(cafe)
  ratingDistribution[rating] = Math.max((ratingDistribution[rating] || 0) - 1, 0)

  return { averageRating, totalReviews, ratingDistribution }
}
