import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { updateCafeRating } from './cafes'

const REVIEWS_COLLECTION = 'reviews'

export async function getReviewsByCafe(cafeId, limitCount = 50) {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('cafeId', '==', cafeId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
  } catch (error) {
    console.error('Error fetching reviews:', error)
    throw error
  }
}

export async function getReviewsByUser(userId, limitCount = 50) {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    throw error
  }
}

export async function createReview({ cafeId, userId, userDisplayName, userPhotoURL, rating, text, images = [] }) {
  try {
    const reviewData = {
      cafeId,
      userId,
      userDisplayName,
      userPhotoURL,
      rating,
      text,
      images,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData)

    // Update cafe rating
    await updateCafeRating(cafeId, rating)

    return {
      id: docRef.id,
      ...reviewData,
      createdAt: new Date()
    }
  } catch (error) {
    console.error('Error creating review:', error)
    throw error
  }
}

export async function deleteReview(reviewId) {
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId))
  } catch (error) {
    console.error('Error deleting review:', error)
    throw error
  }
}

export async function getReviewById(reviewId) {
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate()
    }
  } catch (error) {
    console.error('Error fetching review:', error)
    throw error
  }
}
