import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './styles/StudentSessionsPage.css' // Reuse same styles

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function TutorSessionsDetailPage({ currentUser }) {
  const navigate = useNavigate()
  const { category } = useParams()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    if (currentUser?.userId) {
      loadSessions()
    }
  }, [currentUser])

  const loadSessions = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/tutor/${currentUser.userId}`
      )

      if (!res.ok) {
        throw new Error('Failed to load sessions')
      }

      const data = await res.json()
      setSessions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError(err.message)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const handleDecision = async (requestId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision.toLowerCase()} this session request?`)) {
      return
    }

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

      const message = decision === 'ACCEPT'
        ? 'Session accepted! Payment will be processed.'
        : 'Session declined. Payment authorization released.'
      alert(message)

      await loadSessions()
    } catch (err) {
      alert(err.message)
    } finally {
      setProcessing(null)
    }
  }

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: 'badge-warning', text: 'Pending' },
      ACCEPTED: { class: 'badge-success', text: 'Confirmed' },
      DECLINED: { class: 'badge-danger', text: 'Declined' },
      CANCELLED: { class: 'badge-secondary', text: 'Cancelled' }
    }
    const badge = badges[status] || { class: '', text: status }
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>
  }

  // Get current time for comparison
  const now = new Date()

  // Filter sessions based on category
  const getFilteredSessions = () => {
    switch (category) {
      case 'pending':
        return sessions.filter(s => s.status === 'PENDING')
      case 'upcoming':
        return sessions.filter(s =>
          s.status === 'ACCEPTED' && new Date(s.requestedStart) > now
        )
      case 'past':
        return sessions.filter(s =>
          s.status === 'ACCEPTED' && new Date(s.requestedStart) <= now
        )
      case 'declined':
        return sessions.filter(s =>
          s.status === 'DECLINED' || s.status === 'CANCELLED'
        )
      default:
        return []
    }
  }

  const getCategoryTitle = () => {
    switch (category) {
      case 'pending':
        return 'All Pending Requests'
      case 'upcoming':
        return 'All Upcoming Confirmed Sessions'
      case 'past':
        return 'All Past Sessions'
      case 'declined':
        return 'All Declined/Cancelled Sessions'
      default:
        return 'Sessions'
    }
  }

  const filteredSessions = getFilteredSessions()
  const isPastCategory = category === 'past'
  const isDeclinedCategory = category === 'declined'
  const isPendingCategory = category === 'pending'

  const renderSessionCard = (session) => (
    <div key={session.id} className={`session-card ${
      session.status === 'ACCEPTED' && !isPastCategory ? 'confirmed' :
      isPastCategory ? 'past' :
      (session.status === 'DECLINED' || session.status === 'CANCELLED') ? 'cancelled' : ''
    }`}>
      <div className="session-header">
        <h3>{session.studentFirstName} {session.studentLastName}</h3>
        {isPastCategory ? (
          <span className="status-badge badge-success">Completed</span>
        ) : (
          getStatusBadge(session.status)
        )}
      </div>

      <div className="session-details">
        <p><strong>Student Email:</strong> {session.studentEmail}</p>
        <p><strong>Date & Time:</strong> {formatDateTime(session.requestedStart)}</p>
        <p><strong>Duration:</strong> {Math.round((new Date(session.requestedEnd) - new Date(session.requestedStart)) / 60000)} minutes</p>
        {session.subject && <p><strong>Subject:</strong> {session.subject}</p>}
        {session.message && (
          <p className="student-message">
            <strong>Student Message:</strong> {session.message}
          </p>
        )}
        {session.tutorResponseMessage && (
          <p className="response-message">
            <strong>Your Response:</strong> {session.tutorResponseMessage}
          </p>
        )}
      </div>

      {isPendingCategory && session.status === 'PENDING' && (
        <div className="session-actions">
          <button
            className="btn btn-primary"
            onClick={() => handleDecision(session.id, 'ACCEPT')}
            disabled={processing === session.id}
          >
            {processing === session.id ? 'Processing...' : 'Accept'}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDecision(session.id, 'DECLINE')}
            disabled={processing === session.id}
          >
            {processing === session.id ? 'Processing...' : 'Decline'}
          </button>
        </div>
      )}
    </div>
  )

  if (loading) return <div className="page-container"><h1>Loading...</h1></div>
  if (error) return <div className="page-container"><h1>Error: {error}</h1></div>

  return (
    <div className="sessions-page">
      <div className="sessions-container">
        {/* Back Button */}
        <button
          className="btn-back"
          onClick={() => navigate('/my-schedule')}
        >
          ← Back to Schedule
        </button>

        <h1>{getCategoryTitle()}</h1>
        <p className="session-count">Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</p>

        {filteredSessions.length === 0 ? (
          <div className="empty-state-large">
            <h3>No Sessions Found</h3>
            <p>You don't have any sessions in this category.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/my-schedule')}
            >
              Back to Schedule
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {filteredSessions.map(session => renderSessionCard(session))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TutorSessionsDetailPage