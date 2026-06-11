import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Edit2, LogOut, ChevronRight, Tag, Leaf, Trash2 } from 'lucide-react'
import { Header } from '../components/layout'
import { Card, Loader, Button, Input, Modal } from '../components/common'
import { ProfileHeader, ProfileStats, EditProfileForm } from '../components/profile'
import { ReviewCard } from '../components/review'
import { useAuth } from '../context/AuthContext'
import { useUserProfile, useUserReviews, useFavorites } from '../hooks'
import { compressImage } from '../services/storage'
import { track } from '../services/analytics'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logOut, userProfile, deleteAccount } = useAuth()
  const { updateDisplayName, updateProfilePhoto, loading } = useUserProfile()
  const { reviews, loading: reviewsLoading } = useUserReviews(user?.uid)
  const { favorites } = useFavorites()
  const [isEditing, setIsEditing] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount(deletePassword)
      track('account_deleted')
      navigate('/', { replace: true })
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setDeleteError('Incorrect password')
      } else {
        console.error('Error deleting account:', error)
        setDeleteError('Failed to delete account. Please try again.')
      }
      setDeleting(false)
    }
  }

  const handlePhotoChange = async (file) => {
    setPhotoLoading(true)
    try {
      const compressed = await compressImage(file, 400, 0.8)
      await updateProfilePhoto(compressed)
    } catch (error) {
      console.error('Error updating photo:', error)
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleNameSave = async (name) => {
    await updateDisplayName(name)
    setIsEditing(false)
  }

  const handleLogout = async () => {
    try {
      await logOut()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleEditPreferences = () => {
    navigate('/onboarding')
  }

  // Get active preferences
  const activePreferences = Object.entries(userProfile?.preferences || {})
    .filter(([, value]) => value === true)
    .map(([key]) => key)

  return (
    <div className="min-h-screen relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-matcha-medium/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-[5%] w-48 h-48 bg-matcha-light/30 rounded-full blur-3xl" />
        <Leaf className="absolute top-32 left-[20%] w-6 h-6 text-matcha-medium/20 animate-float" />
      </div>

      {/* Desktop top padding */}
      <div className="hidden md:block h-16" />

      <Header
        title="Profile"
        rightAction={
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Edit2 className="w-5 h-5 text-gray-700" />
          </button>
        }
      />

      <div className="relative z-10 px-4 md:px-6 py-4 max-w-4xl mx-auto">
        <div className="md:grid md:grid-cols-3 md:gap-8">
          {/* Left column - Profile info */}
          <div className="md:col-span-1">
            <Card className="mb-4">
              <ProfileHeader
                user={user}
                profile={userProfile}
                onPhotoChange={handlePhotoChange}
                loading={photoLoading}
              />

              {isEditing ? (
                <div className="px-4 pb-4">
                  <EditProfileForm
                    initialName={user?.displayName || ''}
                    onSave={handleNameSave}
                    onCancel={() => setIsEditing(false)}
                    loading={loading}
                  />
                </div>
              ) : (
                <ProfileStats
                  reviewCount={reviews?.length || 0}
                  favoriteCount={favorites?.length || 0}
                />
              )}
            </Card>

            {/* Preferences */}
            <Card className="mb-4" padding="none">
              <button
                onClick={handleEditPreferences}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-matcha-light rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-matcha-dark" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Preferences</p>
                    <p className="text-sm text-gray-500">
                      {activePreferences.length} preferences set
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>

            {/* Logout */}
            <Card padding="none" className="hidden md:block">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 transition-colors rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </Card>
          </div>

          {/* Right column - Reviews */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">My Reviews</h3>
              {reviewsLoading ? (
                <Loader text="Loading reviews..." />
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📝</span>
                  </div>
                  <p className="text-gray-500 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400">
                    Share your matcha experiences with the community
                  </p>
                </Card>
              )}
            </div>

            {/* Mobile logout */}
            <Card padding="none" className="md:hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 transition-colors rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </Card>

            {/* Legal + account deletion */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
              <Link to="/terms" className="hover:text-matcha-dark">Terms of Service</Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-matcha-dark">Privacy Policy</Link>
              <span>·</span>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="hover:text-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletePassword('')
          setDeleteError('')
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This permanently deletes your account, including your profile,
            all your reviews, and uploaded photos. This cannot be undone.
          </p>

          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {deleteError}
            </div>
          )}

          <Input
            label="Confirm your password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <Button
            fullWidth
            onClick={handleDeleteAccount}
            loading={deleting}
            disabled={!deletePassword}
            className="!bg-red-500 hover:!bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Permanently Delete My Account
          </Button>
        </div>
      </Modal>
    </div>
  )
}
