import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/StudentSessionsPage.css' // Reuse same styles
import CancellationModal from '../components/CancellationModal'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function TutorSessionsPage({ currentUser }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [sessionToCancel, setSessionToCancel] = useState(null)

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

  const handleOpenCancelModal = (session) => {
    setSessionToCancel(session)
    setShowCancelModal(true)
  }

  const handleCancellationSuccess = async () => {
    await loadSessions()
    setShowCancelModal(false)
    setSessionToCancel(null)
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

  const handleShowMore = (category) => {
    navigate(`/schedule/sessions/${category}`)
  }

  // Get current time for comparison
  const now = new Date()

  // Separate sessions by status and time
  const pendingSessions = sessions.filter(s => s.status === 'PENDING')

  const upcomingSessions = sessions.filter(s =>
    s.status === 'ACCEPTED' && new Date(s.requestedStart) > now
  )

  const pastSessions = sessions.filter(s =>
    s.status === 'ACCEPTED' && new Date(s.requestedStart) <= now
  )

  const declinedCancelledSessions = sessions.filter(s =>
    s.status === 'DECLINED' || s.status === 'CANCELLED'
  )

  // Limit to 3 sessions per section
  const MAX_DISPLAY = 3

  const renderSessionCard = (session, showActions = false, isPast = false) => (
    <div key={session.id} className={`session-card ${
      session.status === 'ACCEPTED' && !isPast ? 'confirmed' :
      isPast ? 'past' :
      (session.status === 'DECLINED' || session.status === 'CANCELLED') ? 'cancelled' : ''
    }`}>
      <div className="session-header">
        <h3>{session.studentFirstName} {session.studentLastName}</h3>
        {isPast ? (
          <span className="status-badge badge-success">Completed</span>
        ) : (
          getStatusBadge(session.status)
        )}
      </div>
      
      <div className="session-details">
        <p>Date & Time: {formatDateTime(session.requestedStart)}</p>
        <p>Duration: {Math.round((new Date(session.requestedEnd) - new Date(session.requestedStart)) / 60000)} minutes</p>
        {session.subject && <p>Subject: {session.subject}</p>}
        {session.message && (
          <p className="student-message">
            Student Message: {session.message}
          </p>
        )}
      </div>

      {/* UPDATED: Show accept/decline for PENDING, or cancel button for ACCEPTED */}
      {!isPast && (
        <div className="session-actions">
          {session.status === 'PENDING' && showActions ? (
            <>
              <button
                className="btn btn-success"
                onClick={() => handleDecision(session.id, 'ACCEPT')}
                disabled={processing === session.id}
              >
                {processing === session.id ? 'Processing...' : 'Accept'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleRespond(session.id, 'DECLINE')}
                disabled={processing === session.id}
              >
                Decline
              </button>
            </>
          ) : session.status === 'ACCEPTED' ? (
            <button
              className="btn btn-danger"
              onClick={() => handleOpenCancelModal(session)}
            >
              Cancel Session
            </button>
          ) : null}
        </div>
      )}
    </div>
  )


  if (loading) return <div className="page-container"><h1>Loading...</h1></div>
  if (error) return <div className="page-container"><h1>Error: {error}</h1></div>

  return (
    <div className="tutor-sessions-embedded">
        <h2>Session Requests</h2>

        {/* Pending Requests */}
        <section className="sessions-section">
          <div className="section-header">
            <h2>Pending Requests ({pendingSessions.length})</h2>
            {pendingSessions.length > MAX_DISPLAY && (
              <button
                className="btn-show-more"
                onClick={() => handleShowMore('pending')}
              >
                Show All →
              </button>
            )}
          </div>

          {pendingSessions.length === 0 ? (
            <p className="empty-message">No pending requests</p>
          ) : (
            <div className="sessions-list">
              {pendingSessions.slice(0, MAX_DISPLAY).map(session =>
                renderSessionCard(session, true, false)
              )}
            </div>
          )}

          {pendingSessions.length > MAX_DISPLAY && (
            <div className="show-more-footer">
              <button
                className="btn-show-more-large"
                onClick={() => handleShowMore('pending')}
              >
                View All {pendingSessions.length} Pending Requests →
              </button>
            </div>
          )}
        </section>

        {/* Upcoming Confirmed Sessions */}
        <section className="sessions-section">
          <div className="section-header">
            <h2>Upcoming Confirmed Sessions ({upcomingSessions.length})</h2>
            {upcomingSessions.length > MAX_DISPLAY && (
              <button
                className="btn-show-more"
                onClick={() => handleShowMore('upcoming')}
              >
                Show All →
              </button>
            )}
          </div>

          {upcomingSessions.length === 0 ? (
            <p className="empty-message">No upcoming confirmed sessions</p>
          ) : (
            <div className="sessions-list">
              {upcomingSessions.slice(0, MAX_DISPLAY).map(session =>
                renderSessionCard(session, false, false)
              )}
            </div>
          )}

          {upcomingSessions.length > MAX_DISPLAY && (
            <div className="show-more-footer">
              <button
                className="btn-show-more-large"
                onClick={() => handleShowMore('upcoming')}
              >
                View All {upcomingSessions.length} Upcoming Sessions →
              </button>
            </div>
          )}
        </section>

        {/* Past Sessions */}
        <section className="sessions-section">
          <div className="section-header">
            <h2>Past Sessions ({pastSessions.length})</h2>
            {pastSessions.length > MAX_DISPLAY && (
              <button
                className="btn-show-more"
                onClick={() => handleShowMore('past')}
              >
                Show All →
              </button>
            )}
          </div>

          {pastSessions.length === 0 ? (
            <p className="empty-message">No past sessions</p>
          ) : (
            <div className="sessions-list">
              {pastSessions.slice(0, MAX_DISPLAY).map(session =>
                renderSessionCard(session, false, true)
              )}
            </div>
          )}

          {pastSessions.length > MAX_DISPLAY && (
            <div className="show-more-footer">
              <button
                className="btn-show-more-large"
                onClick={() => handleShowMore('past')}
              >
                View All {pastSessions.length} Past Sessions →
              </button>
            </div>
          )}
        </section>

        {/* Declined/Cancelled Sessions */}
        <section className="sessions-section">
          <div className="section-header">
            <h2>Declined/Cancelled Sessions ({declinedCancelledSessions.length})</h2>
            {declinedCancelledSessions.length > MAX_DISPLAY && (
              <button
                className="btn-show-more"
                onClick={() => handleShowMore('declined')}
              >
                Show All →
              </button>
            )}
          </div>

          {declinedCancelledSessions.length === 0 ? (
            <p className="empty-message">No declined or cancelled sessions</p>
          ) : (
            <div className="sessions-list">
              {declinedCancelledSessions.slice(0, MAX_DISPLAY).map(session =>
                renderSessionCard(session, false, false)
              )}
            </div>
          )}

          {declinedCancelledSessions.length > MAX_DISPLAY && (
            <div className="show-more-footer">
              <button
                className="btn-show-more-large"
                onClick={() => handleShowMore('declined')}
              >
                View All {declinedCancelledSessions.length} Declined/Cancelled Sessions →
              </button>
            </div>
          )}
        </section>
        {showCancelModal && sessionToCancel && (
          <CancellationModal
            session={sessionToCancel}
            userRole="tutor"
            onClose={() => {
              setShowCancelModal(false)
              setSessionToCancel(null)
            }}
            onSuccess={handleCancellationSuccess}
          />
        )}
      </div>
  )
}

export default TutorSessionsPage