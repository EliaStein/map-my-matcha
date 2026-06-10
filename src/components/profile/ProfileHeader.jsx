import { useRef } from 'react'
import { Camera, User } from 'lucide-react'
import { Loader } from '../common'

export default function ProfileHeader({
  user,
  onPhotoChange,
  loading = false
}) {
  const fileInputRef = useRef(null)

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onPhotoChange?.(file)
    }
  }

  return (
    <div className="flex flex-col items-center py-6">
      {/* Profile Photo */}
      <div className="relative mb-4">
        <button
          onClick={handlePhotoClick}
          disabled={loading}
          className="w-24 h-24 rounded-full bg-matcha-light flex items-center justify-center overflow-hidden border-4 border-white shadow-lg"
        >
          {loading ? (
            <Loader size="sm" />
          ) : user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-matcha-dark" />
          )}
        </button>

        <div className="absolute bottom-0 right-0 w-8 h-8 bg-matcha-dark rounded-full flex items-center justify-center border-2 border-white">
          <Camera className="w-4 h-4 text-white" />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Name */}
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        {user?.displayName || 'Matcha Lover'}
      </h2>

      {/* Email */}
      <p className="text-gray-500 text-sm">
        {user?.email}
      </p>
    </div>
  )
}
