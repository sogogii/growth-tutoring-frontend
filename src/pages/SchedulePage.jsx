// src/pages/SchedulePage.jsx - Complete with 3 tabs
import { useState, useEffect } from 'react'
import ScheduleEditor from '../components/ScheduleEditor'
import TutorSessionsPage from './TutorSessionsPage'
import SessionCalendar from '../components/SessionCalendar'
import './styles/SchedulePage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function SchedulePage({ currentUser }) {
  // Tab state
  const [activeTab, setActiveTab] = useState('availability')

  // Schedule state
  const [schedule, setSchedule] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Pending requests count for badge
  const [pendingCount, setPendingCount] = useState(0)

  // Load tutor's schedule and pending count on mount
  useEffect(() => {
    if (currentUser?.userId) {
      loadSchedule()
      loadPendingCount()
    }
  }, [currentUser])

  // Load schedule from API
  const loadSchedule = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tutors/${currentUser.userId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.weeklySchedule) {
          setSchedule(data.weeklySchedule)
        }
      }
    } catch (err) {
      console.error('Error loading schedule:', err)
    }
  }

  // Load pending session requests count
  const loadPendingCount = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/tutor/${currentUser.userId}/pending`
      )
      if (res.ok) {
        const data = await res.json()
        setPendingCount(data.length)
      }
    } catch (err) {
      console.error('Error loading pending count:', err)
    }
  }

  // Save schedule to API
  const handleSaveSchedule = async (newSchedule) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`${API_BASE}/api/tutors/${currentUser.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklySchedule: newSchedule })
      })

      if (!res.ok) {
        throw new Error('Failed to save schedule')
      }

      setSchedule(newSchedule)
      setSuccess('Schedule saved successfully!')
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle request updates (when tutor accepts/declines)
  const handleRequestUpdate = () => {
    loadPendingCount()
  }

  // Guard: Not logged in
  if (!currentUser) {
    return (
      <div className="schedule-page">
        <div className="schedule-container">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h2>Please Log In</h2>
            <p>You need to be logged in to manage your schedule.</p>
          </div>
        </div>
      </div>
    )
  }

  // Guard: Not a tutor
  if (currentUser.role !== 'TUTOR') {
    return (
      <div className="schedule-page">
        <div className="schedule-container">
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h2>Tutors Only</h2>
            <p>Only tutors can manage schedules.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        {/* Page Header */}
        <div className="schedule-page-header">
          <h1>My Schedule</h1>
          <p>Manage your availability, session requests, and calendar</p>
        </div>

        {/* Admin-style Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            My Availability
          </button>
          
          <button
            className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Session Requests
            {pendingCount > 0 && (
              <span className="tab-badge">{pendingCount}</span>
            )}
          </button>
          
          <button
            className={`admin-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar View
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          
          {/* ========================================
               TAB 1: MY AVAILABILITY
               ======================================== */}
          {activeTab === 'availability' && (
            <div className="availability-tab">
              {/* Success/Error Messages */}
              {success && (
                <div className="success-message">
                  ✓ {success}
                </div>
              )}
              {error && (
                <div className="error-message">
                  ✗ {error}
                </div>
              )}

              {/* Schedule Editor Component */}
              <ScheduleEditor
                schedule={schedule}
                onScheduleChange={setSchedule}
              />

              {/* Save Button */}
              <div className="schedule-actions">
                <button
                  onClick={() => handleSaveSchedule(schedule)}
                  disabled={saving}
                  className="btn-save-schedule"
                >
                  {saving ? (
                    <>
                      <span className="spinner"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Schedule'
                  )}
                </button>
              </div>

              {/* Help Tips */}
              <div className="schedule-help">
                <h3>💡 Tips for Setting Your Availability</h3>
                <ul>
                  <li>
                    <strong>Set your weekly hours:</strong> Click time slots to mark when 
                    you're available for tutoring sessions.
                  </li>
                  <li>
                    <strong>Students book during these times:</strong> Only times you've 
                    marked as available will be shown to students.
                  </li>
                  <li>
                    <strong>Update anytime:</strong> Your schedule is flexible - change it 
                    whenever your availability changes.
                  </li>
                  <li>
                    <strong>Don't forget to save:</strong> Click "Save Schedule" after 
                    making changes to update your availability.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================
               TAB 2: SESSION REQUESTS
               ======================================== */}
          {activeTab === 'requests' && (
            <div className="requests-tab">
              <TutorSessionsPage currentUser={currentUser} />
            </div>
          )}

          {/* ========================================
               TAB 3: CALENDAR VIEW
               ======================================== */}
          {activeTab === 'calendar' && (
            <div className="calendar-tab">
              <div className="calendar-intro">
                <h2>Your Session Calendar</h2>
                <p>
                  View all your booked sessions in a monthly calendar format. 
                  Click on any session to see student details and session information.
                </p>
              </div>

              <SessionCalendar tutorUserId={currentUser.userId} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default SchedulePage