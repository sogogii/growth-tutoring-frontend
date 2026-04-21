import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './styles/MyTutorsPage.css'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function MyTutorsPage({ currentUser }) {
  const [sessionTutors, setSessionTutors] = useState([])
  const [favoriteTutors, setFavoriteTutors] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatLoadingId, setChatLoadingId] = useState(null)
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)
        const [sessionRes, favRes] = await Promise.all([
          fetch(
            `${API_BASE}/api/session-requests/student/${currentUser.userId}/session-tutors`,
            { credentials: 'include' }
          ),
          fetch(
            `${API_BASE}/api/students/${currentUser.userId}/favorites`,
            { credentials: 'include' }
          ),
        ])
        if (!sessionRes.ok) throw new Error((await sessionRes.text()) || 'Failed to load tutors')
        if (!favRes.ok) throw new Error((await favRes.text()) || 'Failed to load favorites')

        const sessionData = await sessionRes.json()
        const favData = await favRes.json()

        setSessionTutors(sessionData)
        setFavoriteTutors(favData)
        setFavoriteIds(new Set(favData.map((t) => t.userId)))
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load tutors')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [currentUser])

  const handleOpenChat = async (tutor) => {
    if (!currentUser) return
    try {
      setChatLoadingId(tutor.userId)
      const res = await fetch(
        `${API_BASE}/api/chat/conversation?studentUserId=${currentUser.userId}&tutorUserId=${tutor.userId}`,
        { method: 'POST', credentials: 'include' }
      )
      if (!res.ok) {
        alert((await res.text()) || 'Failed to start conversation')
        return
      }
      const conv = await res.json()
      navigate(`/messages/${conv.id}`, {
        state: { otherName: `${tutor.firstName} ${tutor.lastName}`, otherUserId: tutor.userId },
      })
    } catch (err) {
      alert(err.message || 'Failed to start conversation')
    } finally {
      setChatLoadingId(null)
    }
  }

  const handleToggleFavorite = async (tutor) => {
    if (!currentUser) return
    const isFav = favoriteIds.has(tutor.userId)
    setFavoriteLoadingId(tutor.userId)
    try {
      const res = await fetch(
        `${API_BASE}/api/students/${currentUser.userId}/favorites/${tutor.userId}`,
        { method: isFav ? 'DELETE' : 'POST', credentials: 'include' }
      )
      if (!res.ok) {
        alert((await res.text()) || 'Failed to update favorites')
        return
      }
      if (isFav) {
        setFavoriteIds((prev) => { const s = new Set(prev); s.delete(tutor.userId); return s })
        setFavoriteTutors((prev) => prev.filter((t) => t.userId !== tutor.userId))
      } else {
        setFavoriteIds((prev) => new Set([...prev, tutor.userId]))
        setFavoriteTutors((prev) => [...prev, tutor])
      }
    } catch (err) {
      alert(err.message || 'Failed to update favorites')
    } finally {
      setFavoriteLoadingId(null)
    }
  }

  if (!currentUser) {
    return (
      <div className="my-profile-page">
        <h1>My Tutors</h1>
        <p className="profile-value">This page is only available for student accounts.</p>
      </div>
    )
  }

  const renderTutorCard = (tutor, showStats = false) => (
    <div key={tutor.userId} className="profile-card">
      <div className="profile-card-main">
        <div className="profile-card-content">
          <div className="profile-card-title">
            {tutor.firstName} {tutor.lastName}
          </div>
          {tutor.userUid && (
            <div className="profile-card-subtitle">ID: {tutor.userUid}</div>
          )}
        </div>
        <div className="profile-card-actions">
          <button
            type="button"
            className={`btn-favorite ${favoriteIds.has(tutor.userId) ? 'favorited' : ''}`}
            onClick={() => handleToggleFavorite(tutor)}
            disabled={favoriteLoadingId === tutor.userId}
            title={favoriteIds.has(tutor.userId) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favoriteIds.has(tutor.userId) ? '♥' : '♡'}
          </button>
          <Link to={`/tutors/${tutor.userId}`} className="btn btn-outline">
            View Profile
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleOpenChat(tutor)}
            disabled={chatLoadingId === tutor.userId}
          >
            {chatLoadingId === tutor.userId ? 'Opening…' : 'Message'}
          </button>
        </div>
      </div>
      {showStats && (
        <div className="tutor-stats">
          <p><strong>Sessions completed:</strong> {tutor.totalSessionsCompleted || 0}</p>
          <p><strong>Total hours:</strong> {tutor.totalHours || '0.00'} hours</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="my-profile-page">
      <h1>My Tutors</h1>

      {loading && <p className="profile-value">Loading your tutors…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Favorites section — always shown */}
          <section className="profile-section favorites-section">
            <h2>⭐ Favorite Tutors</h2>
            {favoriteTutors.length === 0 ? (
              <p className="profile-value">
                Visit a tutor's profile and click "Add to Favorites" to save them here.
              </p>
            ) : (
              <div className="profile-list">
                {favoriteTutors.map((tutor) => renderTutorCard(tutor, false))}
              </div>
            )}
          </section>

          {/* Session-based tutors */}
          <section className="profile-section">
            <h2>Tutors I've Worked With</h2>
            {sessionTutors.length === 0 ? (
              <p className="profile-value">
                Tutors you've had sessions with will appear here.
              </p>
            ) : (
              <div className="profile-list">
                {sessionTutors.map((tutor) => renderTutorCard(tutor, true))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default MyTutorsPage