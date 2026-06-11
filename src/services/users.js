import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { ref, listAll, deleteObject } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { getReviewsByUser, deleteReview } from './reviews'

const USERS_COLLECTION = 'users'

export async function getUser(userId) {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function updateUser(userId, data) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, data)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function updatePreferences(userId, preferences) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, { preferences })
  } catch (error) {
    console.error('Error updating preferences:', error)
    throw error
  }
}

export async function addFavorite(userId, cafeId) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      favorites: arrayUnion(cafeId)
    })
  } catch (error) {
    console.error('Error adding favorite:', error)
    throw error
  }
}

export async function removeFavorite(userId, cafeId) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      favorites: arrayRemove(cafeId)
    })
  } catch (error) {
    console.error('Error removing favorite:', error)
    throw error
  }
}

export async function getFavorites(userId) {
  try {
    const user = await getUser(userId)
    return user?.favorites || []
  } catch (error) {
    console.error('Error fetching favorites:', error)
    throw error
  }
}

export async function blockUser(userId, blockedUserId) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      blockedUsers: arrayUnion(blockedUserId)
    })
  } catch (error) {
    console.error('Error blocking user:', error)
    throw error
  }
}

export async function unblockUser(userId, blockedUserId) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      blockedUsers: arrayRemove(blockedUserId)
    })
  } catch (error) {
    console.error('Error unblocking user:', error)
    throw error
  }
}

// Removes everything a user owns. Reviews go through the transactional
// delete so cafe rating stats stay correct; storage cleanup is
// best-effort. Must run while the user is still authenticated.
export async function deleteAccountData(userId) {
  const reviews = await getReviewsByUser(userId, 500)
  for (const review of reviews) {
    await deleteReview(review.id)
  }

  try {
    const reviewFolder = ref(storage, `reviews/${userId}`)
    const { items } = await listAll(reviewFolder)
    await Promise.all(items.map(item => deleteObject(item)))
  } catch {
    // No review photos, or listing failed - not worth blocking deletion
  }

  try {
    await deleteObject(ref(storage, `users/${userId}/profile.jpg`))
  } catch {
    // No profile photo
  }

  await deleteDoc(doc(db, USERS_COLLECTION, userId))
}
