import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './styles/MyTutorsPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function MyTutorsPage({ currentUser }) {
  const [pendingTutors, setPendingTutors] = useState([])
  const [matchedTutors, setMatchedTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatLoadingId, setChatLoadingId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchTutors = async () => {
      if (!currentUser) return

      try {
        setLoading(true)
        setError(null)

        const pendingRes = await fetch(
          `${API_BASE}/api/students/user/${currentUser.userId}/tutor-requests`
        )
        const matchedRes = await fetch(
          `${API_BASE}/api/students/user/${currentUser.userId}/tutors`
        )

        if (!pendingRes.ok || !matchedRes.ok) {
          const text =
            (await pendingRes.text()) || (await matchedRes.text()) || ''
          throw new Error(text || 'Failed to load tutors')
        }

        setPendingTutors(await pendingRes.json())
        setMatchedTutors(await matchedRes.json())
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load tutors')
      } finally {
        setLoading(false)
      }
    }

    fetchTutors()
  }, [currentUser])

  const handleOpenChat = async (tutor) => {
    if (!currentUser) return
    try {
      setChatLoadingId(tutor.userId)

      const res = await fetch(
        `${API_BASE}/api/chat/conversation?studentUserId=${currentUser.userId}&tutorUserId=${tutor.userId}`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const text = await res.text()
        alert(text || 'Failed to start conversation')
        return
      }

      const conv = await res.json()
      navigate(`/chat/${conv.id}`, {
        state: { otherName: `${tutor.firstName} ${tutor.lastName}` },
      })
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to start conversation')
    } finally {
      setChatLoadingId(null)
    }
  }

  if (!currentUser) {
    return (
      <div className="my-profile-page">
        <h1>My Tutors</h1>
        <p className="profile-value">
          This page is only available for student accounts.
        </p>
      </div>
    )
  }

  return (
    <div className="my-profile-page">
      <h1>My Tutors</h1>

      {loading && <p className="profile-value">Loading your tutors…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="profile-section">
            <h2>Pending requests</h2>
            {pendingTutors.length === 0 ? (
              <p className="profile-value">You have no pending requests.</p>
            ) : (
              <div className="profile-list">
                {pendingTutors.map((tutor) => (
                  <div key={tutor.linkId} className="profile-card">
                    <div className="profile-card-main">
                      <div>
                        <div className="profile-card-title">
                          {tutor.firstName} {tutor.lastName}
                        </div>
                        <div className="profile-card-details-row">
                          <div className="profile-card-details-left">
                            <span className="profile-card-line">{tutor.email}</span>
                            <span className="profile-card-line">User ID: {tutor.userUid}</span>
                          </div>

                          <span className="pending-note">Waiting for tutor's decision…</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="profile-section">
            <h2>Matched tutors</h2>
            {matchedTutors.length === 0 ? (
              <p className="profile-value">You have no matched tutors.</p>
            ) : (
              <div className="profile-list">
                {matchedTutors.map((tutor) => (
                  <div key={tutor.userId} className="profile-card">
                    <div className="profile-card-main">
                      <div>
                        <div className="profile-card-title">
                          {tutor.firstName} {tutor.lastName}
                        </div>
                        <div className="profile-card-line">{tutor.email}</div>
                        <div className="profile-card-line">
                          User ID: {tutor.userUid}
                        </div>
                      </div>

                      <div className="profile-card-actions">
                        <Link
                          to={`/tutors/${tutor.userId}`}
                          className="btn btn-outline"
                        >
                          View Profile
                        </Link>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleOpenChat(tutor)}
                          disabled={chatLoadingId === tutor.userId}
                        >
                          {chatLoadingId === tutor.userId
                            ? 'Opening…'
                            : 'Message'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default MyTutorsPage