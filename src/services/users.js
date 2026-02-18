import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../config/firebase'

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
