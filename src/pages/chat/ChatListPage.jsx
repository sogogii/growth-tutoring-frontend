import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/ChatListPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Better time formatting
function formatTime(isoString) {
  if (!isoString) return ''
  
  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  // Less than 1 hour ago - show minutes
  if (diffMins < 60) {
    if (diffMins < 1) return 'Just now'
    return `${diffMins}m ago`
  }
  
  // Today - show time
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  
  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()) {
    return 'Yesterday'
  }
  
  // This week - show day name
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  
  // Older - show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function ChatListPage({ currentUser }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return

    const loadConversations = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `${API_BASE}/api/chat/conversations?userId=${currentUser.userId}`
        )

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to load conversations')
        }

        const data = await res.json()

        // Sort by most recent message
        const sorted = [...data].sort((a, b) => {
          const ta = a.lastMessageCreatedAt
          const tb = b.lastMessageCreatedAt
          if (!ta && !tb) return 0
          if (!ta) return 1
          if (!tb) return -1
          return new Date(tb) - new Date(ta)
        })

        setConversations(sorted)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load conversations')
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="chat-list-page">
        <h1>Messages</h1>
        <p className="chat-list-empty">Please sign in to view your messages.</p>
      </div>
    )
  }

  return (
    <div className="chat-list-page">
      <h1>Messages</h1>

      {loading && (
        <p className="chat-list-empty">Loading conversations…</p>
      )}
      {error && <p className="chat-list-error">{error}</p>}

      {!loading && !error && conversations.length === 0 && (
        <p className="chat-list-empty">
          You don't have any conversations yet.
        </p>
      )}

      {!loading && !error && conversations.length > 0 && (
        <section className="chat-list-section">
          <div className="chat-list">
            {conversations.map((conv) => {
              const hasMessages = !!conv.lastMessageCreatedAt
              const lastText = hasMessages
                ? conv.lastMessageContent || ''
                : 'No messages yet'
              const timeLabel = hasMessages
                ? formatTime(conv.lastMessageCreatedAt)
                : ''
              
              const hasUnread = conv.unreadCount > 0
              const hasProfileImage = !!conv.otherProfileImageUrl

              return (
                <button
                  key={conv.id}
                  type="button"
                  className={`chat-card ${hasUnread ? 'has-unread' : ''}`}
                  onClick={() =>
                    navigate(`/chat/${conv.id}`, {
                      state: { otherName: conv.otherName },
                    })
                  }
                >
                  <div className="chat-card-content">
                    <div className="chat-card-avatar">
                      {hasProfileImage ? (
                        <img 
                          src={conv.otherProfileImageUrl} 
                          alt={conv.otherName}
                          className="chat-card-avatar-img"
                        />
                      ) : (
                        <span className="chat-card-avatar-fallback">
                          {getInitials(conv.otherName || 'Conversation')}
                        </span>
                      )}
                    </div>

                    <div className="chat-card-main">
                      <div className="chat-card-top">
                        <span className="chat-card-name">
                          {conv.otherName || 'Conversation'}
                        </span>
                        {timeLabel && (
                          <span className="chat-card-time">{timeLabel}</span>
                        )}
                      </div>

                      <div className="chat-card-subtitle">
                        {lastText.length > 70 ? `${lastText.slice(0, 70)}…` : lastText}
                      </div>
                    </div>
                  </div>

                  {hasUnread && (
                    <span className="chat-card-unread">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default ChatListPage