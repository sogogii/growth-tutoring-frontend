import { useState, useEffect, useRef } from 'react'
import './styles/ChatHistoryModal.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function ChatHistoryModal({ conversationId, currentUser, onClose }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatData, setChatData] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadChatHistory()
  }, [conversationId])

  useEffect(() => {
    // Auto-scroll to bottom when messages load
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatData])

  const loadChatHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `${API_BASE}/api/admin/chat/conversation/${conversationId}?adminUserId=${currentUser.userId}`
      )

      if (!res.ok) {
        throw new Error('Failed to load chat history')
      }

      const data = await res.json()
      setChatData(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load chat history')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDateSeparator = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  const renderMessages = () => {
    if (!chatData || !chatData.messages) return null

    let lastDate = null
    return chatData.messages.map((msg, index) => {
      const msgDate = new Date(msg.createdAt).toDateString()
      const showDateSeparator = msgDate !== lastDate
      lastDate = msgDate

      return (
        <div key={msg.id}>
          {showDateSeparator && (
            <div className="chat-date-separator">
              {getDateSeparator(msg.createdAt)}
            </div>
          )}
          <div className="chat-message-wrapper">
            <div className="chat-message-header">
              <strong>
                {msg.senderFirstName} {msg.senderLastName}
              </strong>
              <span className="chat-message-time">
                {formatTimestamp(msg.createdAt)}
              </span>
            </div>
            <div className="chat-message-bubble">
              {msg.content}
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="chat-history-modal-overlay" onClick={onClose}>
      <div className="chat-history-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-history-header">
          <div>
            <h2>Conversation History</h2>
            {chatData && (
              <p className="chat-participants">
                Between: <strong>{chatData.studentName}</strong> and{' '}
                <strong>{chatData.tutorName}</strong>
              </p>
            )}
          </div>
          <button className="chat-history-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="chat-history-body">
          {loading && (
            <div className="chat-history-loading">
              Loading conversation...
            </div>
          )}

          {error && (
            <div className="chat-history-error">
              {error}
            </div>
          )}

          {chatData && (
            <>
              <div className="chat-history-stats">
                <span>Total Messages: {chatData.totalMessages}</span>
                <span>Conversation ID: {chatData.conversationId}</span>
              </div>

              <div className="chat-messages-container">
                {chatData.messages.length === 0 ? (
                  <div className="chat-no-messages">
                    No messages in this conversation
                  </div>
                ) : (
                  renderMessages()
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>

        <div className="chat-history-footer">
          <button className="btn-close-chat" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatHistoryModal