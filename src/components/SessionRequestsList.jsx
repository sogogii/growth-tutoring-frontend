// src/components/SessionRequestsList.jsx - Original Style with Bug Fixes
import { useState, useEffect } from 'react'
import './styles/SessionRequestsList.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function SessionRequestsList({ tutorUserId, onRequestUpdate }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    if (tutorUserId) {
      loadRequests()
    }
  }, [tutorUserId])

  const loadRequests = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/session-requests/tutor/${tutorUserId}`)
      
      if (!res.ok) {
        throw new Error('Failed to load session requests')
      }

      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading requests:', err)
      setError(err.message)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleDecision = async (requestId, decision) => {
  setProcessing(requestId)

  try {
    const endpoint = decision === 'ACCEPT' ? 'accept' : 'decline'
    const res = await fetch(
      `${API_BASE}/api/session-requests/${requestId}/${endpoint}`,
      { method: 'POST' }
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Failed to ${endpoint} request`)
    }

    await loadRequests()
    
    if (onRequestUpdate) {
      onRequestUpdate()
    }

    // Show success message
    const message = decision === 'ACCEPT' 
      ? 'Session accepted! Payment will be processed.' 
      : 'Session declined. Payment authorization released.'
    alert(message)

  } catch (err) {
    console.error(`Error ${decision.toLowerCase()}ing request:`, err)
    alert(err.message)
  } finally {
    setProcessing(null)
  }
}

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (start, end) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const durationMs = endDate - startDate
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Safe filtering with array checks
  const pendingRequests = Array.isArray(requests) 
    ? requests.filter(r => r.status === 'PENDING')
    : []

  const acceptedRequests = Array.isArray(requests)
    ? requests.filter(r => r.status === 'ACCEPTED')
    : []

  const declinedRequests = Array.isArray(requests)
    ? requests.filter(r => r.status === 'DECLINED')
    : []

  if (loading) {
    return (
      <div className="session-requests-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading session requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="session-requests-list">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Requests</h3>
          <p>{error}</p>
          <button onClick={loadRequests} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="session-requests-list">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Session Requests Yet</h3>
          <p>When students request sessions, they'll appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="session-requests-list">
      {/* Pending Requests */}
      <div className="requests-section">
        <h2 className="section-title">Pending Requests ({pendingRequests.length})</h2>

        {pendingRequests.length === 0 ? (
          <div className="section-empty">
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="requests-grid">
            {pendingRequests.map(request => (
              <div key={request.id} className="request-card pending">
                <div className="card-header">
                  <div className="student-info">
                    <div className="student-avatar">
                      {request.studentFirstName?.charAt(0) || 'S'}
                    </div>
                    <div className="student-details">
                      <h3 className="student-name">
                        {request.studentFirstName} {request.studentLastName}
                      </h3>
                      <p className="student-email">{request.studentEmail}</p>
                    </div>
                  </div>
                  <span className="status-badge status-pending">PENDING</span>
                </div>

                <div className="card-body">
                  <div className="request-info">
                    <div className="info-row">
                      <span className="info-label">📅 Date & Time:</span>
                      <span className="info-value">
                        {formatDateTime(request.requestedStart)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⏱️ Duration:</span>
                      <span className="info-value">
                        {formatDuration(request.requestedStart, request.requestedEnd)}
                      </span>
                    </div>
                    {request.subject && (
                      <div className="info-row">
                        <span className="info-label">📚 Subject:</span>
                        <span className="info-value">{request.subject}</span>
                      </div>
                    )}
                    {request.message && (
                      <div className="info-row message-row">
                        <span className="info-label">💬 Message:</span>
                        <p className="message-text">{request.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="request-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={processing === req.id}
                    onClick={() => handleDecision(req.id, 'ACCEPT')}
                  >
                    {processing === req.id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={processing === req.id}
                    onClick={() => handleDecision(req.id, 'DECLINE')}
                  >
                    {processing === req.id ? 'Processing...' : 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accepted Sessions */}
      {acceptedRequests.length > 0 && (
        <div className="requests-section">
          <h2 className="section-title">Accepted Sessions ({acceptedRequests.length})</h2>
          
          <div className="requests-grid">
            {acceptedRequests.map(request => (
              <div key={request.id} className="request-card accepted">
                <div className="card-header">
                  <div className="student-info">
                    <div className="student-avatar">
                      {request.studentFirstName?.charAt(0) || 'S'}
                    </div>
                    <div className="student-details">
                      <h3 className="student-name">
                        {request.studentFirstName} {request.studentLastName}
                      </h3>
                      <p className="student-email">{request.studentEmail}</p>
                    </div>
                  </div>
                  <span className="status-badge status-accepted">ACCEPTED</span>
                </div>

                <div className="card-body">
                  <div className="request-info">
                    <div className="info-row">
                      <span className="info-label">📅 Date & Time:</span>
                      <span className="info-value">
                        {formatDateTime(request.requestedStart)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⏱️ Duration:</span>
                      <span className="info-value">
                        {formatDuration(request.requestedStart, request.requestedEnd)}
                      </span>
                    </div>
                    {request.subject && (
                      <div className="info-row">
                        <span className="info-label">📚 Subject:</span>
                        <span className="info-value">{request.subject}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Declined Requests */}
      {declinedRequests.length > 0 && (
        <div className="requests-section">
          <h2 className="section-title">Declined Requests ({declinedRequests.length})</h2>
          
          <div className="requests-grid">
            {declinedRequests.map(request => (
              <div key={request.id} className="request-card declined">
                <div className="card-header">
                  <div className="student-info">
                    <div className="student-avatar">
                      {request.studentFirstName?.charAt(0) || 'S'}
                    </div>
                    <div className="student-details">
                      <h3 className="student-name">
                        {request.studentFirstName} {request.studentLastName}
                      </h3>
                      <p className="student-email">{request.studentEmail}</p>
                    </div>
                  </div>
                  <span className="status-badge status-declined">DECLINED</span>
                </div>

                <div className="card-body">
                  <div className="request-info">
                    <div className="info-row">
                      <span className="info-label">📅 Date & Time:</span>
                      <span className="info-value">
                        {formatDateTime(request.requestedStart)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionRequestsList