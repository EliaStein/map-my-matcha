import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUser, updatePreferences } from '../services/users'
import { uploadProfileImage } from '../services/storage'
import { updateProfile } from 'firebase/auth'
import { auth } from '../config/firebase'

export function useUserProfile() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateDisplayName = useCallback(async (displayName) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await updateProfile(auth.currentUser, { displayName })
      await updateUser(user.uid, { displayName })
      await refreshUserProfile()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, refreshUserProfile])

  const updateProfilePhoto = useCallback(async (file) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const photoURL = await uploadProfileImage(user.uid, file)
      await updateProfile(auth.currentUser, { photoURL })
      await updateUser(user.uid, { photoURL })
      await refreshUserProfile()
      return photoURL
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, refreshUserProfile])

  const updateUserPreferences = useCallback(async (preferences) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await updatePreferences(user.uid, preferences)
      await refreshUserProfile()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, refreshUserProfile])

  return {
    user,
    profile: userProfile,
    loading,
    error,
    updateDisplayName,
    updateProfilePhoto,
    updateUserPreferences
  }
}
