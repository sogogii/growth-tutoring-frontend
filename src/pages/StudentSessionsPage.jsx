import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/StudentSessionsPage.css'
import CancellationModal from '../components/CancellationModal'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function StudentSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [sessionToCancel, setSessionToCancel] = useState(null)
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (currentUser.role !== 'STUDENT') {
      navigate('/')
      return
    }
    loadSessions()
  }, [])

  const handleOpenCancelModal = (session) => {
    setSessionToCancel(session)
    setShowCancelModal(true)
  }

  const handleCancellationSuccess = async () => {
    await loadSessions()
    setShowCancelModal(false)
    setSessionToCancel(null)
  }

  const loadSessions = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/student/${currentUser.userId}`
      )
      
      if (!res.ok) throw new Error('Failed to load sessions')
      
      const data = await res.json()
      setSessions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session request? Your payment authorization will be released.')) {
      return
    }

    setCancellingId(sessionId)

    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/${sessionId}/cancel`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to cancel session')
      }

      alert('Session cancelled successfully! Payment authorization released.')
      await loadSessions()
    } catch (err) {
      alert(err.message)
    } finally {
      setCancellingId(null)
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
    navigate(`/my-sessions/${category}`)
  }

  // Get current time for comparison
  const now = new Date()

  // Separate sessions by status and time
  const pendingSessions = sessions.filter(s => s.status === 'PENDING')
  
  const confirmedSessions = sessions.filter(s => 
    s.status === 'ACCEPTED' && new Date(s.requestedStart) > now
  )
  
  const pastSessions = sessions.filter(s => 
    s.status === 'ACCEPTED' && new Date(s.requestedStart) <= now
  )
  
  const cancelledDeclinedSessions = sessions.filter(s => 
    s.status === 'DECLINED' || s.status === 'CANCELLED'
  )

  // Limit to 3 sessions per section
  const MAX_DISPLAY = 3

  const renderSessionCard = (session, showCancelButton = true, isPast = false) => (
    <div key={session.id} className={`session-card ${
      session.status === 'ACCEPTED' && !isPast ? 'confirmed' : 
      isPast ? 'past' : 
      (session.status === 'DECLINED' || session.status === 'CANCELLED') ? 'cancelled' : ''
    }`}>
      <div className="session-header">
        <h3>{session.tutorFirstName} {session.tutorLastName}</h3>
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
        {session.tutorResponseMessage && (
          <p className="response-message">
            Tutor Response: {session.tutorResponseMessage}
          </p>
        )}
      </div>

      {/* UPDATED: Show cancel button for both PENDING and ACCEPTED sessions */}
      {showCancelButton && !isPast && (session.status === 'PENDING' || session.status === 'ACCEPTED') && (
        <div className="session-actions">
          {session.status === 'PENDING' ? (
            <button
              className="btn btn-danger"
              onClick={() => handleCancel(session.id)}
              disabled={cancellingId === session.id}
            >
              {cancellingId === session.id ? 'Cancelling...' : 'Cancel Request'}
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() => handleOpenCancelModal(session)}
            >
              Cancel Session
            </button>
          )}
        </div>
      )}
    </div>
  )

  if (loading) return <div className="page-container"><h1>Loading...</h1></div>
  if (error) return <div className="page-container"><h1>Error: {error}</h1></div>

  return (
    <div className="sessions-page">
      <div className="sessions-container">
        <h1>My Sessions</h1>

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
            <h2>Upcoming Confirmed Sessions ({confirmedSessions.length})</h2>
            {confirmedSessions.length > MAX_DISPLAY && (
              <button 
                className="btn-show-more"
                onClick={() => handleShowMore('confirmed')}
              >
                Show All →
              </button>
            )}
          </div>
          
          {confirmedSessions.length === 0 ? (
            <p className="empty-message">No upcoming confirmed sessions</p>
          ) : (
            <div className="sessions-list">
              {confirmedSessions.slice(0, MAX_DISPLAY).map(session => 
                renderSessionCard(session, true, false)
              )}
            </div>
          )}
          
          {confirmedSessions.length > MAX_DISPLAY && (
            <div className="show-more-footer">
              <button 
                className="btn-show-more-large"
                onClick={() => handleShowMore('confirmed')}
              >
                View All {confirmedSessions.length} Confirmed Sessions →
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

        {/* Cancelled/Declined Sessions */}
        <section className="sessions-section">
          <div className="section-header">
            <h2>Cancelled/Declined Sessions ({cancelledDeclinedSessions.length})</h2>
            {cancelledDeclinedSessions.length > MAX_DISPLAY && (
              <button 
                className="btn-show-more"
                onClick={() => handleShowMore('cancelled')}
              >
                Show All →
              </button>
            )}
          </div>
          
          {cancelledDeclinedSessions.length === 0 ? (
            <p className="empty-message">No cancelled or declined sessions</p>
          ) : (
            <div className="sessions-list">
              {cancelledDeclinedSessions.slice(0, MAX_DISPLAY).map(session => 
                renderSessionCard(session, false, false)
              )}
            </div>
          )}
          
          {cancelledDeclinedSessions.length > MAX_DISPLAY && (
            <div className="show-more-footer">
              <button 
                className="btn-show-more-large"
                onClick={() => handleShowMore('cancelled')}
              >
                View All {cancelledDeclinedSessions.length} Cancelled/Declined Sessions →
              </button>
            </div>
          )}
        </section>
      </div>
      {showCancelModal && sessionToCancel && (
        <CancellationModal
          session={sessionToCancel}
          userRole="student"
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

export default StudentSessionsPage