import { useEffect, useState } from 'react'
import './styles/AdminPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function AdminPage({ currentUser }) {
  // ORIGINAL STATE
  const [users, setUsers] = useState([])
  const [tutors, setTutors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('users')

  // ORIGINAL FEEDBACK STATE
  const [feedback, setFeedback] = useState([])
  const [feedbackStats, setFeedbackStats] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState({ status: '', isRead: '', search: '' })
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  // NEW SESSION STATE
  const [sessions, setSessions] = useState([])
  const [sessionStats, setSessionStats] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState(null)
  const [sessionPage, setSessionPage] = useState(0)
  const [sessionTotalPages, setSessionTotalPages] = useState(0)
  const [sessionFilters, setSessionFilters] = useState({ status: '', search: '' })
  const [selectedSession, setSelectedSession] = useState(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [cancelNote, setCancelNote] = useState('')

  const adminUserId = currentUser?.userId

  // ORIGINAL useEffect
  useEffect(() => {
    if (!adminUserId) return

    const fetchData = async () => {
      try {
        setError(null)
        setLoading(true)

        const usersRes = await fetch(
          `${API_BASE}/api/admin/users?adminUserId=${adminUserId}`,
          { credentials: 'include' }
        )

        if (!usersRes.ok) {
          throw new Error((await usersRes.text()) || 'Failed to load users')
        }

        const usersData = await usersRes.json()
        setUsers(usersData)

        const tutorsRes = await fetch(`${API_BASE}/api/tutors`)

        if (tutorsRes.ok) {
          const tutorsData = await tutorsRes.json()
          const tutorMap = {}
          tutorsData.forEach(tutor => {
            tutorMap[tutor.userId] = tutor
          })
          setTutors(tutorMap)
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [adminUserId])

  // ORIGINAL FEEDBACK useEffect
  useEffect(() => {
    if (activeTab === 'feedback') {
      loadFeedback()
      loadFeedbackStats()
    }
  }, [activeTab, currentPage, filters])

  // NEW SESSION useEffect
  useEffect(() => {
    if (activeTab === 'sessions' && adminUserId) {
      loadSessions()
      loadSessionStats()
    }
  }, [activeTab, adminUserId, sessionPage, sessionFilters])

  // ORIGINAL FEEDBACK FUNCTIONS
  const loadFeedback = async () => {
    setFeedbackLoading(true)
    setFeedbackError(null)
    try {
      const params = new URLSearchParams({ page: currentPage, size: 20 })
      if (filters.status) params.append('status', filters.status)
      if (filters.isRead !== '') params.append('isRead', filters.isRead)
      if (filters.search) params.append('search', filters.search)
      const res = await fetch(`${API_BASE}/api/admin/feedback?${params}`)
      if (!res.ok) throw new Error('Failed to load feedback')
      const data = await res.json()
      setFeedback(data.feedback || [])
      setTotalPages(data.totalPages || 0)
      setTotalItems(data.totalItems || 0)
    } catch (err) {
      console.error(err)
      setFeedbackError(err.message)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const loadFeedbackStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/stats`)
      if (res.ok) setFeedbackStats(await res.json())
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
    setCurrentPage(0)
  }

  const handleMarkAsRead = async (id, isRead) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead })
      })
      if (res.ok) {
        loadFeedback()
        loadFeedbackStats()
      }
    } catch (err) {
      console.error('Failed to update read status:', err)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        loadFeedback()
        loadFeedbackStats()
        if (selectedFeedback && selectedFeedback.id === id) {
          setSelectedFeedback({ ...selectedFeedback, status })
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedFeedback) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${selectedFeedback.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: adminNotes })
      })
      if (res.ok) {
        alert('Notes saved successfully')
        loadFeedback()
        setShowModal(false)
      }
    } catch (err) {
      console.error('Failed to save notes:', err)
      alert('Failed to save notes')
    }
  }

  const handleDeleteFeedback = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadFeedback()
        loadFeedbackStats()
        setShowModal(false)
      }
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      alert('Failed to delete feedback')
    }
  }

  const openModal = (item) => {
    setSelectedFeedback(item)
    setAdminNotes(item.adminNotes || '')
    setShowModal(true)
    if (!item.isRead) handleMarkAsRead(item.id, true)
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleString()
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  const getStatusBadgeClass = (status) => {
    const map = { NEW: 'feedback-status-new', IN_PROGRESS: 'feedback-status-in-progress', RESOLVED: 'feedback-status-resolved', ARCHIVED: 'feedback-status-archived' }
    return `feedback-status-badge ${map[status] || ''}`
  }
  const getStatusLabel = (status) => {
    const map = { NEW: 'New', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', ARCHIVED: 'Archived' }
    return map[status] || status
  }

  // NEW SESSION FUNCTIONS
  const loadSessions = async () => {
    try {
      setSessionLoading(true)
      setSessionError(null)

      const params = new URLSearchParams({
        page: sessionPage.toString(),
        size: '20',
      })

      if (sessionFilters.status) params.append('status', sessionFilters.status)
      if (sessionFilters.search) params.append('search', sessionFilters.search)

      const res = await fetch(`${API_BASE}/api/admin/sessions?${params}`, {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to load sessions')

      const data = await res.json()
      setSessions(data.sessions || [])
      setSessionTotalPages(data.totalPages || 0)
    } catch (err) {
      console.error(err)
      setSessionError(err.message)
    } finally {
      setSessionLoading(false)
    }
  }

  const loadSessionStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions/statistics`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setSessionStats({
          total: data.totalSessions || 0,
          pending: data.pendingSessions || 0,
          accepted: data.acceptedSessions || 0,
          upcoming: data.upcomingSessions || 0,
          declined: data.declinedSessions || 0,
          cancelled: data.cancelledSessions || 0
        })
      }
    } catch (err) {
      console.error('Failed to load session stats:', err)
    }
  }

  const handleSessionFilterChange = (key, value) => {
    setSessionFilters((prev) => ({ ...prev, [key]: value }))
    setSessionPage(0)
  }

  const openSessionModal = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions/${sessionId}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load session details')

      const data = await res.json()
      setSelectedSession(data)
      setCancelNote('')
      setShowSessionModal(true)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to load session')
    }
  }

  const cancelSession = async () => {
    if (!confirm('Are you sure you want to cancel this session?')) return

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/sessions/${selectedSession.sessionId}/cancel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ adminNote: cancelNote }),
        }
      )

      if (!res.ok) throw new Error('Failed to cancel session')

      await loadSessions()
      await loadSessionStats()
      setShowSessionModal(false)
      alert('Session cancelled successfully')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to cancel session')
    }
  }

  const formatCurrency = (cents) => {
    if (!cents) return '$0.00'
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getSessionStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: 'session-badge-pending',
      ACCEPTED: 'session-badge-accepted',
      DECLINED: 'session-badge-declined',
      CANCELLED: 'session-badge-cancelled',
    }
    return statusMap[status] || 'session-badge-default'
  }

  const getPaymentStatusClass = (status) => {
    const statusMap = {
      CAPTURED: 'payment-badge-captured',
      AUTHORIZED: 'payment-badge-authorized',
      CANCELLED: 'payment-badge-cancelled',
      REFUNDED: 'payment-badge-refunded',
    }
    return statusMap[status] || 'payment-badge-default'
  }

  // ORIGINAL USER FUNCTIONS
  const updateStatus = async (id, status) => {
    if (!adminUserId) return

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${id}/status?adminUserId=${adminUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error((await res.text()) || 'Failed to update status')
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status } : u))
      )
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update status')
    }
  }

  const updateVerificationTier = async (userId, tier) => {
    if (!adminUserId) return

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/tutors/${userId}/verification-tier?adminUserId=${adminUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verificationTier: tier }),
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error((await res.text()) || 'Failed to update verification tier')
      }

      setTutors(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          verificationTier: tier
        }
      }))

      alert('Verification tier updated successfully!')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update verification tier')
    }
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <p>Not authorized.</p>
  }

  const tutorUsers = users.filter((u) => u.role === 'TUTOR')

  return (
    <div className="my-profile-page">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'tutors' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutors')}
        >
          Tutor Verification
        </button>
        <button
          className={`admin-tab ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Session Management
        </button>
      </div>

      {loading && activeTab !== 'feedback' && activeTab !== 'sessions' && <p className="profile-value">Loading...</p>}
      {error && <p className="auth-error">{error}</p>}

      {/* USERS TAB */}
      {!loading && !error && activeTab === 'users' && (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>EMAIL</th>
              <th>NAME</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  <button
                    className="admin-btn"
                    onClick={() => updateStatus(u.id, 'ACTIVE')}
                  >
                    Activate
                  </button>
                  <button
                    className="admin-btn"
                    onClick={() => updateStatus(u.id, 'SUSPENDED')}
                  >
                    Suspend
                  </button>
                  <button
                    className="admin-btn"
                    onClick={() => updateStatus(u.id, 'DEACTIVATED')}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* TUTORS TAB */}
      {!loading && !error && activeTab === 'tutors' && (
        <div className="tutors-verification-section">
          <h2>Manage Tutor Verification Tiers</h2>
          <p className="section-description">
            Update verification tiers for tutors. Higher tiers indicate greater
            verification levels.
          </p>

          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Current Tier</th>
                <th>Change Tier</th>
              </tr>
            </thead>
            <tbody>
              {tutorUsers.map((tutor) => {
                const tutorData = tutors[tutor.id]
                const currentTier = tutorData?.verificationTier || 'TIER_1'

                return (
                  <tr key={tutor.id}>
                    <td>{tutor.id}</td>
                    <td>
                      {tutor.firstName} {tutor.lastName}
                    </td>
                    <td>{tutor.email}</td>
                    <td>
                      <span
                        className={`status-badge status-${tutor.status.toLowerCase()}`}
                      >
                        {tutor.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tier-badge tier-${currentTier.toLowerCase()}`}
                      >
                        {currentTier.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="tier-buttons">
                        <button
                          className={`btn-tier ${
                            currentTier === 'TIER_1' ? 'active' : ''
                          }`}
                          onClick={() =>
                            updateVerificationTier(tutor.id, 'TIER_1')
                          }
                          disabled={currentTier === 'TIER_1'}
                        >
                          Tier 1
                        </button>
                        <button
                          className={`btn-tier ${
                            currentTier === 'TIER_2' ? 'active' : ''
                          }`}
                          onClick={() =>
                            updateVerificationTier(tutor.id, 'TIER_2')
                          }
                          disabled={currentTier === 'TIER_2'}
                        >
                          Tier 2
                        </button>
                        <button
                          className={`btn-tier ${
                            currentTier === 'TIER_3' ? 'active' : ''
                          }`}
                          onClick={() =>
                            updateVerificationTier(tutor.id, 'TIER_3')
                          }
                          disabled={currentTier === 'TIER_3'}
                        >
                          Tier 3
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {tutorUsers.length === 0 && (
            <p className="profile-value">No tutors found.</p>
          )}
        </div>
      )}

      {/* ORIGINAL FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="feedback-management-section">
          {feedbackStats && (
            <div className="feedback-stats-grid">
              <div className="feedback-stat-card"><div className="feedback-stat-value">{feedbackStats.total}</div><div className="feedback-stat-label">Total</div></div>
              <div className="feedback-stat-card"><div className="feedback-stat-value">{feedbackStats.unread}</div><div className="feedback-stat-label">Unread</div></div>
              <div className="feedback-stat-card"><div className="feedback-stat-value">{feedbackStats.new}</div><div className="feedback-stat-label">New</div></div>
              <div className="feedback-stat-card"><div className="feedback-stat-value">{feedbackStats.inProgress}</div><div className="feedback-stat-label">In Progress</div></div>
              <div className="feedback-stat-card"><div className="feedback-stat-value">{feedbackStats.resolved}</div><div className="feedback-stat-label">Resolved</div></div>
            </div>
          )}
          <div className="feedback-filters-row">
            <input type="text" className="feedback-filter-input" placeholder="Search by name, email, or comment..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
            <select className="feedback-filter-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              <option value="">All Statuses</option><option value="NEW">New</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="ARCHIVED">Archived</option>
            </select>
            <select className="feedback-filter-select" value={filters.isRead} onChange={(e) => handleFilterChange('isRead', e.target.value)}>
              <option value="">All</option><option value="false">Unread</option><option value="true">Read</option>
            </select>
          </div>
          {feedbackError && <div className="feedback-error-msg">{feedbackError}</div>}
          {feedbackLoading ? <div className="feedback-loading">Loading feedback...</div> : feedback.length === 0 ? <div className="feedback-empty">No feedback found</div> : (
            <>
              <div className="feedback-items-list">
                {feedback.map((item) => (
                  <div key={item.id} className={`feedback-list-item ${!item.isRead ? 'feedback-item-unread' : ''}`} onClick={() => openModal(item)}>
                    <div className="feedback-list-header">
                      <div className="feedback-list-user"><strong>{item.name}</strong><span className="feedback-list-email">{item.email}</span></div>
                      <div className="feedback-list-meta"><span className={getStatusBadgeClass(item.status)}>{getStatusLabel(item.status)}</span>{!item.isRead && <span className="feedback-unread-dot">●</span>}</div>
                    </div>
                    <div className="feedback-list-comment">{item.comment.length > 150 ? item.comment.substring(0, 150) + '...' : item.comment}</div>
                    <div className="feedback-list-footer">
                      <span className="feedback-list-date">{formatDate(item.createdAt)}</span>
                      {item.attachments && item.attachments.length > 0 && <span className="feedback-list-attachments">📎 {item.attachments.length} file(s)</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="feedback-pagination">
                <button className="feedback-page-btn" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                <span className="feedback-page-info">Page {currentPage + 1} of {totalPages} ({totalItems} total)</span>
                <button className="feedback-page-btn" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
              </div>
            </>
          )}
          {showModal && selectedFeedback && (
            <div className="feedback-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="feedback-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="feedback-modal-header"><h2>Feedback Details</h2><button className="feedback-modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                <div className="feedback-modal-body">
                  <div className="feedback-modal-section"><label>From:</label><div><strong>{selectedFeedback.name}</strong><br /><a href={`mailto:${selectedFeedback.email}`}>{selectedFeedback.email}</a></div></div>
                  <div className="feedback-modal-section"><label>Date:</label><div>{formatDate(selectedFeedback.createdAt)}</div></div>
                  <div className="feedback-modal-section"><label>Status:</label><select className="feedback-status-dropdown" value={selectedFeedback.status} onChange={(e) => handleStatusChange(selectedFeedback.id, e.target.value)}>
                    <option value="NEW">New</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="ARCHIVED">Archived</option>
                  </select></div>
                  <div className="feedback-modal-section"><label>Feedback:</label><div className="feedback-modal-comment">{selectedFeedback.comment}</div></div>
                  {selectedFeedback.attachments && selectedFeedback.attachments.length > 0 && (
                    <div className="feedback-modal-section"><label>Attachments:</label><div className="feedback-modal-attachments">
                      {selectedFeedback.attachments.map((att) => <div key={att.id} className="feedback-modal-attachment"><span>{att.fileName}</span><span className="feedback-attachment-size">{formatFileSize(att.fileSize)}</span></div>)}
                    </div></div>
                  )}
                  <div className="feedback-modal-section"><label>Admin Notes:</label><textarea className="feedback-notes-textarea" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} placeholder="Add internal notes..." /></div>
                </div>
                <div className="feedback-modal-footer">
                  <button className="feedback-btn-delete" onClick={() => handleDeleteFeedback(selectedFeedback.id)}>Delete</button>
                  <div className="feedback-modal-actions">
                    <button className="feedback-btn-cancel" onClick={() => setShowModal(false)}>Close</button>
                    <button className="feedback-btn-save" onClick={handleSaveNotes}>Save Notes</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEW SESSION TAB */}
      {activeTab === 'sessions' && (
        <div className="session-management-section">
          {sessionStats && (
            <div className="session-stats-grid">
              <div className="session-stat-card">
                <div className="session-stat-value">{sessionStats.total}</div>
                <div className="session-stat-label">Total</div>
              </div>
              <div className="session-stat-card">
                <div className="session-stat-value">{sessionStats.pending}</div>
                <div className="session-stat-label">Pending</div>
              </div>
              <div className="session-stat-card">
                <div className="session-stat-value">{sessionStats.accepted}</div>
                <div className="session-stat-label">Accepted</div>
              </div>
              <div className="session-stat-card">
                <div className="session-stat-value">{sessionStats.upcoming}</div>
                <div className="session-stat-label">Upcoming</div>
              </div>
              <div className="session-stat-card">
                <div className="session-stat-value">{sessionStats.declined}</div>
                <div className="session-stat-label">Declined</div>
              </div>
              <div className="session-stat-card">
                <div className="session-stat-value">
                  {sessionStats.cancelled}
                </div>
                <div className="session-stat-label">Cancelled</div>
              </div>
            </div>
          )}

          <div className="session-filters-row">
            <input
              type="text"
              className="session-filter-input"
              placeholder="Search by student, tutor, or subject..."
              value={sessionFilters.search}
              onChange={(e) =>
                handleSessionFilterChange('search', e.target.value)
              }
            />
            <select
              className="session-filter-select"
              value={sessionFilters.status}
              onChange={(e) =>
                handleSessionFilterChange('status', e.target.value)
              }
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {sessionError && (
            <div className="session-error-msg">{sessionError}</div>
          )}

          {sessionLoading ? (
            <div className="session-loading">Loading sessions...</div>
          ) : (
            <>
              <div className="sessions-table-container">
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Tutor</th>
                      <th>Date/Time</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.sessionId}>
                        <td>{session.sessionId}</td>
                        <td>
                          <div className="session-user-info">
                            <div className="session-user-name">
                              {session.studentName}
                            </div>
                            <div className="session-user-email">
                              {session.studentEmail}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="session-user-info">
                            <div className="session-user-name">
                              {session.tutorName}
                            </div>
                            <div className="session-user-email">
                              {session.tutorEmail}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="session-datetime">
                            {formatDateTime(session.requestedStart)}
                          </div>
                        </td>
                        <td>{session.subject}</td>
                        <td>
                          <span className={getSessionStatusBadgeClass(session.status)}>
                            {session.status}
                          </span>
                        </td>
                        <td>
                          {session.paymentId ? (
                            <div className="session-payment-info">
                              <div>
                                <strong>
                                  {formatCurrency(session.paymentAmountCents)}
                                </strong>
                              </div>
                              <span
                                className={getPaymentStatusClass(
                                  session.paymentStatus
                                )}
                              >
                                {session.paymentStatus}
                              </span>
                            </div>
                          ) : (
                            'No payment'
                          )}
                        </td>
                        <td>
                          <button
                            className="session-action-btn"
                            onClick={() => openSessionModal(session.sessionId)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {sessions.length === 0 && (
                  <div className="session-empty">No sessions found</div>
                )}
              </div>

              {sessionTotalPages > 1 && (
                <div className="session-pagination">
                  <button
                    className="session-page-btn"
                    onClick={() => setSessionPage((p) => Math.max(0, p - 1))}
                    disabled={sessionPage === 0}
                  >
                    Previous
                  </button>
                  <span className="session-page-info">
                    Page {sessionPage + 1} of {sessionTotalPages}
                  </span>
                  <button
                    className="session-page-btn"
                    onClick={() =>
                      setSessionPage((p) =>
                        Math.min(sessionTotalPages - 1, p + 1)
                      )
                    }
                    disabled={sessionPage === sessionTotalPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SESSION MODAL */}
      {showSessionModal && selectedSession && (
        <div className="session-modal-overlay">
          <div className="session-modal-box">
            <div className="session-modal-header">
              <h2>Session Details</h2>
              <button
                className="session-modal-close"
                onClick={() => setShowSessionModal(false)}
              >
                ×
              </button>
            </div>

            <div className="session-modal-body">
              <div className="session-modal-section">
                <label>Session ID:</label>
                <p>{selectedSession.sessionId}</p>
              </div>

              <div className="session-modal-section">
                <label>Student:</label>
                <p>
                  {selectedSession.studentName} ({selectedSession.studentEmail})
                </p>
              </div>

              <div className="session-modal-section">
                <label>Tutor:</label>
                <p>
                  {selectedSession.tutorName} ({selectedSession.tutorEmail})
                </p>
              </div>

              <div className="session-modal-section">
                <label>Schedule:</label>
                <p>
                  <strong>Start:</strong>{' '}
                  {formatDateTime(selectedSession.requestedStart)}
                  <br />
                  <strong>End:</strong>{' '}
                  {formatDateTime(selectedSession.requestedEnd)}
                  <br />
                  <strong>Timezone:</strong> {selectedSession.timezone}
                </p>
              </div>

              <div className="session-modal-section">
                <label>Subject:</label>
                <p>{selectedSession.subject}</p>
              </div>

              <div className="session-modal-section">
                <label>Status:</label>
                <p>
                  <span className={getSessionStatusBadgeClass(selectedSession.status)}>
                    {selectedSession.status}
                  </span>
                </p>
              </div>

              {selectedSession.studentMessage && (
                <div className="session-modal-section">
                  <label>Student Message:</label>
                  <p className="session-modal-message">
                    {selectedSession.studentMessage}
                  </p>
                </div>
              )}

              {selectedSession.tutorResponse && (
                <div className="session-modal-section">
                  <label>Tutor Response:</label>
                  <p className="session-modal-message">
                    {selectedSession.tutorResponse}
                  </p>
                </div>
              )}

              {selectedSession.paymentId && (
                <div className="session-modal-section">
                  <label>Payment Information:</label>
                  <p>
                    <strong>Amount:</strong>{' '}
                    {formatCurrency(selectedSession.paymentAmountCents)}
                    <br />
                    <strong>Status:</strong>{' '}
                    <span
                      className={getPaymentStatusClass(
                        selectedSession.paymentStatus
                      )}
                    >
                      {selectedSession.paymentStatus}
                    </span>
                    <br />
                    {selectedSession.stripePaymentIntentId && (
                      <>
                        <strong>Stripe ID:</strong>{' '}
                        {selectedSession.stripePaymentIntentId}
                      </>
                    )}
                  </p>
                </div>
              )}

              <div className="session-modal-section">
                <label>Timestamps:</label>
                <p>
                  <strong>Created:</strong>{' '}
                  {formatDateTime(selectedSession.createdAt)}
                  <br />
                  {selectedSession.respondedAt && (
                    <>
                      <strong>Responded:</strong>{' '}
                      {formatDateTime(selectedSession.respondedAt)}
                    </>
                  )}
                </p>
              </div>

              {(selectedSession.status === 'PENDING' ||
                selectedSession.status === 'ACCEPTED') && (
                <div className="session-modal-section">
                  <label>Cancel Session:</label>
                  <textarea
                    className="session-cancel-textarea"
                    placeholder="Admin cancellation note (optional)"
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className="session-modal-footer">
              <button
                className="session-btn-close"
                onClick={() => setShowSessionModal(false)}
              >
                Close
              </button>
              {(selectedSession.status === 'PENDING' ||
                selectedSession.status === 'ACCEPTED') && (
                <button className="session-btn-cancel" onClick={cancelSession}>
                  Cancel Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage