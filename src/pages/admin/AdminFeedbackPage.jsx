import { useState, useEffect } from 'react'
import './styles/AdminFeedbackPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    isRead: '',
    search: ''
  })
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    loadFeedback()
    loadStats()
  }, [currentPage, filters])

  const loadFeedback = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: currentPage,
        size: 20
      })

      if (filters.status) params.append('status', filters.status)
      if (filters.isRead !== '') params.append('isRead', filters.isRead)
      if (filters.search) params.append('search', filters.search)

      const res = await fetch(`${API_BASE_URL}/api/admin/feedback?${params}`)
      
      if (!res.ok) {
        throw new Error('Failed to load feedback')
      }

      const data = await res.json()
      setFeedback(data.feedback || [])
      setTotalPages(data.totalPages || 0)
      setTotalItems(data.totalItems || 0)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
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
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead })
      })

      if (res.ok) {
        loadFeedback()
        loadStats()
      }
    } catch (err) {
      console.error('Failed to update read status:', err)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        loadFeedback()
        loadStats()
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
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${selectedFeedback.id}/notes`, {
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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        loadFeedback()
        loadStats()
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
    if (!item.isRead) {
      handleMarkAsRead(item.id, true)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'NEW': return 'status-badge status-new'
      case 'IN_PROGRESS': return 'status-badge status-in-progress'
      case 'RESOLVED': return 'status-badge status-resolved'
      case 'ARCHIVED': return 'status-badge status-archived'
      default: return 'status-badge'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'NEW': return 'New'
      case 'IN_PROGRESS': return 'In Progress'
      case 'RESOLVED': return 'Resolved'
      case 'ARCHIVED': return 'Archived'
      default: return status
    }
  }

  return (
    <div className="admin-feedback-page">
      <div className="admin-feedback-header">
        <h1>Feedback Management</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="feedback-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.unread}</div>
            <div className="stat-label">Unread</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.new}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="feedback-filters">
        <input
          type="text"
          className="filter-input"
          placeholder="Search by name, email, or comment..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          className="filter-select"
          value={filters.isRead}
          onChange={(e) => handleFilterChange('isRead', e.target.value)}
        >
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {/* Feedback List */}
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="empty-state">No feedback found</div>
      ) : (
        <>
          <div className="feedback-list">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`feedback-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => openModal(item)}
              >
                <div className="feedback-item-header">
                  <div className="feedback-item-user">
                    <strong>{item.name}</strong>
                    <span className="feedback-item-email">{item.email}</span>
                  </div>
                  <div className="feedback-item-meta">
                    <span className={getStatusBadgeClass(item.status)}>
                      {getStatusLabel(item.status)}
                    </span>
                    {!item.isRead && <span className="unread-badge">●</span>}
                  </div>
                </div>
                <div className="feedback-item-comment">
                  {item.comment.length > 150
                    ? item.comment.substring(0, 150) + '...'
                    : item.comment}
                </div>
                <div className="feedback-item-footer">
                  <span className="feedback-item-date">
                    {formatDate(item.createdAt)}
                  </span>
                  {item.attachments && item.attachments.length > 0 && (
                    <span className="feedback-item-attachments">
                      📎 {item.attachments.length} file(s)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage + 1} of {totalPages} ({totalItems} total)
            </span>
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <label>From:</label>
                <div>
                  <strong>{selectedFeedback.name}</strong>
                  <br />
                  <a href={`mailto:${selectedFeedback.email}`}>
                    {selectedFeedback.email}
                  </a>
                </div>
              </div>

              <div className="modal-section">
                <label>Date:</label>
                <div>{formatDate(selectedFeedback.createdAt)}</div>
              </div>

              <div className="modal-section">
                <label>Status:</label>
                <select
                  className="status-select"
                  value={selectedFeedback.status}
                  onChange={(e) => handleStatusChange(selectedFeedback.id, e.target.value)}
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="modal-section">
                <label>Feedback:</label>
                <div className="feedback-comment">{selectedFeedback.comment}</div>
              </div>

              {selectedFeedback.attachments && selectedFeedback.attachments.length > 0 && (
                <div className="modal-section">
                  <label>Attachments:</label>
                  <div className="attachments-list">
                    {selectedFeedback.attachments.map((attachment) => (
                      <div key={attachment.id} className="attachment-item">
                        <span>{attachment.fileName}</span>
                        <span className="attachment-size">
                          {formatFileSize(attachment.fileSize)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-section">
                <label>Admin Notes:</label>
                <textarea
                  className="admin-notes-textarea"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add internal notes..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-delete" onClick={() => handleDelete(selectedFeedback.id)}>
                Delete
              </button>
              <div className="modal-footer-right">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button className="btn-primary" onClick={handleSaveNotes}>
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFeedbackPage