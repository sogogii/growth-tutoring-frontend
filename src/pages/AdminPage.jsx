import { useEffect, useState } from 'react'
import './styles/AdminPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function AdminPage({ currentUser }) {
  // ORIGINAL STATE - NOT CHANGED
  const [users, setUsers] = useState([])
  const [tutors, setTutors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('users') // 'users', 'tutors', or 'feedback'

  // NEW STATE - ONLY FOR FEEDBACK
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

  const adminUserId = currentUser?.userId

  // ORIGINAL useEffect - NOT CHANGED
  useEffect(() => {
    if (!adminUserId) return

    const fetchData = async () => {
      try {
        setError(null)
        setLoading(true)

        // Fetch users
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
          // Create a map of userId -> tutor data
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

  // NEW useEffect - ONLY FOR FEEDBACK
  useEffect(() => {
    if (activeTab === 'feedback') {
      loadFeedback()
      loadFeedbackStats()
    }
  }, [activeTab, currentPage, filters])

  // NEW FUNCTIONS - ONLY FOR FEEDBACK
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

  // ORIGINAL FUNCTIONS - NOT CHANGED
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

      // Update the tutors map
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

  // Filter tutors from users
  const tutorUsers = users.filter(u => u.role === 'TUTOR')

  return (
    <div className="my-profile-page">
      <h1>Admin Dashboard</h1>

      {/* Tab Navigation - ONLY ADDED FEEDBACK TAB */}
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
      </div>

      {/* ORIGINAL USERS TAB - NOT CHANGED */}
      {loading && activeTab !== 'feedback' && <p className="profile-value">Loading...</p>}
      {error && <p className="auth-error">{error}</p>}

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
                    className="btn btn-secondary"
                    onClick={() => updateStatus(u.id, 'ACTIVE')}
                  >
                    Activate
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => updateStatus(u.id, 'SUSPENDED')}
                  >
                    Suspend
                  </button>
                  <button
                    className="btn btn-danger"
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

      {/* ORIGINAL TUTORS TAB - NOT CHANGED */}
      {!loading && !error && activeTab === 'tutors' && (
        <div className="tutors-verification-section">
          <h2>Manage Tutor Verification Tiers</h2>
          <p className="section-description">
            Update verification tiers for tutors. Higher tiers indicate greater verification levels.
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
                      <span className={`status-badge status-${tutor.status.toLowerCase()}`}>
                        {tutor.status}
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
                          onClick={() => updateVerificationTier(tutor.id, 'TIER_1')}
                          disabled={currentTier === 'TIER_1'}
                        >
                          Tier 1
                        </button>
                        <button
                          className={`btn-tier ${currentTier === 'TIER_2' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(tutor.id, 'TIER_2')}
                          disabled={currentTier === 'TIER_2'}
                        >
                          Tier 2
                        </button>
                        <button
                          className={`btn-tier ${currentTier === 'TIER_3' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(tutor.id, 'TIER_3')}
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

      {/* NEW FEEDBACK TAB - ONLY THIS IS NEW */}
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
    </div>
  )
}

export default AdminPage