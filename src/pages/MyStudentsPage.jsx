// src/pages/MyStudentsPage.jsx
import { useEffect, useState } from 'react'
import './styles/MyProfilePage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function MyStudentsPage({ currentUser }) {
  const [acceptedStudents, setAcceptedStudents] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [decisionLoadingId, setDecisionLoadingId] = useState(null)

  // load accepted + pending
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'TUTOR') return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // accepted students
        const acceptedRes = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/students`
        )
        const acceptedData = acceptedRes.ok ? await acceptedRes.json() : []

        // pending requests (with linkId)
        const pendingRes = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/student-requests`
        )
        const pendingData = pendingRes.ok ? await pendingRes.json() : []

        setAcceptedStudents(acceptedData)
        setPendingRequests(pendingData)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUser])

  const handleDecision = async (linkId, decision) => {
    if (!currentUser) return

    setDecisionLoadingId(linkId)
    setError(null)

    try {
      const res = await fetch(
        `${API_BASE}/api/student-tutor-links/${linkId}/decision`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision }), // "ACCEPT" or "DECLINE"
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to update request')
      }

      // refresh both lists
      const [acceptedRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/api/tutors/user/${currentUser.userId}/students`),
        fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/student-requests`
        ),
      ])

      const [acceptedData, pendingData] = await Promise.all([
        acceptedRes.ok ? acceptedRes.json() : [],
        pendingRes.ok ? pendingRes.json() : [],
      ])

      setAcceptedStudents(acceptedData)
      setPendingRequests(pendingData)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to update request')
    } finally {
      setDecisionLoadingId(null)
    }
  }

  if (!currentUser) {
    return <div className="my-profile-page">Please log in first.</div>
  }

  if (currentUser.role !== 'TUTOR') {
    return (
      <div className="my-profile-page">
        Only tutors can view this page.
      </div>
    )
  }

  if (loading) {
    return <div className="my-profile-page">Loading your students…</div>
  }

  return (
    <div className="my-profile-page">
      <h1>My Students</h1>

      {error && <p className="auth-error">{error}</p>}

      {/* Pending requests */}
      <section className="profile-section">
        <h2 className="profile-section-title">Pending requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="profile-value">You have no pending student requests.</p>
        ) : (
          <div className="profile-list">
            {pendingRequests.map((req) => (
              <div key={req.linkId} className="profile-card">
                <div className="profile-card-main">
                  <div className="profile-card-title">
                    {req.firstName} {req.lastName}
                  </div>
                  <div className="profile-card-subtitle">
                    {req.email} • User ID: {req.userUid}
                  </div>
                </div>

                <div className="profile-card-actions">
                  <button
                    type="button"
                    className="primary-button"
                    disabled={decisionLoadingId === req.linkId}
                    onClick={() => handleDecision(req.linkId, 'ACCEPT')}
                  >
                    {decisionLoadingId === req.linkId
                      ? 'Accepting…'
                      : 'Accept'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={decisionLoadingId === req.linkId}
                    onClick={() => handleDecision(req.linkId, 'DECLINE')}
                  >
                    {decisionLoadingId === req.linkId
                      ? 'Declining…'
                      : 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Accepted students */}
      <section className="profile-section">
        <h2 className="profile-section-title">Matched students</h2>
        {acceptedStudents.length === 0 ? (
          <p className="profile-value">
            You don&apos;t have any matched students yet.
          </p>
        ) : (
          <div className="profile-list">
            {acceptedStudents.map((s) => (
              <div key={s.userId} className="profile-card">
                <div className="profile-card-main">
                  <div className="profile-card-title">
                    {s.firstName} {s.lastName}
                  </div>
                  <div className="profile-card-subtitle">
                    {s.email} • User ID: {s.userUid}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyStudentsPage
