import { useState } from 'react'
import { Button, Input } from '../common'

export default function EditProfileForm({
  initialName = '',
  onSave,
  onCancel,
  loading = false
}) {
  const [displayName, setDisplayName] = useState(initialName)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    try {
      await onSave(displayName.trim())
    } catch (err) {
      setError('Failed to update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        required
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={!displayName.trim()}
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
