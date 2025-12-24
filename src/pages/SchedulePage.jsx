// src/pages/SchedulePage.jsx - Complete with Admin-Style Tabs
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScheduleEditor from '../components/ScheduleEditor'
import SessionRequestsList from '../components/SessionRequestsList'
import './styles/SchedulePage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function SchedulePage({ currentUser }) {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(null)
  const [sessionRequests, setSessionRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState('availability') // 'availability' or 'requests'

  // Redirect if not a tutor
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (currentUser.role !== 'TUTOR') {
      navigate('/')
      return
    }
  }, [currentUser, navigate])

  // Load current schedule
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'TUTOR') return

    const loadSchedule = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/schedule`
        )
        
        if (!res.ok) {
          throw new Error('Failed to load schedule')
        }

        const data = await res.json()
        setSchedule(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [currentUser])

  // Load session requests
  const loadSessionRequests = async () => {
    if (!currentUser || currentUser.role !== 'TUTOR') return

    try {
      const res = await fetch(
        `${API_BASE}/api/session-requests/tutor/${currentUser.userId}`
      )
      
      if (!res.ok) {
        throw new Error('Failed to load session requests')
      }

      const data = await res.json()
      setSessionRequests(data)
    } catch (err) {
      console.error('Error loading session requests:', err)
    }
  }

  useEffect(() => {
    loadSessionRequests()
  }, [currentUser])

  const handleScheduleChange = (newSchedule) => {
    setSchedule(newSchedule)
    setSuccess(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!currentUser) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(
        `${API_BASE}/api/tutors/user/${currentUser.userId}/schedule`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schedule)
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to save schedule')
      }

      setSuccess('Schedule saved successfully!')
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRequestUpdate = () => {
    loadSessionRequests()
    setSuccess('Request updated successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  if (!currentUser || currentUser.role !== 'TUTOR') {
    return null
  }

  if (loading) {
    return (
      <div className="schedule-page">
        <div className="schedule-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = sessionRequests.filter(r => r.status === 'PENDING').length

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        {/* Page Header */}
        <div className="schedule-page-header">
          <div>
            <h1 className="schedule-page-title">My Schedule</h1>
            <p className="schedule-page-subtitle">
              Manage your availability and session requests
            </p>
          </div>
          <button
            className="btn-back-to-profile"
            onClick={() => navigate('/my-profile')}
          >
            ← Back to Profile
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="schedule-message schedule-success">
            ✓ {success}
          </div>
        )}
        
        {error && (
          <div className="schedule-message schedule-error">
            ✕ {error}
          </div>
        )}

        {/* Admin-Style Tabs */}
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
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'availability' && (
            <div className="availability-tab">
              {/* Schedule Editor */}
              <ScheduleEditor
                schedule={schedule}
                onScheduleChange={handleScheduleChange}
              />

              {/* Save Button */}
              <div className="schedule-actions">
                <button
                  className="btn-save-schedule"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="btn-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Availability'
                  )}
                </button>
              </div>

              {/* Help Text */}
              <div className="schedule-help">
                <h3>💡 Tips for Setting Your Availability</h3>
                <ul>
                  <li>Set your general available hours - students will request specific times within these</li>
                  <li>Update regularly to reflect changes in your schedule</li>
                  <li>Students can request sessions up to 3 months in advance</li>
                  <li>You can accept or decline session requests individually in the "Session Requests" tab</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-tab">
              <SessionRequestsList
                requests={sessionRequests}
                tutorUserId={currentUser.userId}
                onUpdate={handleRequestUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SchedulePage