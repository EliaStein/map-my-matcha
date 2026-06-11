import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Heart, Share2, Plus, LogIn, Flag } from 'lucide-react'
import { Button, Loader, ReportDialog } from '../components/common'
import { CafeInfo, CafePlaceholderImage } from '../components/cafe'
import { PhotoGallery } from '../components/photo'
import { ReviewList, ReviewForm } from '../components/review'
import { useCafe, useReviews, useFavorites } from '../hooks'
import { useAuth } from '../context/AuthContext'
import { track } from '../services/analytics'
import { submitReport } from '../services/reports'
import { blockUser } from '../services/users'

export default function CafeProfile() {
  const { cafeId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user, userProfile, refreshUserProfile } = useAuth()
  const { cafe, loading: cafeLoading, error: cafeError } = useCafe(cafeId)
  const { reviews, loading: reviewsLoading, addReview, refetch: refetchReviews } = useReviews(cafeId)
  const { isFavorite, toggleFavorite } = useFavorites()
  const [showReviewForm, setShowReviewForm] = useState(false)
  // null = closed, { type: 'cafe' } or { type: 'review', review } = open
  const [reportTarget, setReportTarget] = useState(null)

  // Hide content from users the viewer has blocked (App Store UGC rule)
  const blockedUsers = userProfile?.blockedUsers || []
  const visibleReviews = reviews.filter(r => !blockedUsers.includes(r.userId))

  const favorited = isAuthenticated && isFavorite(cafeId)

  useEffect(() => {
    if (cafe) {
      track('cafe_viewed', { cafe_id: cafeId, cafe_name: cafe.name })
    }
  }, [cafe, cafeId])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: cafe?.name,
          text: `Check out ${cafe?.name} on MapMyMatcha!`,
          url: window.location.href
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    toggleFavorite(cafeId)
  }

  const handleAddReviewClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowReviewForm(true)
  }

  const handleReviewSubmit = async (reviewData) => {
    await addReview(reviewData)
    setShowReviewForm(false)
    refetchReviews()
  }

  const handleReportClick = (target) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setReportTarget(target)
  }

  const handleReportSubmit = async (reason) => {
    await submitReport({
      targetType: reportTarget.type,
      targetId: reportTarget.type === 'review' ? reportTarget.review.id : cafeId,
      cafeId,
      reason,
      reporterId: user.uid
    })
    track('report_submitted', { target_type: reportTarget.type })
  }

  const handleBlockUser = async () => {
    await blockUser(user.uid, reportTarget.review.userId)
    await refreshUserProfile()
    track('user_blocked')
  }

  if (cafeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matcha-pattern">
        <Loader text="Loading cafe..." />
      </div>
    )
  }

  if (cafeError || !cafe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-matcha-pattern px-6">
        <p className="text-gray-500 mb-4">Cafe not found</p>
        <Button onClick={() => navigate('/discover')}>Back to Discovery</Button>
      </div>
    )
  }

  const reviewImages = reviews.flatMap(r => r.images || [])
  const allImages = [cafe.coverImage, ...(cafe.images || []), ...reviewImages].filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed header - always at very top */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => navigate('/favorites')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="View Favorites"
              >
                <Heart className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      <div className="max-w-4xl mx-auto pb-24 md:pb-8">
        {/* Photo Gallery */}
        <div className="px-4 mb-6">
          {allImages.length > 0
            ? <PhotoGallery images={allImages} />
            : <CafePlaceholderImage className="w-full h-64 rounded-xl" />
          }
        </div>

        {/* Content grid for desktop */}
        <div className="px-4 md:grid md:grid-cols-3 md:gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            {/* Cafe Info */}
            <div className="mb-8">
              <CafeInfo cafe={cafe} />
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {cafe.totalReviews > 0
                    ? `Reviews (${cafe.totalReviews})`
                    : 'Be the first to review!'
                  }
                </h2>
                {!showReviewForm && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddReviewClick}
                  >
                    <Plus className="w-4 h-4" />
                    Add Review
                  </Button>
                )}
              </div>

              {showReviewForm && isAuthenticated && (
                <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                  <ReviewForm
                    cafeId={cafeId}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              <ReviewList
                reviews={visibleReviews}
                loading={reviewsLoading}
                emptyMessage="Be the first to review this cafe!"
                onReport={(review) => handleReportClick({ type: 'review', review })}
                viewerId={user?.uid}
              />
            </div>

            {/* Report listing (App Store UGC requirement) */}
            <button
              onClick={() => handleReportClick({ type: 'cafe' })}
              className="mt-6 flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              Report this listing
            </button>
          </div>

          {/* Sidebar for desktop */}
          <div className="hidden md:block">
            <div className="sticky top-32 space-y-4">
              {/* Sign in prompt for guests */}
              {!isAuthenticated && (
                <div className="bg-matcha-light/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-matcha-dark rounded-full flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Join MapMyMatcha
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to save favorites and write reviews
                  </p>
                  <Link to="/signup">
                    <Button fullWidth size="sm">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/login" className="block mt-2 text-sm text-matcha-dark hover:underline">
                    Already have an account? Sign in
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
                    {favorited ? 'Saved to Favorites' : 'Save to Favorites'}
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                    Share This Cafe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReportDialog
        open={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        targetLabel={reportTarget?.type === 'review' ? 'Review' : 'Listing'}
        onSubmit={handleReportSubmit}
        onBlock={reportTarget?.type === 'review' ? handleBlockUser : undefined}
      />
    </div>
  )
}
