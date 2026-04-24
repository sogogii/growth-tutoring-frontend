import { useState } from 'react'
import './styles/CancellationModal.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function DeclineModal({ session, onClose, onSuccess }) {
  const [reason, setReason] = useState('')
  const [declining, setDeclining] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for declining.')
      return
    }

    if (!window.confirm('Are you sure you want to decline this session request?')) {
      return
    }

    setDeclining(true)
    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/${session.id}/decline`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ responseMessage: reason.trim() }),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to decline session')
      }

      onSuccess()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeclining(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cancellation-modal" onClick={e => e.stopPropagation()}>
        <h2>Decline Session Request</h2>

        {/* Session summary */}
        <div className="session-summary">
          <p><strong>Student:</strong> {session.studentFirstName} {session.studentLastName}</p>
          <p><strong>Subject:</strong> {session.subject}</p>
          <p><strong>Date & Time:</strong> {new Date(session.requestedStart).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
          })}</p>
        </div>

        {/* Info box */}
        <div className="info-box">
          <p>ℹ️ The student's payment authorization will be released when you decline.</p>
        </div>

        {/* Reason input */}
        <div className="cancellation-reason">
          <label htmlFor="decline-reason">
            Reason for declining <span className="required">*</span>
          </label>
          <textarea
            id="decline-reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. I'm unavailable at this time, please try booking a different slot."
            rows="3"
            required
          />
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={declining}>
            Go Back
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={declining}>
            {declining ? 'Declining...' : 'Decline Session'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeclineModal