import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/StudentSessionsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function StudentSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
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

  // Separate sessions by status
  const pendingSessions = sessions.filter(s => s.status === 'PENDING')
  const confirmedSessions = sessions.filter(s => s.status === 'ACCEPTED')
  const pastSessions = sessions.filter(s => 
    s.status === 'DECLINED' || s.status === 'CANCELLED'
  )

  if (loading) return <div className="page-container"><h1>Loading...</h1></div>
  if (error) return <div className="page-container"><h1>Error: {error}</h1></div>

  return (
    <div className="sessions-page">
      <div className="sessions-container">
        <h1>My Sessions</h1>

        {/* Pending Requests */}
        <section className="sessions-section">
          <h2>Pending Requests ({pendingSessions.length})</h2>
          {pendingSessions.length === 0 ? (
            <p className="empty-message">No pending requests</p>
          ) : (
            <div className="sessions-list">
              {pendingSessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <h3>{session.tutorFirstName} {session.tutorLastName}</h3>
                    {getStatusBadge(session.status)}
                  </div>
                  
                  <div className="session-details">
                    <p>📅 {formatDateTime(session.requestedStart)}</p>
                    <p>⏱️ Duration: {Math.round((new Date(session.requestedEnd) - new Date(session.requestedStart)) / 60000)} minutes</p>
                    {session.subject && <p>📚 Subject: {session.subject}</p>}
                  </div>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(session.id)}
                    disabled={cancellingId === session.id}
                  >
                    {cancellingId === session.id ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Confirmed Sessions */}
        <section className="sessions-section">
          <h2>Confirmed Sessions ({confirmedSessions.length})</h2>
          {confirmedSessions.length === 0 ? (
            <p className="empty-message">No confirmed sessions</p>
          ) : (
            <div className="sessions-list">
              {confirmedSessions.map(session => (
                <div key={session.id} className="session-card confirmed">
                  <div className="session-header">
                    <h3>{session.tutorFirstName} {session.tutorLastName}</h3>
                    {getStatusBadge(session.status)}
                  </div>
                  
                  <div className="session-details">
                    <p>📅 {formatDateTime(session.requestedStart)}</p>
                    <p>⏱️ Duration: {Math.round((new Date(session.requestedEnd) - new Date(session.requestedStart)) / 60000)} minutes</p>
                    {session.subject && <p>📚 Subject: {session.subject}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Sessions */}
        <section className="sessions-section">
          <h2>Past Sessions ({pastSessions.length})</h2>
          {pastSessions.length === 0 ? (
            <p className="empty-message">No past sessions</p>
          ) : (
            <div className="sessions-list">
              {pastSessions.map(session => (
                <div key={session.id} className="session-card past">
                  <div className="session-header">
                    <h3>{session.tutorFirstName} {session.tutorLastName}</h3>
                    {getStatusBadge(session.status)}
                  </div>
                  
                  <div className="session-details">
                    <p>📅 {formatDateTime(session.requestedStart)}</p>
                    {session.tutorResponseMessage && (
                      <p className="response-message">
                        💬 {session.tutorResponseMessage}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default StudentSessionsPage