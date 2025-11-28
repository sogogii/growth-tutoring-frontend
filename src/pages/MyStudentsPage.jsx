import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/MyProfilePage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function MyStudentsPage({ currentUser }) {
  const [pendingStudents, setPendingStudents] = useState([])
  const [matchedStudents, setMatchedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [decisionLoadingId, setDecisionLoadingId] = useState(null)
  const [chatLoadingId, setChatLoadingId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'TUTOR') {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const pendingRes = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/student-requests`
        )
        if (!pendingRes.ok) {
          throw new Error(await pendingRes.text())
        }
        const pending = await pendingRes.json()

        const matchedRes = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/students`
        )
        if (!matchedRes.ok) {
          throw new Error(await matchedRes.text())
        }
        const matched = await matchedRes.json()

        setPendingStudents(pending)
        setMatchedStudents(matched)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser])

  const handleDecision = async (linkId, decision) => {
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

      // reload lists
      const pendingRes = await fetch(
        `${API_BASE}/api/tutors/user/${currentUser.userId}/student-requests`
      )
      const matchedRes = await fetch(
        `${API_BASE}/api/tutors/user/${currentUser.userId}/students`
      )
      setPendingStudents(await pendingRes.json())
      setMatchedStudents(await matchedRes.json())
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update request')
    } finally {
      setDecisionLoadingId(null)
    }
  }

  const handleOpenChat = async (studentUserId) => {
    if (!currentUser) return
    try {
      setChatLoadingId(studentUserId)

      const res = await fetch(
        `${API_BASE}/api/chat/conversation?studentUserId=${studentUserId}&tutorUserId=${currentUser.userId}`,
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
        <h1>My Students</h1>
        <p className="profile-value">Please sign in to view your students.</p>
      </div>
    )
  }

  if (currentUser.role !== 'TUTOR') {
    return (
      <div className="my-profile-page">
        <h1>My Students</h1>
        <p className="profile-value">
          This page is only available for tutor accounts.
        </p>
      </div>
    )
  }

  return (
    <div className="my-profile-page">
      <h1>My Students</h1>

      {loading && <p className="profile-value">Loading your students…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Pending requests */}
          <section className="profile-section">
            <h2 className="profile-section-title">Pending requests</h2>

            {pendingStudents.length === 0 ? (
              <p className="profile-value">
                You don&apos;t have any pending requests.
              </p>
            ) : (
              <div className="profile-list">
                {pendingStudents.map((student) => (
                  <div key={student.linkId} className="profile-card">
                    <div className="profile-card-main">
                      <div>
                        <div className="profile-card-title">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="profile-card-subtitle">
                          {student.email} • User ID: {student.userUid}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={decisionLoadingId === student.linkId}
                          onClick={() =>
                            handleDecision(student.linkId, 'ACCEPT')
                          }
                        >
                          {decisionLoadingId === student.linkId
                            ? 'Accepting…'
                            : 'Accept'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-sm"
                          disabled={decisionLoadingId === student.linkId}
                          onClick={() =>
                            handleDecision(student.linkId, 'DECLINE')
                          }
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Matched students */}
          <section className="profile-section">
            <h2 className="profile-section-title">Matched students</h2>

            {matchedStudents.length === 0 ? (
              <p className="profile-value">
                You don&apos;t have any matched students yet.
              </p>
            ) : (
              <div className="profile-list">
                {matchedStudents.map((student) => (
                  <div key={student.userId} className="profile-card">
                    <div className="profile-card-main">
                      <div>
                        <div className="profile-card-title">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="profile-card-subtitle">
                          {student.email} • User ID: {student.userUid}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleOpenChat(student.userId)}
                        disabled={chatLoadingId === student.userId}
                      >
                        {chatLoadingId === student.userId
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

export default MyStudentsPage