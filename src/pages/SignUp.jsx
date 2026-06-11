import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Leaf } from 'lucide-react'
import { Button, Input } from '../components/common'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const { signUp } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, displayName)
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = displayName && email && password && confirmPassword

  return (
    <div className="min-h-screen bg-hero-pattern relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-matcha-medium/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-matcha-light/40 rounded-full blur-3xl" />
        <Leaf className="absolute top-24 left-[20%] w-8 h-8 text-matcha-medium/20 animate-float" />
        <Leaf className="absolute bottom-32 right-[15%] w-6 h-6 text-matcha-dark/15 animate-float" style={{ animationDelay: '2s' }} />
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
                Create account
              </h1>
              <p className="text-gray-500">
                Join the matcha community today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Display Name"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Enter password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={!isFormValid}
                className="mt-2"
              >
                Create Account
              </Button>

              <p className="text-xs text-gray-400 text-center">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-matcha-dark">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline hover:text-matcha-dark">Privacy Policy</Link>.
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-matcha-dark font-semibold hover:underline">
                  Sign in
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
