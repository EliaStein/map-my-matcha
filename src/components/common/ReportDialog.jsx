import { useState } from 'react'
import { Flag, UserX } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

const REASONS = [
  'Spam or advertising',
  'Inappropriate or offensive content',
  'Harassment or hate speech',
  'False or misleading information',
  'Other'
]

// Apple UGC requirements (guideline 1.2): users must be able to report
// objectionable content and block its author. onBlock is optional -
// omit it when the target isn't tied to a user (e.g. a cafe listing).
export default function ReportDialog({ open, onClose, targetLabel, onSubmit, onBlock }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')

  const handleClose = () => {
    setReason('')
    setDone(null)
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!reason) return
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(reason)
      setDone('reported')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBlock = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onBlock()
      setDone('blocked')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Report ${targetLabel}`}>
      {done ? (
        <div className="text-center py-4">
          <p className="text-gray-900 font-medium mb-2">
            {done === 'reported' ? 'Thanks for the report' : 'User blocked'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {done === 'reported'
              ? 'We review reports within 24 hours and remove content that violates our guidelines.'
              : "You won't see content from this user anymore."}
          </p>
          <Button onClick={handleClose} fullWidth>Done</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  reason === r ? 'border-matcha-dark bg-matcha-light/30' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-matcha-dark"
                />
                <span className="text-sm text-gray-700">{r}</span>
              </label>
            ))}
          </div>

          <Button onClick={handleSubmit} fullWidth disabled={!reason} loading={submitting}>
            <Flag className="w-4 h-4" />
            Submit Report
          </Button>

          {onBlock && (
            <button
              onClick={handleBlock}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <UserX className="w-4 h-4" />
              Block this user
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}
