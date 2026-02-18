import { useState, useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from '../common'
import { compressImage } from '../../services/storage'

export default function PhotoUpload({
  onUpload,
  maxFiles = 1,
  label = 'Upload Photo',
  className = ''
}) {
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const handleSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (previews.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} file(s) allowed`)
      return
    }

    setLoading(true)
    const newPreviews = []

    for (const file of files) {
      try {
        const compressed = await compressImage(file)
        const preview = URL.createObjectURL(compressed)
        newPreviews.push({ file: compressed, preview })
      } catch (error) {
        console.error('Error processing image:', error)
      }
    }

    setPreviews(prev => [...prev, ...newPreviews])
    setLoading(false)

    if (onUpload) {
      onUpload(newPreviews.map(p => p.file))
    }
  }

  const handleRemove = (index) => {
    URL.revokeObjectURL(previews[index].preview)
    setPreviews(prev => prev.filter((_, i) => i !== index))

    if (onUpload) {
      const remaining = previews.filter((_, i) => i !== index).map(p => p.file)
      onUpload(remaining)
    }
  }

  return (
    <div className={className}>
      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {previews.map((item, index) => (
            <div key={index} className="relative">
              <img
                src={item.preview}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {previews.length < maxFiles && (
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-matcha-light text-matcha-dark rounded-xl cursor-pointer hover:bg-matcha-medium/30 transition-colors">
          <Camera className="w-5 h-5" />
          <span className="font-medium">{label}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            onChange={handleSelect}
            className="hidden"
            disabled={loading}
          />
        </label>
      )}
    </div>
  )
}
