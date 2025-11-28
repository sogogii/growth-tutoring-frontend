import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      <div className="my-profile-page">
        <h1>Messages</h1>
        <p className="profile-value">Please sign in to view your messages.</p>
      </div>
    )
  }

  return (
    <div className="my-profile-page">
      <h1>Messages</h1>

      {loading && <p className="profile-value">Loading conversations…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && conversations.length === 0 && (
        <p className="profile-value">You don&apos;t have any conversations yet.</p>
      )}

      {!loading && !error && conversations.length > 0 && (
        <section className="profile-section">
          <div className="profile-list">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className="profile-card"
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <div className="profile-card-main">
                  <div className="profile-card-title">
                    {conv.otherName || 'Conversation'}
                  </div>
                  <div className="profile-card-subtitle">
                    {conv.otherUserId
                      ? `User ID: ${conv.otherUserId}`
                      : 'Tap to open chat'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ChatListPage