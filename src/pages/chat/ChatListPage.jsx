import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/ChatListPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

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
        setConversations(data)
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
      <div className="my-profile-page chat-list-page">
        <h1>Messages</h1>
        <p className="profile-value">Please sign in to view your messages.</p>
      </div>
    )
  }

  return (
    <div className="my-profile-page chat-list-page">
      <h1>Messages</h1>

      {loading && <p className="profile-value">Loading conversations…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && conversations.length === 0 && (
        <p className="profile-value">You don&apos;t have any conversations yet.</p>
      )}

      {!loading && !error && conversations.length > 0 && (
        <section className="profile-section chat-list-section">
          <div className="profile-list chat-list">
            {conversations.map((conv) => {
              const displayName =
                (conv.otherFirstName || conv.otherLastName)
                  ? `${conv.otherFirstName || ''} ${conv.otherLastName || ''}`.trim()
                  : conv.otherName || 'Conversation'

              const initials = displayName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('')

              return (
                <button
                  key={conv.id}
                  type="button"
                  className="chat-card"
                  onClick={() => navigate(`/chat/${conv.id}`)}
                >
                  <div className="chat-card-content">
                    <div className="chat-card-avatar">
                      {conv.otherAvatarUrl ? (
                        <img
                          src={conv.otherAvatarUrl}
                          alt={`${displayName}'s avatar`}
                        />
                      ) : (
                        <div className="chat-card-avatar-fallback">
                          {initials || '?'}
                        </div>
                      )}
                    </div>

                    <div className="chat-card-main">
                      <div className="chat-card-name">{displayName}</div>
                      <div className="chat-card-subtitle">
                        Tap to open chat
                      </div>
                    </div>
                  </div>
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
