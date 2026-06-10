import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { addRatingToStats, removeRatingFromStats } from '../utils/rating'

const REVIEWS_COLLECTION = 'reviews'
const CAFES_COLLECTION = 'cafes'

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

    // Create the review and update the cafe's denormalized rating stats
    // in one transaction so concurrent reviews can't clobber the counts.
    const reviewRef = doc(collection(db, REVIEWS_COLLECTION))
    const cafeRef = doc(db, CAFES_COLLECTION, cafeId)

    await runTransaction(db, async (tx) => {
      const cafeSnap = await tx.get(cafeRef)
      if (!cafeSnap.exists()) {
        throw new Error('Cafe not found')
      }
      tx.set(reviewRef, reviewData)
      tx.update(cafeRef, addRatingToStats(cafeSnap.data(), rating))
    })

    return {
      id: reviewRef.id,
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
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId)

    await runTransaction(db, async (tx) => {
      const reviewSnap = await tx.get(reviewRef)
      if (!reviewSnap.exists()) {
        return
      }

      const { cafeId, rating } = reviewSnap.data()
      const cafeRef = doc(db, CAFES_COLLECTION, cafeId)
      const cafeSnap = await tx.get(cafeRef)

      tx.delete(reviewRef)
      if (cafeSnap.exists()) {
        tx.update(cafeRef, removeRatingFromStats(cafeSnap.data(), rating))
      }
    })
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
