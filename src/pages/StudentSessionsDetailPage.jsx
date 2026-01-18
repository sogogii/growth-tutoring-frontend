import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './styles/StudentSessionsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function StudentSessionsDetailPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const navigate = useNavigate()
  const { category } = useParams() // pending, confirmed, past, cancelled

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

  // Get current time for comparison
  const now = new Date()

  // Filter sessions based on category
  const getFilteredSessions = () => {
    switch(category) {
      case 'pending':
        return sessions.filter(s => s.status === 'PENDING')
      case 'confirmed':
        return sessions.filter(s => 
          s.status === 'ACCEPTED' && new Date(s.requestedStart) > now
        )
      case 'past':
        return sessions.filter(s => 
          s.status === 'ACCEPTED' && new Date(s.requestedStart) <= now
        )
      case 'cancelled':
        return sessions.filter(s => 
          s.status === 'DECLINED' || s.status === 'CANCELLED'
        )
      default:
        return []
    }
  }

  const getCategoryTitle = () => {
    switch(category) {
      case 'pending':
        return 'All Pending Requests'
      case 'confirmed':
        return 'All Upcoming Confirmed Sessions'
      case 'past':
        return 'All Past Sessions'
      case 'cancelled':
        return 'All Cancelled/Declined Sessions'
      default:
        return 'Sessions'
    }
  }

  const filteredSessions = getFilteredSessions()
  const isPastCategory = category === 'past'
  const isCancelledCategory = category === 'cancelled'

  const renderSessionCard = (session) => (
    <div key={session.id} className={`session-card ${
      session.status === 'ACCEPTED' && !isPastCategory ? 'confirmed' : 
      isPastCategory ? 'past' : 
      (session.status === 'DECLINED' || session.status === 'CANCELLED') ? 'cancelled' : ''
    }`}>
      <div className="session-header">
        <h3>{session.tutorFirstName} {session.tutorLastName}</h3>
        {isPastCategory ? (
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

      {!isPastCategory && !isCancelledCategory && (session.status === 'PENDING' || session.status === 'ACCEPTED') && (
        <button
          className="btn btn-danger"
          onClick={() => handleCancel(session.id)}
          disabled={cancellingId === session.id}
        >
          {cancellingId === session.id ? 'Cancelling...' : 
           session.status === 'PENDING' ? 'Cancel Request' : 'Cancel Session'}
        </button>
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
          onClick={() => navigate('/my-sessions')}
        >
          ← Back to All Sessions
        </button>

        <h1>{getCategoryTitle()}</h1>
        <p className="session-count">Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</p>

        {filteredSessions.length === 0 ? (
          <div className="empty-state-large">
            <h3>No Sessions Found</h3>
            <p>You don't have any sessions in this category.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/my-sessions')}
            >
              View All Sessions
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

export default StudentSessionsDetailPage