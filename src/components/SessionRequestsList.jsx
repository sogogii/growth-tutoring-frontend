import { useState } from 'react'
import './styles/SessionRequestsList.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Format datetime to local time
const formatDateTime = (isoString, timezone) => {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || undefined
  }).format(date)
}

// Calculate duration
const formatDuration = (start, end) => {
  const durationMs = new Date(end) - new Date(start)
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  return `${hours}h ${minutes}m`
}

function SessionRequestsList({ requests, tutorUserId, onUpdate }) {
  const [responding, setResponding] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [error, setError] = useState(null)

  const handleRespond = async (requestId, status) => {
    setError(null)
    setResponding(requestId)

    try {
      const response = await fetch(
        `${API_BASE}/api/session-requests/${requestId}/respond?tutorUserId=${tutorUserId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: status,
            responseMessage: responseMessage || null
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to respond to request')
      }

      setResponseMessage('')
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setResponding(null)
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING')
  const respondedRequests = requests.filter(r => r.status !== 'PENDING')

  if (requests.length === 0) {
    return (
      <div className="session-requests-empty">
        <p>No session requests yet</p>
      </div>
    )
  }

  return (
    <div className="session-requests-list">
      {error && (
        <div className="session-requests-error">
          {error}
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="requests-section">
          <h3 className="requests-section-title">
            Pending Requests ({pendingRequests.length})
          </h3>
          
          {pendingRequests.map((request) => (
            <div key={request.id} className="session-request-card pending">
              <div className="request-header">
                <div className="request-student">
                  <div className="student-avatar">
                    {request.studentFirstName?.[0] || 'S'}
                  </div>
                  <div>
                    <div className="student-name">
                      {request.studentFirstName} {request.studentLastName}
                    </div>
                    <div className="student-email">{request.studentEmail}</div>
                  </div>
                </div>
                <span className="status-badge status-pending">Pending</span>
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Date & Time:</span>
                  <span className="detail-value">
                    {formatDateTime(request.requestedStart, request.tutorTimezone)}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">⏱️ Duration:</span>
                  <span className="detail-value">
                    {formatDuration(request.requestedStart, request.requestedEnd)}
                  </span>
                </div>

                {request.subject && (
                  <div className="detail-row">
                    <span className="detail-label">📚 Subject:</span>
                    <span className="detail-value">{request.subject}</span>
                  </div>
                )}

                {request.message && (
                  <div className="request-message">
                    <strong>Message from student:</strong>
                    <p>{request.message}</p>
                  </div>
                )}
              </div>

              <div className="request-actions">
                {/*
                <textarea
                  className="response-textarea"
                  placeholder="Optional message to student..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={2}
                />
                */}
                
                <div className="action-buttons">
                  <button
                    className="btn-decline"
                    onClick={() => handleRespond(request.id, 'DECLINED')}
                    disabled={responding === request.id}
                  >
                    {responding === request.id ? 'Processing...' : 'Decline'}
                  </button>
                  <button
                    className="btn-accept"
                    onClick={() => handleRespond(request.id, 'ACCEPTED')}
                    disabled={responding === request.id}
                  >
                    {responding === request.id ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responded Requests */}
      {respondedRequests.length > 0 && (
        <div className="requests-section">
          <h3 className="requests-section-title">
            Past Responses ({respondedRequests.length})
          </h3>
          
          {respondedRequests.map((request) => (
            <div key={request.id} className={`session-request-card ${request.status.toLowerCase()}`}>
              <div className="request-header">
                <div className="request-student">
                  <div className="student-avatar">
                    {request.studentFirstName?.[0] || 'S'}
                  </div>
                  <div>
                    <div className="student-name">
                      {request.studentFirstName} {request.studentLastName}
                    </div>
                  </div>
                </div>
                <span className={`status-badge status-${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Date & Time:</span>
                  <span className="detail-value">
                    {formatDateTime(request.requestedStart, request.tutorTimezone)}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">⏱️ Duration:</span>
                  <span className="detail-value">
                    {formatDuration(request.requestedStart, request.requestedEnd)}
                  </span>
                </div>

                {request.tutorResponseMessage && (
                  <div className="request-message">
                    <strong>Your response:</strong>
                    <p>{request.tutorResponseMessage}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SessionRequestsList