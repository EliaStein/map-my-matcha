import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics only runs in production builds (so local dev clicks don't
// pollute the data) and only in browsers that support it. `analytics` is
// a live ESM binding - consumers see the value once init resolves.
export let analytics = null
if (import.meta.env.PROD && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  isSupported()
    .then(supported => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
    .catch(() => {})
}

export default app
