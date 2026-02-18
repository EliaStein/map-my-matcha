import CafeCard from './CafeCard'
import { Loader } from '../common'
import { Coffee } from 'lucide-react'

export default function CafeList({
  cafes,
  loading,
  emptyMessage = 'No cafes found',
  getDistance
}) {
  if (loading) {
    return (
      <div className="col-span-full flex items-center justify-center py-16">
        <Loader text="Loading cafes..." />
      </div>
    )
  }

  if (!cafes || cafes.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-matcha-light rounded-full flex items-center justify-center mb-4">
          <Coffee className="w-8 h-8 text-matcha-dark" />
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {cafes.map((cafe) => (
        <CafeCard
          key={cafe.id}
          cafe={cafe}
          distance={getDistance?.(cafe)}
        />
      ))}
    </>
  )
}
