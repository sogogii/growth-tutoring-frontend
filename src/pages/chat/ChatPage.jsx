import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import './styles/ChatPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function ChatPage({ currentUser, refreshUnreadCount }) {
  const { conversationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const otherNameFromList = location.state?.otherName
  const otherUserIdFromList = location.state?.otherUserId
  const headerTitle = otherNameFromList || 'Chat'

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [otherUserId, setOtherUserId] = useState(otherUserIdFromList || null)

  const scrollContainerRef = useRef(null)
  const hasInitialScrolledRef = useRef(false)
  const shouldScrollToBottomRef = useRef(false)

  const scrollToBottom = () => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  const getTimestamp = (msg) =>
    msg.createdAt || msg.sentAt || msg.timestamp || null

  const formatDateLabel = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDateKey = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toISOString().slice(0, 10)
  }

  const formatTimeLabel = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getSenderInfo = (msg, isMine) => {
    if (isMine) {
      const first = currentUser?.firstName || ''
      const last = currentUser?.lastName || ''
      const displayName =
        (first || last) ? `${first} ${last}`.trim() : 'You'
      const initials = (first || last ? `${first} ${last}` : 'You')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
      const avatarUrl = currentUser?.avatarUrl || null
      return { displayName, initials, avatarUrl }
    }

    const first = msg.senderFirstName || ''
    const last = msg.senderLastName || ''
    const fallbackName = msg.senderName || 'Tutor'
    const displayName =
      (first || last) ? `${first} ${last}`.trim() : fallbackName

    const initials = (displayName || fallbackName)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')

    const avatarUrl = msg.senderAvatarUrl || null

    return { displayName, initials, avatarUrl }
  }

  // Handle click on avatar/name to go to profile
  const handleProfileClick = () => {
    if (!otherUserId) return
    navigate(`/tutors/${otherUserId}`)
  }

  // fetch messages + poll
  useEffect(() => {
    if (!conversationId) return

    let isCancelled = false

    const fetchMessages = async () => {
      try {
        if (isCancelled) return
        setError(null)

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

        // Extract the other user's ID from the first message (if we don't have it)
        if (!otherUserId && data.length > 0 && currentUser) {
          const firstOtherMessage = data.find(
            (msg) => msg.senderUserId !== currentUser.userId
          )
          if (firstOtherMessage) {
            setOtherUserId(firstOtherMessage.senderUserId)
          }
        }
      } catch (err) {
        console.error(err)
        if (!isCancelled) {
          setError(err.message || 'Failed to load messages')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchMessages()
    const id = setInterval(fetchMessages, 4000)

    return () => {
      isCancelled = true
      clearInterval(id)
    }
  }, [conversationId, currentUser, otherUserId])

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

  // mark read
  useEffect(() => {
    if (!currentUser || !conversationId) return
    if (messages.length === 0) return

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

  if (!currentUser) {
    return (
      <div className="chat-page">
        <h1>{headerTitle}</h1>
        <p className="chat-info">Please sign in to view this chat.</p>
      </div>
    )
  }

  const sendMessage = async () => {
    if (!text.trim() || sending) return

    try {
      setSending(true)
      setError(null)

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
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    await sendMessage()
  }

  let lastDateKey = null

  return (
    <div className="chat-page">
      {/* MAKE HEADER TITLE CLICKABLE */}
      <h1 
        onClick={handleProfileClick}
        style={{ 
          cursor: otherUserId ? 'pointer' : 'default',
          display: 'inline-block'
        }}
        className="chat-page-title-clickable"
      >
        {headerTitle}
      </h1>

      {error && <p className="chat-error">{error}</p>}

      <section className="chat-section">
        <div ref={scrollContainerRef} className="chat-messages">
          {loading && <p className="chat-info">Loading messages…</p>}

          {!loading && messages.length === 0 && (
            <p className="chat-info">
              No messages yet. Say hello to start the conversation!
            </p>
          )}

          {!loading &&
            messages.length > 0 &&
            messages.map((msg) => {
              const isMine = msg.senderUserId === currentUser.userId
              const ts = getTimestamp(msg)
              const dateKey = getDateKey(ts)
              const showDateDivider = dateKey && dateKey !== lastDateKey
              if (dateKey) lastDateKey = dateKey

              const { displayName, initials, avatarUrl } = getSenderInfo(
                msg,
                isMine
              )

              return (
                <div key={msg.id}>
                  {showDateDivider && (
                    <div className="chat-day-divider">
                      <span>{formatDateLabel(ts)}</span>
                    </div>
                  )}

                  <div
                    className={`chat-message-row ${
                      isMine ? 'mine' : 'theirs'
                    }`}
                  >
                    {!isMine && (
                      <div 
                        className="chat-avatar"
                        onClick={handleProfileClick}
                        style={{ cursor: 'pointer' }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={`${displayName}'s avatar`}
                          />
                        ) : (
                          <div className="chat-avatar-fallback">
                            {initials || '?'}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="chat-bubble-wrapper">
                      {!isMine && (
                        <div 
                          className="chat-sender-name"
                          onClick={handleProfileClick}
                          style={{ cursor: 'pointer' }}
                        >
                          {displayName}
                        </div>
                      )}
                      <div className="chat-bubble">
                        <div className="chat-bubble-text">
                          {msg.content}
                        </div>
                        <div className="chat-meta">
                          <span className="chat-time">
                            {formatTimeLabel(ts)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isMine && (
                      <div className="chat-avatar mine-avatar">
                        {currentUser?.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt="Your avatar"
                          />
                        ) : (
                          <div className="chat-avatar-fallback">
                            {getSenderInfo(msg, true).initials || 'Y'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        <form onSubmit={handleSend} className="chat-input-row">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Type your message…"
            className="chat-input"
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
            className="chat-send-btn btn btn-primary"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ChatPage