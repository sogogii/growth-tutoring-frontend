import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import './styles/ChatPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function ChatPage({ currentUser }) {
  const { conversationId } = useParams()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // fetch messages + poll
  useEffect(() => {
    if (!conversationId) return

    let isCancelled = false

    const fetchMessages = async () => {
      try {
        if (isCancelled) return
        setLoading((prev) => (messages.length === 0 ? true : prev))
        setError(null)

        const res = await fetch(
          `${API_BASE}/api/chat/conversations/${conversationId}/messages`
        )

        if (!res.ok) {
          const textRes = await res.text()
          throw new Error(textRes || 'Failed to load messages')
        }

        const data = await res.json()
        if (!isCancelled) {
          setMessages(data)
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
  }, [conversationId])

  // auto scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!currentUser) {
    return (
      <div className="my-profile-page">
        <h1>Chat</h1>
        <p className="profile-value">Please sign in to view this chat.</p>
      </div>
    )
  }

  const handleSend = async (e) => {
    e.preventDefault()
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
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="my-profile-page">
      <h1>Chat</h1>

      {error && <p className="auth-error">{error}</p>}

      <section
        className="profile-section"
        style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}
      >
        {/* Messages list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            marginBottom: '12px',
          }}
        >
          {loading && <p className="profile-value">Loading messages…</p>}

          {!loading && messages.length === 0 && (
            <p className="profile-value">
              No messages yet. Say hello to start the conversation!
            </p>
          )}

          {messages.map((msg) => {
            const isMine = msg.senderUserId === currentUser.userId
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    lineHeight: 1.4,
                    backgroundColor: isMine ? '#4f46e5' : '#e5e7eb',
                    color: isMine ? '#ffffff' : '#111827',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '8px',
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Type your message…"
            style={{
              flex: 1,
              resize: 'none',
              padding: '8px 10px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ChatPage