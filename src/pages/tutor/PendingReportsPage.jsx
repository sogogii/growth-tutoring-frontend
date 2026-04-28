import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/PendingReportsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function TimeIndicator({ hoursRemaining, isOverdue }) {
  if (isOverdue) {
    const overdueDays = Math.abs(Math.ceil(hoursRemaining / 24))
    return (
      <div className="pr-time pr-time--overdue">
        <span className="pr-time-icon">⚠</span>
        <span>Overdue by {overdueDays} day{overdueDays !== 1 ? 's' : ''}</span>
      </div>
    )
  }
  if (hoursRemaining <= 6) {
    return (
      <div className="pr-time pr-time--urgent">
        <span className="pr-time-icon">🔥</span>
        <span>{hoursRemaining}h remaining</span>
      </div>
    )
  }
  return (
    <div className="pr-time pr-time--ok">
      <span className="pr-time-icon">⏱</span>
      <span>{hoursRemaining}h remaining</span>
    </div>
  )
}

export default function PendingReportsPage({ currentUser }) {
  const navigate   = useNavigate()
  const tutorId    = currentUser?.userId

  const [sessions,  setSessions]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [filter,    setFilter]    = useState('all') // all | overdue | upcoming

  useEffect(() => {
    if (!tutorId) return
    fetch(`${API_BASE}/api/reports/pending-sessions/${tutorId}`, {
      credentials: 'include',
    })
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then(data => setSessions(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tutorId])

  const filtered = sessions.filter(s => {
    if (filter === 'overdue')  return s.isOverdue
    if (filter === 'upcoming') return !s.isOverdue
    return true
  })

  const overdueCount  = sessions.filter(s => s.isOverdue).length
  const urgentCount   = sessions.filter(s => !s.isOverdue && s.hoursRemaining <= 6).length
  const pendingCount  = sessions.length

  return (
    <div className="pr-page">
      <div className="pr-container">

        {/* ── Header ── */}
        <div className="pr-header">
          <button className="pr-back-btn" onClick={() => navigate('/my-schedule')}>
            ← Back to Schedule
          </button>
          <div className="pr-header-main">
            <div>
              <div className="pr-ai-badge">✦ AI Progress Reports</div>
              <h1 className="pr-title">Pending Reports</h1>
              <p className="pr-subtitle">
                You are required to submit a progress report within <strong>24 hours</strong> after each session.
              </p>
            </div>
            {overdueCount > 0 && (
              <div className="pr-overdue-alert">
                <span className="pr-overdue-alert-icon">⚠</span>
                <div>
                  <p className="pr-overdue-alert-title">{overdueCount} overdue report{overdueCount !== 1 ? 's' : ''}</p>
                  <p className="pr-overdue-alert-sub">Please submit these immediately</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        {!loading && sessions.length > 0 && (
          <div className="pr-stats">
            <div className="pr-stat">
              <span className="pr-stat-num">{pendingCount}</span>
              <span className="pr-stat-label">Total pending</span>
            </div>
            <div className="pr-stat pr-stat--overdue">
              <span className="pr-stat-num">{overdueCount}</span>
              <span className="pr-stat-label">Overdue</span>
            </div>
            <div className="pr-stat pr-stat--urgent">
              <span className="pr-stat-num">{urgentCount}</span>
              <span className="pr-stat-label">Due within 6h</span>
            </div>
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && sessions.length > 0 && (
          <div className="pr-filter-tabs">
            {[
              { key: 'all',      label: `All (${sessions.length})` },
              { key: 'overdue',  label: `Overdue (${overdueCount})` },
              { key: 'upcoming', label: `Due Soon (${sessions.length - overdueCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                className={`pr-filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {loading && (
          <div className="pr-loading">
            <div className="pr-spinner" />
            <p>Loading pending sessions…</p>
          </div>
        )}

        {error && (
          <div className="pr-error">{error}</div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="pr-empty">
            <div className="pr-empty-icon">✓</div>
            <h2>All caught up!</h2>
            <p>You have no pending progress reports. Great work!</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="pr-list">
            {filtered.map(session => (
              <div
                key={session.sessionId}
                className={`pr-card ${session.isOverdue ? 'pr-card--overdue' : ''} ${
                  !session.isOverdue && session.hoursRemaining <= 6 ? 'pr-card--urgent' : ''
                }`}
              >
                <div className="pr-card-left">
                  {session.studentProfileImageUrl ? (
                    <img
                      src={session.studentProfileImageUrl}
                      alt={session.studentName}
                      className="pr-avatar"
                    />
                  ) : (
                    <div className="pr-avatar pr-avatar--fallback">
                      {getInitials(session.studentName)}
                    </div>
                  )}
                </div>

                <div className="pr-card-body">
                  <div className="pr-card-top">
                    <div>
                      <h3 className="pr-student-name">{session.studentName}</h3>
                      <p className="pr-session-info">
                        {session.subject && <span className="pr-subject">{session.subject}</span>}
                        <span className="pr-date">{session.requestedStart}</span>
                        {session.sessionFormat && (
                          <span className={`pr-format pr-format--${session.sessionFormat.toLowerCase()}`}>
                            {session.sessionFormat === 'IN_PERSON' ? 'In-Person' : 'Online'}
                          </span>
                        )}
                      </p>
                    </div>
                    <TimeIndicator
                      hoursRemaining={session.hoursRemaining}
                      isOverdue={session.isOverdue}
                    />
                  </div>

                  <div className="pr-card-footer">
                    <p className="pr-deadline">
                      Deadline: <strong>{session.deadlineAt}</strong>
                    </p>
                    <button
                      className={`pr-write-btn ${session.isOverdue ? 'pr-write-btn--overdue' : ''}`}
                      onClick={() => navigate(
                        `/report/new?sessionId=${session.sessionId}&studentId=${session.studentUserId}&studentName=${encodeURIComponent(session.studentName)}`
                      )}
                    >
                      ✦ Write AI Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}