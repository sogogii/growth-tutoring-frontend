import { useState, useEffect } from 'react'
import './styles/SessionRequestForm.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Get user's timezone
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function SessionRequestForm({ tutorUserId, tutorName, studentUserId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    subject: '',
    message: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const userTimezone = getUserTimezone()

  // Get min and max dates
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 90) // 3 months
    return maxDate.toISOString().split('T')[0]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields')
      return
    }

    // Create datetime strings in user's timezone
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`)

    // Check if end is after start
    if (endDateTime <= startDateTime) {
      setError('End time must be after start time')
      return
    }

    // Check minimum 1 hour duration
    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60)
    if (durationHours < 1) {
      setError('Session must be at least 1 hour long')
      return
    }

    // Check if in the past
    const now = new Date()
    if (startDateTime < now) {
      setError('Cannot request sessions in the past')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_BASE}/api/session-requests?studentUserId=${studentUserId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tutorUserId: tutorUserId,
            requestedStart: startDateTime.toISOString(),
            requestedEnd: endDateTime.toISOString(),
            studentTimezone: userTimezone,
            subject: formData.subject || null,
            message: formData.message || null
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create session request')
      }

      if (onSuccess) {
        onSuccess()
      }
      
      if (onClose) {
        onClose()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="session-request-modal-overlay" onClick={onClose}>
      <div className="session-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="session-request-header">
          <h2>Request Session with {tutorName}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="session-request-form">
          {error && (
            <div className="session-request-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={getMinDate()}
              max={getMaxDate()}
              required
            />
            <small className="form-hint">
              You can request sessions up to 3 months in advance
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <small className="form-hint timezone-hint">
            🕐 Your timezone: {userTimezone} (Times will be converted automatically)
          </small>

          <div className="form-group">
            <label htmlFor="subject">Subject (Optional)</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Algebra 2, Essay Review"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any additional details or topics you'd like to cover..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Sending Request...' : 'Request Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SessionRequestForm