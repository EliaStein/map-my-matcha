import { useState } from 'react'
import { Button, Loader } from '../components/common'
import { seedSampleCafes, clearAllCafes } from '../services/cafes'

export default function Seed() {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSeed = async () => {
    setLoading(true)
    setAction('seeding')
    setError(null)
    setResult(null)

    try {
      const res = await seedSampleCafes()
      setResult({ type: 'seed', ...res })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setAction('')
    }
  }

  const handleClearAndReseed = async () => {
    setLoading(true)
    setAction('clearing')
    setError(null)
    setResult(null)

    try {
      // First clear all cafes
      const clearRes = await clearAllCafes()
      console.log(`Cleared ${clearRes.count} cafes`)

      // Then seed new cafes
      setAction('seeding')
      const seedRes = await seedSampleCafes()
      setResult({ type: 'reseed', cleared: clearRes.count, added: seedRes.count })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setAction('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🍵</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Seed Database
        </h1>
        <p className="text-gray-500 mb-6">
          Add 64 real matcha cafes across NYC, LA, Philly, Boston, Chicago, and more.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
            {result.type === 'seed' && `Successfully added ${result.count} cafes!`}
            {result.type === 'reseed' && `Cleared ${result.cleared} cafes, added ${result.added} fresh cafes!`}
          </div>
        )}

        {loading ? (
          <Loader text={action === 'clearing' ? 'Clearing old cafes...' : 'Seeding database...'} />
        ) : (
          <div className="space-y-3">
            <Button onClick={handleClearAndReseed} fullWidth size="lg">
              Clear & Re-seed (Recommended)
            </Button>
            <Button onClick={handleSeed} fullWidth size="lg" variant="secondary">
              Add More Cafes
            </Button>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          &quot;Clear &amp; Re-seed&quot; removes all existing cafes and adds fresh data with updated images.
        </p>
      </div>
    </div>
  )
}
