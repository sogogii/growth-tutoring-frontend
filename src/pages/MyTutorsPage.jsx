import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    if (!currentUser || currentUser.role !== 'STUDENT') {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // pending tutor requests
        const pendingRes = await fetch(
          `${API_BASE}/api/students/user/${currentUser.userId}/tutor-requests`
        )
        if (!pendingRes.ok) {
          throw new Error(await pendingRes.text())
        }
        const pending = await pendingRes.json()

        // matched tutors
        const matchedRes = await fetch(
          `${API_BASE}/api/students/user/${currentUser.userId}/tutors`
        )
        if (!matchedRes.ok) {
          throw new Error(await matchedRes.text())
        }
        const matched = await matchedRes.json()

        setPendingTutors(pending)
        setMatchedTutors(matched)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load tutors')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser])

  const handleOpenChat = async (tutorUserId) => {
    if (!currentUser) return
    try {
      setChatLoadingId(tutorUserId)

      const res = await fetch(
        `${API_BASE}/api/chat/conversation?studentUserId=${currentUser.userId}&tutorUserId=${tutorUserId}`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const text = await res.text()
        alert(text || 'Failed to start conversation')
        return
      }

      const conv = await res.json()
      navigate(`/chat/${conv.id}`)
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
        <p className="profile-value">Please sign in to view your tutors.</p>
      </div>
    )
  }

  if (currentUser.role !== 'STUDENT') {
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
          {/* Pending tutor requests */}
          <section className="profile-section">
            <h2 className="profile-section-title">Pending tutor requests</h2>

            {pendingTutors.length === 0 ? (
              <p className="profile-value">
                You don&apos;t have any pending tutor requests.
              </p>
            ) : (
              <div className="profile-list">
                {pendingTutors.map((tutor) => (
                  <div key={tutor.linkId} className="profile-card">
                    <div className="profile-card-main">
                      <div className="profile-card-title">
                        {tutor.firstName} {tutor.lastName}
                      </div>

                      <div className="profile-card-line">
                        {tutor.email}
                      </div>

                      <div className="profile-card-line">
                        User ID: {tutor.userUid}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Matched tutors */}
          <section className="profile-section">
            <h2 className="profile-section-title">Matched tutors</h2>

            {matchedTutors.length === 0 ? (
              <p className="profile-value">
                You don&apos;t have any matched tutors yet.
              </p>
            ) : (
              <div className="profile-list">
                {matchedTutors.map((tutor) => (
                  <div key={tutor.userId} className="profile-card">
                    <div className="profile-card-main">
                      <div>
                        <div className="profile-card-title">
                          {tutor.firstName} {tutor.lastName}
                        </div>

                        <div className="profile-card-line">
                          {tutor.email}
                        </div>

                        <div className="profile-card-line">
                          User ID: {tutor.userUid}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleOpenChat(tutor.userId)}
                        disabled={chatLoadingId === tutor.userId}
                      >
                        {chatLoadingId === tutor.userId
                          ? 'Opening…'
                          : 'Message'}
                      </button>
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