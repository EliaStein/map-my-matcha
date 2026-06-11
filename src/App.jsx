import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { trackPageView } from './services/analytics'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Onboarding from './pages/Onboarding'
import Discovery from './pages/Discovery'
import CafeProfile from './pages/CafeProfile'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Seed from './pages/Seed'
import AddCafe from './pages/AddCafe'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import MobileLayout from './components/layout/MobileLayout'
import Loader from './components/common/Loader'

// GA4 doesn't see client-side route changes; report each one as a page view
function AnalyticsPageViews() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return null
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matcha-pattern">
        <Loader size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function OnboardingGuard({ children }) {
  const { isAuthenticated, hasCompletedOnboarding, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matcha-pattern">
        <Loader size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, hasCompletedOnboarding, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matcha-pattern">
        <Loader size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/discover" replace />
  }

  return children
}

export default function App() {
  return (
    <>
      <AnalyticsPageViews />
      <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Landing />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignUp />
          </PublicOnlyRoute>
        }
      />

      {/* Onboarding (requires auth, shows once) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Discovery - accessible to everyone (guest mode) */}
      <Route
        path="/discover"
        element={
          <MobileLayout>
            <Discovery />
          </MobileLayout>
        }
      />

      {/* Cafe Profile - accessible to everyone (guest mode) */}
      <Route
        path="/cafe/:cafeId"
        element={<CafeProfile />}
      />

      {/* Protected routes - require auth */}
      <Route
        path="/favorites"
        element={
          <OnboardingGuard>
            <MobileLayout>
              <Favorites />
            </MobileLayout>
          </OnboardingGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <OnboardingGuard>
            <MobileLayout>
              <Profile />
            </MobileLayout>
          </OnboardingGuard>
        }
      />

      {/* Add Cafe - requires sign-in (Firestore rules require auth to create cafes) */}
      <Route
        path="/add-cafe"
        element={
          <ProtectedRoute>
            <AddCafe />
          </ProtectedRoute>
        }
      />

      {/* Legal pages - public */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Dev-only routes - stripped from production builds */}
      {import.meta.env.DEV && <Route path="/seed" element={<Seed />} />}

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
