import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { deleteAccountData } from '../services/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          setUserProfile(userDoc.exists() ? userDoc.data() : null)
        } catch (error) {
          console.error('Error loading user profile:', error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email, password, displayName) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)

    await updateProfile(newUser, { displayName })

    const userData = {
      email,
      displayName,
      photoURL: null,
      createdAt: serverTimestamp(),
      hasCompletedOnboarding: false,
      preferences: {},
      favorites: []
    }

    await setDoc(doc(db, 'users', newUser.uid), userData)
    setUserProfile(userData)

    return newUser
  }

  const logIn = async (email, password) => {
    const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password)

    const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid))
    if (userDoc.exists()) {
      setUserProfile(userDoc.data())
    }

    return loggedInUser
  }

  const logOut = async () => {
    await signOut(auth)
    setUserProfile(null)
  }

  // App Store guideline 5.1.1: accounts must be deletable in-app.
  // Reauthenticates first (Firebase requires a recent login), removes the
  // user's data, then the auth record itself.
  const deleteAccount = async (password) => {
    const currentUser = auth.currentUser
    if (!currentUser?.email) {
      throw new Error('No signed-in user')
    }

    const credential = EmailAuthProvider.credential(currentUser.email, password)
    await reauthenticateWithCredential(currentUser, credential)

    await deleteAccountData(currentUser.uid)
    await deleteUser(currentUser)
    setUserProfile(null)
  }

  const refreshUserProfile = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        setUserProfile(userDoc.data())
      }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    logIn,
    logOut,
    deleteAccount,
    refreshUserProfile,
    isAuthenticated: !!user,
    hasCompletedOnboarding: userProfile?.hasCompletedOnboarding ?? false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
