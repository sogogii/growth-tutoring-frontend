import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './styles/MessagesPage.css'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatTime(isoString) {
  if (!isoString) return ''
  
  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) {
    if (diffMins < 1) return 'Just now'
    return `${diffMins}m`
  }
  
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()) {
    return 'Yesterday'
  }
  
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatDateLabel(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeLabel(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function MessagesPage({ currentUser, refreshUnreadCount }) {
  const { conversationId } = useParams()
  const navigate = useNavigate()

  // Conversations list state
  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [conversationsError, setConversationsError] = useState(null)

  // Active chat state
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState(null)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [activeConversation, setActiveConversation] = useState(null)

  const scrollContainerRef = useRef(null)
  const hasInitialScrolledRef = useRef(false)
  const shouldScrollToBottomRef = useRef(false)

  const scrollToBottom = () => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  // Load conversations list
  useEffect(() => {
    if (!currentUser) return

    const loadConversations = async () => {
      try {
        setConversationsLoading(true)
        setConversationsError(null)

        const res = await fetch(
          `${API_BASE}/api/chat/conversations?userId=${currentUser.userId}`
        )

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to load conversations')
        }

        const data = await res.json()
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
        setConversationsError(err.message || 'Failed to load conversations')
      } finally {
        setConversationsLoading(false)
      }
    }

    loadConversations()
    const interval = setInterval(loadConversations, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [currentUser])

  // Load messages for active conversation
  useEffect(() => {
    if (!conversationId || !currentUser) {
      setMessages([])
      setActiveConversation(null)
      return
    }

    // Find active conversation details
    const conv = conversations.find(c => c.id === parseInt(conversationId))
    setActiveConversation(conv || null)

    let isCancelled = false

    const fetchMessages = async () => {
      try {
        if (isCancelled) return
        setMessagesError(null)

        const res = await fetch(
          `${API_BASE}/api/chat/conversations/${conversationId}/messages`
        )

        if (!res.ok) {
          const textRes = await res.text()
          throw new Error(textRes || 'Failed to load messages')
        }

        const data = await res.json()
        if (isCancelled) return

        setMessages((prev) => {
          if (
            prev.length === data.length &&
            prev[prev.length - 1]?.id === data[data.length - 1]?.id
          ) {
            return prev
          }
          return data
        })
      } catch (err) {
        console.error(err)
        if (!isCancelled) {
          setMessagesError(err.message || 'Failed to load messages')
        }
      } finally {
        if (!isCancelled) {
          setMessagesLoading(false)
        }
      }
    }

    setMessagesLoading(true)
    fetchMessages()
    const id = setInterval(fetchMessages, 4000)

    return () => {
      isCancelled = true
      clearInterval(id)
    }
  }, [conversationId, currentUser, conversations])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length === 0) return

    if (!hasInitialScrolledRef.current) {
      scrollToBottom()
      hasInitialScrolledRef.current = true
      return
    }

    if (shouldScrollToBottomRef.current) {
      scrollToBottom()
      shouldScrollToBottomRef.current = false
    }
  }, [messages])

  // Mark messages as read
  useEffect(() => {
    if (!currentUser || !conversationId || messages.length === 0) return

    const markRead = async () => {
      try {
        await fetch(
          `${API_BASE}/api/chat/conversations/${conversationId}/read?userId=${currentUser.userId}`,
          { method: 'POST' }
        )

        if (typeof refreshUnreadCount === 'function') {
          refreshUnreadCount()
        }
      } catch (err) {
        console.error('Failed to mark messages as read', err)
      }
    }

    markRead()
  }, [conversationId, currentUser, messages.length, refreshUnreadCount])

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === parseInt(conversationId))
      if (conv) {
        setActiveConversation({
          id: conv.id,
          otherName: conv.otherName,
          otherUserId: conv.otherUserId,
          otherProfileImageUrl: conv.otherProfileImageUrl,
          otherUserDeactivated: conv.otherUserDeactivated || false  // ← ADD THIS
        })
      }
    }
  }, [conversationId, conversations])

  const sendMessage = async () => {
    if (!text.trim() || sending || !conversationId) return

    try {
      setSending(true)
      setMessagesError(null)

      const res = await fetch(
        `${API_BASE}/api/chat/conversations/${conversationId}/messages?senderUserId=${currentUser.userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        }
      )

      if (!res.ok) {
        const textRes = await res.text()
        throw new Error(textRes || 'Failed to send message')
      }

      const newMsg = await res.json()
      setMessages((prev) => [...prev, newMsg])
      setText('')

      shouldScrollToBottomRef.current = true
    } catch (err) {
      console.error(err)
      setMessagesError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    await sendMessage()
  }

  const handleSelectConversation = (convId) => {
    hasInitialScrolledRef.current = false
    navigate(`/messages/${convId}`)
  }

  const getDateKey = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toISOString().slice(0, 10)
  }

  if (!currentUser) {
    return (
      <div className="messages-page">
        <div className="messages-empty-state">
          <p>Please sign in to view your messages.</p>
        </div>
      </div>
    )
  }

  let lastDateKey = null

  return (
    <div className={`messages-page ${conversationId ? 'has-active-chat' : ''}`}>
      {/* LEFT SIDEBAR - Conversations List */}
      <aside className="conversations-sidebar">
        <div className="conversations-header">
          <h2>Messages</h2>
        </div>

        <div className="conversations-list">
          {conversationsLoading && conversations.length === 0 && (
            <div className="conversations-loading">Loading...</div>
          )}

          {conversationsError && (
            <div className="conversations-error">{conversationsError}</div>
          )}

          {!conversationsLoading && conversations.length === 0 && (
            <div className="conversations-empty">
              No conversations yet
            </div>
          )}

          {conversations
          .filter(conv => conv.lastMessageCreatedAt != null) 
          .map((conv) => {
            const hasMessages = !!conv.lastMessageCreatedAt
            const lastText = hasMessages ? conv.lastMessageContent || '' : 'No messages yet'
            const timeLabel = hasMessages ? formatTime(conv.lastMessageCreatedAt) : ''
            const hasUnread = conv.unreadCount > 0
            const isActive = conv.id === parseInt(conversationId)
            const hasProfileImage = !!conv.otherProfileImageUrl

            return (
              <button
                key={conv.id}
                className={`conversation-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="conversation-avatar">
                  {hasProfileImage ? (
                    <img src={conv.otherProfileImageUrl} alt={conv.otherName} />
                  ) : (
                    <div className="avatar-fallback">
                      {getInitials(conv.otherName || 'Conversation')}
                    </div>
                  )}
                </div>

                <div className="conversation-content">
                  <div className="conversation-top">
                    <span className="conversation-name">
                      {conv.otherName || 'Conversation'}
                    </span>
                    {timeLabel && (
                      <span className="conversation-time">{timeLabel}</span>
                    )}
                  </div>
                  <div className="conversation-preview">
                    {lastText.length > 40 ? `${lastText.slice(0, 40)}…` : lastText}
                  </div>
                </div>

                {hasUnread && (
                  <div className="unread-badge">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </aside>

      {/* RIGHT MAIN AREA - Active Chat */}
      <main className="chat-main">
        {!conversationId ? (
          <div className="chat-empty-state">
            <div className="empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div 
                className="chat-header-content"
                onClick={() => {
                  // Only allow navigation to tutor profiles (students can't have profiles viewed)
                  if (activeConversation?.otherUserId && currentUser?.role === 'STUDENT') {
                    navigate(`/tutors/${activeConversation.otherUserId}`)
                  }
                }}
                style={{ 
                  cursor: (activeConversation?.otherUserId && currentUser?.role === 'STUDENT') 
                    ? 'pointer' 
                    : 'default' 
                }}
              >
                {activeConversation?.otherProfileImageUrl ? (
                  <img 
                    src={activeConversation.otherProfileImageUrl} 
                    alt={activeConversation.otherName}
                    className="chat-header-avatar"
                  />
                ) : (
                  <div className="chat-header-avatar avatar-fallback">
                    {getInitials(activeConversation?.otherName || '')}
                  </div>
                )}
                <h2>{activeConversation?.otherName || 'Chat'}</h2>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollContainerRef} className="messages-area">
              {messagesLoading && messages.length === 0 && (
                <div className="messages-loading">Loading messages...</div>
              )}

              {messagesError && (
                <div className="messages-error">{messagesError}</div>
              )}

              {!messagesLoading && messages.length === 0 && (
                <div className="messages-empty">
                  No messages yet. Say hello to start the conversation!
                </div>
              )}

              {messages.map((msg) => {
                const isMine = msg.senderUserId === currentUser.userId
                const ts = msg.createdAt
                const dateKey = getDateKey(ts)
                const showDateDivider = dateKey && dateKey !== lastDateKey
                if (dateKey) lastDateKey = dateKey

                const isOtherUserDeactivated = activeConversation?.otherUserDeactivated || false
                
                const displayName = isMine
                  ? 'You'
                  : isOtherUserDeactivated 
                    ? 'Deactivated User'  
                    : `${msg.senderFirstName || ''} ${msg.senderLastName || ''}`.trim() || 'User'
                
                const initials = isMine
                  ? getInitials(`${currentUser.firstName} ${currentUser.lastName}`)
                  : isOtherUserDeactivated
                    ? 'DU' 
                    : getInitials(displayName)

                const avatarUrl = isMine
                  ? currentUser.profileImageUrl
                  : isOtherUserDeactivated
                    ? null 
                    : msg.senderAvatarUrl

                const canClickProfile = !isMine && !isOtherUserDeactivated && activeConversation?.otherUserId && currentUser?.role === 'STUDENT'

                return (
                  <div key={msg.id}>
                    {showDateDivider && (
                      <div className="date-divider">
                        <span>{formatDateLabel(ts)}</span>
                      </div>
                    )}

                    <div className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && (
                        <div 
                          className="message-avatar"
                          onClick={() => {
                            if (canClickProfile) {
                              navigate(`/tutors/${activeConversation.otherUserId}`)
                            }
                          }}
                          style={{ 
                            cursor: canClickProfile ? 'pointer' : 'default' 
                          }}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} />
                          ) : (
                            <div className="avatar-fallback">{initials}</div>
                          )}
                        </div>
                      )}

                      <div className="message-bubble-wrapper">
                        {!isMine && (
                          <div 
                            className="message-sender-name"
                            onClick={() => {
                              if (canClickProfile) {
                                navigate(`/tutors/${activeConversation.otherUserId}`)
                              }
                            }}
                            style={{ 
                              cursor: canClickProfile ? 'pointer' : 'default' 
                            }}
                          >
                            {displayName}
                          </div>
                        )}
                        <div className="message-bubble">
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">
                            {formatTimeLabel(ts)}
                          </div>
                        </div>
                      </div>

                      {isMine && (
                        <div className="message-avatar">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="You" />
                          ) : (
                            <div className="avatar-fallback">{initials}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="message-input-area">
              {activeConversation?.otherUserDeactivated ? (
                <div className="message-input-disabled">
                  <p>You cannot send messages to this user.</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={1}
                    placeholder="Type a message..."
                    className="message-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="send-button"
                  >
                    {sending ? '...' : '➤'}
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  )
}

export default MessagesPage