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
  const [decisionLoadingId, setDecisionLoadingId] = useState(null)
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

  const handleDecision = async (linkId, decision) => {
    if (!currentUser) return

    try {
      setDecisionLoadingId(linkId)

      const res = await fetch(
        `${API_BASE}/api/student-tutor-links/${linkId}/decision`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision }),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        alert(text || 'Failed to update request')
        return
      }

      const pendingRes = await fetch(
        `${API_BASE}/api/students/user/${currentUser.userId}/tutor-requests`
      )
      const matchedRes = await fetch(
        `${API_BASE}/api/students/user/${currentUser.userId}/tutors`
      )

      setPendingTutors(await pendingRes.json())
      setMatchedTutors(await matchedRes.json())
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update request')
    } finally {
      setDecisionLoadingId(null)
    }
  }

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
          {/* Pending tutors */}
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
                        <div className="profile-card-line">
                          {tutor.email}
                        </div>
                        <div className="profile-card-line">
                          User ID: {tutor.userUid}
                        </div>
                      </div>

                      <div className="my-tutors-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={decisionLoadingId === tutor.linkId}
                          onClick={() =>
                            handleDecision(tutor.linkId, 'ACCEPT')
                          }
                        >
                          {decisionLoadingId === tutor.linkId
                            ? 'Updating…'
                            : 'Accept'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={decisionLoadingId === tutor.linkId}
                          onClick={() =>
                            handleDecision(tutor.linkId, 'DECLINE')
                          }
                        >
                          {decisionLoadingId === tutor.linkId
                            ? 'Updating…'
                            : 'Decline'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Matched tutors */}
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
                        onClick={() => handleOpenChat(tutor)}
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
