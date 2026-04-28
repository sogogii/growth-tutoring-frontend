import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/MyClassroomPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getTimeUntil(isoString) {
  const diff = new Date(isoString) - new Date()
  if (diff <= 0) return 'Starting now'
  const totalMin = Math.floor(diff / 60000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  if (days > 0) return `in ${days}d ${hours}h`
  if (hours > 0) return `in ${hours}h ${mins}m`
  return `in ${mins}m`
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDuration(start, end) {
  const mins = Math.round((new Date(end) - new Date(start)) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function isWithin30Min(isoString) {
  const diff = new Date(isoString) - new Date()
  return diff <= 30 * 60 * 1000
}

export default function MyClassroomPage({ currentUser, classroomSessionId }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const isTutor = currentUser?.role === 'TUTOR'

  useEffect(() => {
    if (!currentUser) return
    fetchSessions()
  }, [currentUser])

  const fetchSessions = async () => {
    try {
      setLoading(true)

      // BOTH tutor and student now use the full session list
      // so the frontend filter (requestedEnd) controls what shows
      const url = isTutor
        ? `${API_BASE}/api/session-requests/tutor/${currentUser.userId}`
        : `${API_BASE}/api/session-requests/student/${currentUser.userId}`

      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load sessions')
      const data = await res.json()

      const now = new Date()
      const upcoming = (Array.isArray(data) ? data : [])
        .filter(s =>
          s.status === 'ACCEPTED' &&
          new Date(s.requestedEnd) > now &&       // ← was requestedStart
          s.sessionFormat !== 'IN_PERSON'
        )
        .sort((a, b) => new Date(a.requestedStart) - new Date(b.requestedStart))

      setSessions(upcoming)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEnter = (session) => {
    navigate(`/classroom/${session.id}`)
  }

  if (!currentUser) return null

  return (
    <div className="myclassroom-page">
      <div className="myclassroom-container">
        <div className="myclassroom-header">
          <div className="myclassroom-header-left">
            <h1 className="myclassroom-title">My Classroom</h1>
            <p className="myclassroom-subtitle">
              {isTutor
                ? 'Your upcoming confirmed sessions. Open the classroom when you\'re ready to start.'
                : 'Your upcoming confirmed sessions. Join when your tutor opens the classroom.'}
              <span className="myclassroom-online-note"> Only online sessions are accessible here.</span>
            </p>
          </div>
          <button className="myclassroom-refresh" onClick={fetchSessions} title="Refresh">
            ↻
          </button>
        </div>

        {loading && (
          <div className="myclassroom-state">
            <div className="myclassroom-spinner" />
            <p>Loading sessions…</p>
          </div>
        )}

        {error && !loading && (
          <div className="myclassroom-state myclassroom-error">
            <p>Failed to load sessions: {error}</p>
            <button onClick={fetchSessions}>Try again</button>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="myclassroom-state myclassroom-empty">
            <div className="myclassroom-empty-icon">📅</div>
            <h3>No upcoming sessions</h3>
            <p>
              {isTutor
                ? 'Confirmed sessions will appear here.'
                : 'Once a tutor accepts your booking, your session will appear here.'}
            </p>
          </div>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="myclassroom-list">
            {sessions.map((session) => {
              const soon = isWithin30Min(session.requestedStart)
              const otherName = isTutor
                ? `${session.studentFirstName} ${session.studentLastName}`
                : `${session.tutorFirstName} ${session.tutorLastName}`

              return (
                <div
                  key={session.id}
                  className={`myclassroom-card ${soon ? 'myclassroom-card--soon' : ''}`}
                >
                  <div className="myclassroom-card-left">
                    <div className="myclassroom-avatar">
                      {otherName.charAt(0).toUpperCase()}
                    </div>
                    <div className="myclassroom-card-info">
                      <div className="myclassroom-card-name">{otherName}</div>
                      <div className="myclassroom-card-meta">
                        <span>{formatDateTime(session.requestedStart)}</span>
                        <span className="myclassroom-dot">·</span>
                        <span>{formatDuration(session.requestedStart, session.requestedEnd)}</span>
                        {session.subject && (
                          <>
                            <span className="myclassroom-dot">·</span>
                            <span>{session.subject}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="myclassroom-card-right">
                    <div className={`myclassroom-countdown ${soon ? 'myclassroom-countdown--soon' : ''}`}>
                      {getTimeUntil(session.requestedStart)}
                    </div>
                    {classroomSessionId === String(session.id) ? (
                      <div className="myclassroom-live-indicator">
                        <span className="myclassroom-live-dot" />
                        Session in progress
                      </div>
                    ) : (
                      <button
                        className={`myclassroom-btn ${soon ? 'myclassroom-btn--active' : 'myclassroom-btn--default'}`}
                        onClick={() => handleEnter(session)}
                      >
                        {isTutor ? 'Open Classroom' : 'Join Classroom'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}