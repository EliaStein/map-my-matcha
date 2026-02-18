import { Navigation } from 'lucide-react'

export default function LocationButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
        absolute bottom-4 right-4 z-10
        w-12 h-12 bg-white rounded-full
        shadow-lg border border-gray-200
        flex items-center justify-center
        hover:bg-gray-50 active:scale-95
        transition-all duration-200
        disabled:opacity-50
      "
    >
      <Navigation className="w-5 h-5 text-matcha-dark" />
    </button>
  )
}
