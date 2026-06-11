import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

const REPORTS_COLLECTION = 'reports'

// Content reports land in a write-only collection, reviewed manually in
// the Firebase console (filter by status == 'open').
export async function submitReport({ targetType, targetId, cafeId = null, reason, reporterId }) {
  try {
    await addDoc(collection(db, REPORTS_COLLECTION), {
      targetType,
      targetId,
      cafeId,
      reason,
      reporterId,
      status: 'open',
      createdAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error submitting report:', error)
    throw error
  }
}
