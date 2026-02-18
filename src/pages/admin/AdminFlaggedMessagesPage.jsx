import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/AdminFlaggedMessagesPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function AdminFlaggedMessagesPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [flaggedMessages, setFlaggedMessages] = useState([])
  const [showReviewed, setShowReviewed] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [actionTaken, setActionTaken] = useState('')
  const [unreviewedCount, setUnreviewedCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const user = JSON.parse(stored)
      if (user.role !== 'ADMIN') {
        navigate('/')
        return
      }
      setCurrentUser(user)
    } else {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (currentUser) {
      loadFlaggedMessages()
      loadCount()
    }
  }, [currentUser, showReviewed])

  const loadFlaggedMessages = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${API_BASE}/api/admin/flagged-messages?adminUserId=${currentUser.userId}&reviewedOnly=${showReviewed}`
      )
      if (!res.ok) throw new Error('Failed to load flagged messages')
      const data = await res.json()
      setFlaggedMessages(data)
    } catch (err) {
      console.error(err)
      alert('Failed to load flagged messages')
    } finally {
      setLoading(false)
    }
  }

  const loadCount = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/flagged-messages/count?adminUserId=${currentUser.userId}`
      )
      if (!res.ok) throw new Error('Failed to load count')
      const data = await res.json()
      setUnreviewedCount(data.unreviewed)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReview = async (messageId) => {
    if (!actionTaken) {
      alert('Please select an action taken')
      return
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/flagged-messages/${messageId}/review?adminUserId=${currentUser.userId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionTaken })
        }
      )

      if (!res.ok) throw new Error('Failed to review message')

      alert('Message reviewed successfully')
      setSelectedMessage(null)
      setActionTaken('')
      loadFlaggedMessages()
      loadCount()
    } catch (err) {
      console.error(err)
      alert('Failed to review message')
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getDetectedTypesBadge = (types) => {
    const typeArray = types.split(', ')
    return typeArray.map((type, idx) => (
      <span key={idx} className="detected-type-badge">
        {type}
      </span>
    ))
  }

  if (!currentUser) return null

  return (
    <div className="admin-flagged-messages-page">
      <div className="admin-flagged-header">
        <div>
          <h1>Flagged Messages</h1>
          <p>Monitor messages with potentially prohibited contact information</p>
        </div>
        <div className="admin-flagged-stats">
          <div className="stat-card">
            <div className="stat-number">{unreviewedCount}</div>
            <div className="stat-label">Unreviewed</div>
          </div>
        </div>
      </div>

      <div className="admin-flagged-controls">
        <button
          className={`filter-btn ${!showReviewed ? 'active' : ''}`}
          onClick={() => setShowReviewed(false)}
        >
          Unreviewed ({unreviewedCount})
        </button>
        <button
          className={`filter-btn ${showReviewed ? 'active' : ''}`}
          onClick={() => setShowReviewed(true)}
        >
          Reviewed
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : flaggedMessages.length === 0 ? (
        <div className="empty-state">
          <p>No {showReviewed ? 'reviewed' : 'unreviewed'} flagged messages</p>
        </div>
      ) : (
        <div className="flagged-messages-list">
          {flaggedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flagged-message-card ${msg.reviewed ? 'reviewed' : ''}`}
            >
              <div className="flagged-message-header">
                <div>
                  <strong>User ID: {msg.senderUserId}</strong>
                  <span className="flagged-date">{formatDate(msg.flaggedAt)}</span>
                </div>
                <div className="detected-types">
                  {getDetectedTypesBadge(msg.detectedTypes)}
                </div>
              </div>

              <div className="flagged-message-content">
                <p className="message-label">Message Content:</p>
                <div className="message-text">{msg.messageContent}</div>
              </div>

              <div className="flagged-message-footer">
                <div className="message-meta">
                  <span>Conversation ID: {msg.conversationId}</span>
                  <span>Message ID: {msg.messageId}</span>
                </div>

                {!msg.reviewed ? (
                  <button
                    className="btn-review"
                    onClick={() => setSelectedMessage(msg)}
                  >
                    Review
                  </button>
                ) : (
                  <div className="reviewed-info">
                    <span className="reviewed-badge">✓ Reviewed</span>
                    {msg.actionTaken && (
                      <span className="action-taken">Action: {msg.actionTaken}</span>
                    )}
                    {msg.reviewedAt && (
                      <span className="reviewed-date">
                        {formatDate(msg.reviewedAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedMessage && (
        <div className="admin-flagged-modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Review Flagged Message</h2>

            <div className="modal-section">
              <label>Detected:</label>
              <div className="detected-types">
                {getDetectedTypesBadge(selectedMessage.detectedTypes)}
              </div>
            </div>

            <div className="modal-section">
              <label>Message:</label>
              <div className="message-display">{selectedMessage.messageContent}</div>
            </div>

            <div className="modal-section">
              <label>Action Taken:</label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="action-select"
              >
                <option value="">-- Select Action --</option>
                <option value="NONE">No Action Needed</option>
                <option value="WARNING_SENT">Warning Sent to User</option>
                <option value="USER_CONTACTED">User Contacted</option>
                <option value="USER_SUSPENDED">User Suspended</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setSelectedMessage(null)
                  setActionTaken('')
                }}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={() => handleReview(selectedMessage.id)}
                disabled={!actionTaken}
              >
                Mark as Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFlaggedMessagesPage