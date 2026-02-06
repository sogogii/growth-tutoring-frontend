import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/AdminPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function AdminPage({ currentUser }) {
  const navigate = useNavigate()
  
  // ORIGINAL STATE
  const [users, setUsers] = useState([])
  const [tutors, setTutors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('users')
  
  // USER SEARCH STATE
  const [userSearchTerm, setUserSearchTerm] = useState('')

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

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        loadFeedback()
        loadFeedbackStats()
        if (selectedFeedback?.id === id) {
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
        body: JSON.stringify({ adminNotes })
      })
      if (res.ok) {
        setSelectedFeedback({ ...selectedFeedback, adminNotes })
        loadFeedback()
        alert('Notes saved successfully')
      }
    } catch (err) {
      console.error('Failed to save notes:', err)
      alert('Failed to save notes')
    }
  }

  const handleDeleteFeedback = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        loadFeedback()
        loadFeedbackStats()
        setShowModal(false)
        setSelectedFeedback(null)
      }
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      alert('Failed to delete feedback')
    }
  }

  const openFeedbackModal = (item) => {
    setSelectedFeedback(item)
    setAdminNotes(item.adminNotes || '')
    setShowModal(true)
    if (!item.isRead) {
      handleMarkAsRead(item.id, true)
    }
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatStatusLabel = (status) => {
    const map = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', ARCHIVED: 'Archived' }
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
    if (!selectedSession) return

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/sessions/${selectedSession.sessionId}/cancel`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cancelNote: cancelNote || 'Cancelled by admin' }),
        }
      )

      if (!res.ok) throw new Error('Failed to cancel session')

      alert('Session cancelled successfully')
      setShowSessionModal(false)
      loadSessions()
      loadSessionStats()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to cancel session')
    }
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getSessionStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'session-status-pending'
      case 'ACCEPTED':
        return 'session-status-accepted'
      case 'DECLINED':
        return 'session-status-declined'
      case 'CANCELLED':
        return 'session-status-cancelled'
      default:
        return 'session-status-default'
    }
  }

  // ORIGINAL FUNCTIONS
  const updateStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${userId}/status?adminUserId=${adminUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
          credentials: 'include'
        }
      )

      if (!res.ok) {
        throw new Error((await res.text()) || 'Failed to update status')
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      )
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update status')
    }
  }

  const updateVerificationTier = async (userId, newTier) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/tutors/${userId}/verification-tier?adminUserId=${adminUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verificationTier: newTier }),
          credentials: 'include'
        }
      )

      if (!res.ok) {
        throw new Error((await res.text()) || 'Failed to update verification tier')
      }

      setTutors((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], verificationTier: newTier }
      }))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update verification tier')
    }
  }

  // NEW FUNCTION: Handle messaging a user
  const handleMessageUser = async (user) => {
    try {
      // Create or get existing conversation with this user
      const res = await fetch(
        `${API_BASE}/api/chat/conversations/with/${user.id}?userId=${adminUserId}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      )

      if (!res.ok) {
        throw new Error('Failed to create conversation')
      }

      const conversation = await res.json()
      
      // Navigate to the messages page with this conversation
      navigate(`/messages/${conversation.id}`)
    } catch (err) {
      console.error(err)
      alert('Failed to open message: ' + err.message)
    }
  }

  // NEW FUNCTION: Filter users based on search term
  const getFilteredUsers = () => {
    if (!userSearchTerm.trim()) {
      return users
    }

    const searchLower = userSearchTerm.toLowerCase().trim()
    
    return users.filter((user) => {
      // Search by ID (exact or partial match)
      if (user.id.toString().includes(searchLower)) {
        return true
      }
      
      // Search by email
      if (user.email.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Search by full name
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      if (fullName.includes(searchLower)) {
        return true
      }
      
      // Search by first name
      if (user.firstName.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Search by last name
      if (user.lastName.toLowerCase().includes(searchLower)) {
        return true
      }
      
      return false
    })
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <p>Not authorized.</p>
  }

  const tutorUsers = users.filter((u) => u.role === 'TUTOR')
  const filteredUsers = getFilteredUsers()

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

      {/* USERS TAB - IMPROVED */}
      {!loading && !error && activeTab === 'users' && (
        <div className="users-tab-container">
          {/* Search bar */}
          <div className="users-search-container">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="users-search-input"
            />
            {userSearchTerm && (
              <button
                className="users-search-clear"
                onClick={() => setUserSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Results count */}
          {userSearchTerm && (
            <div className="users-search-results">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Users table */}
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    {userSearchTerm ? 'No users found matching your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>
                      {u.firstName} {u.lastName}
                    </td>
                    <td>{u.role}</td>
                    <td>{u.status}</td>
                    <td>
                      <div className="admin-actions-container">
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
                        <button
                          className="admin-btn admin-btn-message"
                          onClick={() => handleMessageUser(u)}
                          title={`Message ${u.firstName} ${u.lastName}`}
                        >
                          Message
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>STATUS</th>
                <th>CURRENT TIER</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tutorUsers.map((u) => {
                const tutor = tutors[u.id]
                const currentTier = tutor?.verificationTier || 'TIER_1'

                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>
                      {u.firstName} {u.lastName}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`status-badge status-${u.status.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <span className={`tier-badge tier-${currentTier.toLowerCase()}`}>
                        {currentTier.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="tier-buttons">
                        <button
                          className={`btn-tier ${currentTier === 'TIER_1' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(u.id, 'TIER_1')}
                          disabled={currentTier === 'TIER_1'}
                        >
                          Tier 1
                        </button>
                        <button
                          className={`btn-tier ${currentTier === 'TIER_2' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(u.id, 'TIER_2')}
                          disabled={currentTier === 'TIER_2'}
                        >
                          Tier 2
                        </button>
                        <button
                          className={`btn-tier ${currentTier === 'TIER_3' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(u.id, 'TIER_3')}
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
        </div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="feedback-management-section">
          {feedbackStats && (
            <div className="feedback-stats-grid">
              <div className="feedback-stat-card">
                <div className="feedback-stat-value">{feedbackStats.total}</div>
                <div className="feedback-stat-label">Total</div>
              </div>
              <div className="feedback-stat-card">
                <div className="feedback-stat-value">{feedbackStats.unread}</div>
                <div className="feedback-stat-label">Unread</div>
              </div>
              <div className="feedback-stat-card">
                <div className="feedback-stat-value">{feedbackStats.pending}</div>
                <div className="feedback-stat-label">Pending</div>
              </div>
              <div className="feedback-stat-card">
                <div className="feedback-stat-value">{feedbackStats.inProgress}</div>
                <div className="feedback-stat-label">In Progress</div>
              </div>
              <div className="feedback-stat-card">
                <div className="feedback-stat-value">{feedbackStats.resolved}</div>
                <div className="feedback-stat-label">Resolved</div>
              </div>
            </div>
          )}

          <div className="feedback-filters-row">
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="feedback-filter-input"
            />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="feedback-filter-select"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={filters.isRead}
              onChange={(e) => handleFilterChange('isRead', e.target.value)}
              className="feedback-filter-select"
            >
              <option value="">All</option>
              <option value="true">Read</option>
              <option value="false">Unread</option>
            </select>
          </div>

          {feedbackLoading ? (
            <div className="feedback-loading-msg">Loading feedback...</div>
          ) : feedbackError ? (
            <div className="feedback-error-msg">{feedbackError}</div>
          ) : feedback.length === 0 ? (
            <div className="feedback-empty-msg">No feedback found</div>
          ) : (
            <>
              <div className="feedback-items-list">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className={`feedback-list-item ${!item.isRead ? 'feedback-item-unread' : ''}`}
                    onClick={() => openFeedbackModal(item)}
                  >
                    <div className="feedback-list-header">
                      <div className="feedback-item-info">
                        <span className="feedback-item-name">{item.name}</span>
                        <span className="feedback-item-email">{item.email}</span>
                      </div>
                      <div className="feedback-item-meta">
                        <span className={`feedback-status-badge feedback-status-${item.status.toLowerCase()}`}>
                          {formatStatusLabel(item.status)}
                        </span>
                        <span className="feedback-item-date">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="feedback-item-comment">
                      {item.comment.length > 120 ? `${item.comment.slice(0, 120)}...` : item.comment}
                    </div>
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="feedback-item-attachments">
                        📎 {item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="feedback-pagination">
                <button
                  className="feedback-btn-page"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
                <span className="feedback-page-info">
                  Page {currentPage + 1} of {totalPages || 1} ({totalItems} total)
                </span>
                <button
                  className="feedback-btn-page"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {showModal && selectedFeedback && (
            <div className="feedback-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="feedback-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="feedback-modal-header">
                  <h2>Feedback Details</h2>
                  <button className="feedback-modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <div className="feedback-modal-body">
                  <div className="feedback-detail-row">
                    <strong>Name:</strong> {selectedFeedback.name}
                  </div>
                  <div className="feedback-detail-row">
                    <strong>Email:</strong> {selectedFeedback.email}
                  </div>
                  <div className="feedback-detail-row">
                    <strong>Submitted:</strong> {formatDate(selectedFeedback.createdAt)}
                  </div>
                  <div className="feedback-detail-row">
                    <strong>Status:</strong>
                    <select
                      value={selectedFeedback.status}
                      onChange={(e) => handleUpdateStatus(selectedFeedback.id, e.target.value)}
                      className="feedback-status-select"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div className="feedback-detail-section">
                    <strong>Comment:</strong>
                    <p className="feedback-comment-text">{selectedFeedback.comment}</p>
                  </div>

                  {selectedFeedback.attachments && selectedFeedback.attachments.length > 0 && (
                    <div className="feedback-detail-section">
                      <strong>Attachments:</strong>
                      <div className="feedback-attachments-list">
                        {selectedFeedback.attachments.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="feedback-attachment-link"
                          >
                            Attachment {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="feedback-detail-section">
                    <strong>Admin Notes:</strong>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="feedback-admin-notes"
                      placeholder="Add internal notes here..."
                      rows="4"
                    />
                  </div>
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

      {/* SESSION TAB */}
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
                <div className="session-stat-value">{sessionStats.cancelled}</div>
                <div className="session-stat-label">Cancelled</div>
              </div>
            </div>
          )}

          <div className="session-filters-row">
            <input
              type="text"
              placeholder="Search sessions..."
              value={sessionFilters.search}
              onChange={(e) => handleSessionFilterChange('search', e.target.value)}
              className="session-filter-input"
            />
            <select
              value={sessionFilters.status}
              onChange={(e) => handleSessionFilterChange('status', e.target.value)}
              className="session-filter-select"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

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
                            <span className="session-payment-yes">✓ Paid</span>
                          ) : (
                            <span className="session-payment-no">No payment</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="session-btn-view"
                            onClick={() => openSessionModal(session.sessionId)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="session-pagination">
                <button
                  className="session-btn-page"
                  onClick={() => setSessionPage((p) => Math.max(0, p - 1))}
                  disabled={sessionPage === 0}
                >
                  Previous
                </button>
                <span className="session-page-info">
                  Page {sessionPage + 1} of {sessionTotalPages || 1}
                </span>
                <button
                  className="session-btn-page"
                  onClick={() => setSessionPage((p) => p + 1)}
                  disabled={sessionPage >= sessionTotalPages - 1}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {showSessionModal && selectedSession && (
            <div className="session-modal-overlay" onClick={() => setShowSessionModal(false)}>
              <div className="session-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="session-modal-header">
                  <h2>Session Details</h2>
                  <button className="session-modal-close" onClick={() => setShowSessionModal(false)}>✕</button>
                </div>

                <div className="session-modal-body">
                  <div className="session-detail-row">
                    <strong>Session ID:</strong> {selectedSession.sessionId}
                  </div>
                  <div className="session-detail-row">
                    <strong>Student:</strong> {selectedSession.studentName} ({selectedSession.studentEmail})
                  </div>
                  <div className="session-detail-row">
                    <strong>Tutor:</strong> {selectedSession.tutorName} ({selectedSession.tutorEmail})
                  </div>
                  <div className="session-detail-row">
                    <strong>Subject:</strong> {selectedSession.subject}
                  </div>
                  <div className="session-detail-row">
                    <strong>Start Time:</strong> {formatDateTime(selectedSession.requestedStart)}
                  </div>
                  <div className="session-detail-row">
                    <strong>End Time:</strong> {formatDateTime(selectedSession.requestedEnd)}
                  </div>
                  <div className="session-detail-row">
                    <strong>Status:</strong>
                    <span className={getSessionStatusBadgeClass(selectedSession.status)}>
                      {selectedSession.status}
                    </span>
                  </div>
                  {selectedSession.studentNote && (
                    <div className="session-detail-section">
                      <strong>Student Note:</strong>
                      <p>{selectedSession.studentNote}</p>
                    </div>
                  )}
                  {selectedSession.declineNote && (
                    <div className="session-detail-section">
                      <strong>Decline/Cancel Note:</strong>
                      <p>{selectedSession.declineNote}</p>
                    </div>
                  )}

                  {selectedSession.status === 'ACCEPTED' && (
                    <div className="session-cancel-section">
                      <label>Cancel Reason:</label>
                      <textarea
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        placeholder="Enter reason for cancellation..."
                        rows="3"
                        className="session-cancel-textarea"
                      />
                      <button className="session-btn-cancel-action" onClick={cancelSession}>
                        Cancel This Session
                      </button>
                    </div>
                  )}
                </div>

                <div className="session-modal-footer">
                  <button className="session-btn-close" onClick={() => setShowSessionModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPage