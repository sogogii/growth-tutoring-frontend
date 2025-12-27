import { useState, useEffect } from 'react'
import './styles/SessionCalendar.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function SessionCalendar({ tutorUserId }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Load accepted sessions for current month
  useEffect(() => {
    loadSessions()
  }, [tutorUserId, currentDate])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/tutor/${tutorUserId}/upcoming`
      )
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch (err) {
      console.error('Error loading sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    return days
  }

  // Get sessions for a specific date
  const getSessionsForDate = (date) => {
    if (!date) return []
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.requestedStart)
      return (
        sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate()
      )
    })
  }

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  // Format time
  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format duration
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

  // Handle session click
  const handleSessionClick = (session) => {
    setSelectedSession(session)
    setShowModal(true)
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="session-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={prevMonth} className="nav-btn">
            ← Prev
          </button>
          <button onClick={goToToday} className="today-btn">
            Today
          </button>
          <button onClick={nextMonth} className="nav-btn">
            Next →
          </button>
        </div>
        <h2 className="calendar-title">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="calendar-legend">
          <span className="legend-item">
            <span className="legend-dot booked"></span>
            Booked Sessions
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="calendar-loading">Loading calendar...</div>
      ) : (
        <div className="calendar-grid">
          {/* Day headers */}
          {DAYS.map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const daySessions = day.date ? getSessionsForDate(day.date) : []
            const hasEvents = daySessions.length > 0

            return (
              <div
                key={index}
                className={`calendar-day ${
                  !day.isCurrentMonth ? 'other-month' : ''
                } ${isToday(day.date) ? 'today' : ''} ${
                  hasEvents ? 'has-events' : ''
                }`}
              >
                {day.date && (
                  <>
                    <div className="day-number">
                      {day.date.getDate()}
                    </div>

                    {/* Session indicators */}
                    <div className="day-sessions">
                      {daySessions.slice(0, 3).map((session, idx) => (
                        <div
                          key={session.id}
                          className="session-indicator"
                          onClick={() => handleSessionClick(session)}
                          title={`${session.studentFirstName} ${session.studentLastName} - ${formatTime(session.requestedStart)}`}
                        >
                          <div className="session-time">
                            {formatTime(session.requestedStart)}
                          </div>
                          <div className="session-student">
                            {session.studentFirstName} {session.studentLastName?.charAt(0)}.
                          </div>
                        </div>
                      ))}
                      {daySessions.length > 3 && (
                        <div className="more-sessions">
                          +{daySessions.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Session Details Modal */}
      {showModal && selectedSession && (
        <div className="session-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="session-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>

            <h3>Session Details</h3>

            <div className="modal-content">
              {/* Student Info */}
              <div className="modal-section">
                <div className="modal-label">Student</div>
                <div className="modal-value student-info">
                  <div className="student-avatar">
                    {selectedSession.studentFirstName?.charAt(0)}
                  </div>
                  <div>
                    <div className="student-name">
                      {selectedSession.studentFirstName} {selectedSession.studentLastName}
                    </div>
                    <div className="student-email">{selectedSession.studentEmail}</div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="modal-section">
                <div className="modal-label">📅 Date & Time</div>
                <div className="modal-value">
                  {new Date(selectedSession.requestedStart).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  <br />
                  {formatTime(selectedSession.requestedStart)} - {formatTime(selectedSession.requestedEnd)}
                </div>
              </div>

              {/* Duration */}
              <div className="modal-section">
                <div className="modal-label">⏱️ Duration</div>
                <div className="modal-value">
                  {formatDuration(selectedSession.requestedStart, selectedSession.requestedEnd)}
                </div>
              </div>

              {/* Subject */}
              {selectedSession.subject && (
                <div className="modal-section">
                  <div className="modal-label">📚 Subject</div>
                  <div className="modal-value">{selectedSession.subject}</div>
                </div>
              )}

              {/* Message */}
              {selectedSession.message && (
                <div className="modal-section">
                  <div className="modal-label">💬 Message</div>
                  <div className="modal-value message-box">
                    {selectedSession.message}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="modal-section">
                <div className="modal-label">Status</div>
                <div className="modal-value">
                  <span className={`status-badge status-${selectedSession.status.toLowerCase()}`}>
                    {selectedSession.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionCalendar