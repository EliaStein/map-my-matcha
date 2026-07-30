import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Leaf } from 'lucide-react'
import { Button, GoogleButton, Input } from '../components/common'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { logIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await logIn(email, password)
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else {
        setError('Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email. Sign in with your password instead.')
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Failed to sign in with Google. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-pattern relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-matcha-medium/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-64 h-64 bg-matcha-light/40 rounded-full blur-3xl" />
        <Leaf className="absolute top-32 right-[20%] w-8 h-8 text-matcha-medium/20 animate-float" />
        <Leaf className="absolute bottom-40 left-[15%] w-6 h-6 text-matcha-dark/15 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-matcha-dark rounded-2xl mb-4">
                <span className="text-3xl">🍵</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-500">
                Sign in to continue exploring matcha cafes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={!email || !password}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="mt-5">
              <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} disabled={loading} />
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-matcha-dark font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <Link to="/discover" className="text-sm text-gray-500 hover:text-matcha-dark">
                Continue browsing as guest →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
