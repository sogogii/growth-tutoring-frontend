import { useState, useEffect } from 'react'
import './styles/AdminFlaggedMessagesPage.css'
import ChatHistoryModal from '../../components/ChatHistoryModal'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function AdminFlaggedMessagesPage({ currentUser }) {
  const [loading, setLoading] = useState(true)
  const [flaggedMessages, setFlaggedMessages] = useState([])
  const [showReviewed, setShowReviewed] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [actionTaken, setActionTaken] = useState('')
  const [unreviewedCount, setUnreviewedCount] = useState(0)

  // Chat History Modal State
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState(null)

  useEffect(() => {
    if (currentUser) {
      loadFlaggedMessages()
      loadCount()
    }
  }, [currentUser, showReviewed])

  const loadFlaggedMessages = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const url = `${API_BASE}/api/admin/flagged-messages?adminUserId=${currentUser.userId}&reviewedOnly=${showReviewed}`
      
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error('Failed to load flagged messages')
      }
      
      const data = await res.json()
      setFlaggedMessages(data)
    } catch (err) {
      console.error('Error loading flagged messages:', err)
      alert('Failed to load flagged messages: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCount = async () => {
    if (!currentUser) return

    try {
      const url = `${API_BASE}/api/admin/flagged-messages/count?adminUserId=${currentUser.userId}`
      
      const res = await fetch(url)
      
      if (!res.ok) return
      
      const data = await res.json()
      setUnreviewedCount(data.unreviewed || 0)
    } catch (err) {
      console.error('Error loading count:', err)
    }
  }

  const handleReview = async (messageId) => {
    if (!actionTaken) {
      alert('Please select an action taken')
      return
    }

    try {
      const url = `${API_BASE}/api/admin/flagged-messages/${messageId}/review?adminUserId=${currentUser.userId}`
      
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionTaken })
      })

      if (!res.ok) throw new Error('Failed to review message')

      alert('Message reviewed successfully')
      setSelectedMessage(null)
      setActionTaken('')
      loadFlaggedMessages()
      loadCount()
    } catch (err) {
      console.error('Error reviewing message:', err)
      alert('Failed to review message: ' + err.message)
    }
  }

  const handleViewChatHistory = (conversationId) => {
    setSelectedConversationId(conversationId)
    setShowChatHistory(true)
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

  if (!currentUser) {
    return <div className="admin-flagged-messages-page">Loading...</div>
  }

  return (
    <div className="admin-flagged-messages-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Flagged Messages</h1>
        <p>Monitor messages with potentially prohibited contact information</p>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-label">Unreviewed Messages</div>
          <div className="stat-number">{unreviewedCount}</div>
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

                <div className="message-actions">
                  {/* View Chat History Button */}
                  <button
                    className="btn-view-history"
                    onClick={() => handleViewChatHistory(msg.conversationId)}
                  >
                    View Chat History
                  </button>

                  {!msg.reviewed ? (
                    <button
                      className="btn-review"
                      onClick={() => {
                        setSelectedMessage(msg)
                        setActionTaken('')
                      }}
                    >
                      Review
                    </button>
                  ) : (
                    <div className="reviewed-info">
                      <span className="reviewed-badge">Reviewed</span>
                      <span className="action-taken">Action: {msg.actionTaken}</span>
                      <span className="reviewed-date">
                        {formatDate(msg.reviewedAt)}
                      </span>
                    </div>
                  )}
                </div>
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
              <label>Detected Issues:</label>
              <div className="detected-types">
                {getDetectedTypesBadge(selectedMessage.detectedTypes)}
              </div>
            </div>

            <div className="modal-section">
              <label>Message Content:</label>
              <div className="message-display">{selectedMessage.messageContent}</div>
            </div>

            <div className="modal-section">
              <label>Action Taken:</label>
              <select
                className="action-select"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              >
                <option value="">-- Select Action --</option>
                <option value="NO_ACTION">No Action Required</option>
                <option value="WARNING_SENT">Warning Sent to User</option>
                <option value="USER_SUSPENDED">User Suspended</option>
                <option value="MESSAGE_DELETED">Message Deleted</option>
                <option value="UNDER_REVIEW">Under Further Review</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedMessage(null)}>
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={() => handleReview(selectedMessage.id)}
                disabled={!actionTaken}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      {showChatHistory && selectedConversationId && (
        <ChatHistoryModal
          conversationId={selectedConversationId}
          currentUser={currentUser}
          onClose={() => {
            setShowChatHistory(false)
            setSelectedConversationId(null)
          }}
        />
      )}
    </div>
  )
}

export default AdminFlaggedMessagesPage