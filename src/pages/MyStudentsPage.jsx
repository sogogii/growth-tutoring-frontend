import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/MyStudentsPage.css'

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
    const fetchStudents = async () => {
      if (!currentUser) return

      try {
        setLoading(true)
        setError(null)

        const pendingRes = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/student-requests`
        )
        const matchedRes = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/students`
        )

        if (!pendingRes.ok || !matchedRes.ok) {
          const text =
            (await pendingRes.text()) || (await matchedRes.text()) || ''
          throw new Error(text || 'Failed to load students')
        }

        const pendingData = await pendingRes.json()
        const matchedData = await matchedRes.json()

        setPendingStudents(pendingData)
        setMatchedStudents(matchedData)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
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

      // refresh lists
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

  const handleOpenChat = async (student) => {
    if (!currentUser) return
    try {
      setChatLoadingId(student.userId)

      const res = await fetch(
        `${API_BASE}/api/chat/conversation?studentUserId=${student.userId}&tutorUserId=${currentUser.userId}`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const text = await res.text()
        alert(text || 'Failed to start conversation')
        return
      }

      const conv = await res.json()
      navigate(`/messages/${conv.id}`, {
        state: { 
          otherName: `${student.firstName} ${student.lastName}`,
          otherUserId: student.userId  
        }
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
          {/* Pending students */}
          <section className="profile-section">
            <h2>Pending requests</h2>
            {pendingStudents.length === 0 ? (
              <p className="profile-value">You have no pending requests.</p>
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
                          {student.email}
                        </div>
                      </div>

                      <div className="my-students-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={decisionLoadingId === student.linkId}
                          onClick={() =>
                            handleDecision(student.linkId, 'ACCEPT')
                          }
                        >
                          {decisionLoadingId === student.linkId
                            ? 'Updating…'
                            : 'Accept'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={decisionLoadingId === student.linkId}
                          onClick={() =>
                            handleDecision(student.linkId, 'DECLINE')
                          }
                        >
                          {decisionLoadingId === student.linkId
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

          {/* Matched students */}
          <section className="profile-section">
            <h2>Matched students</h2>
            {matchedStudents.length === 0 ? (
              <p className="profile-value">You have no matched students.</p>
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
                        onClick={() => handleOpenChat(student)}
                        disabled={chatLoadingId === student.userId}
                      >
                        {chatLoadingId === student.userId
                          ? 'Opening…'
                          : 'Message'}
                      </button>
                    </div>
                    <div className="student-stats">
                      <p>
                        <strong>Sessions completed:</strong> {student.totalSessionsCompleted || 0}
                      </p>
                      <p>
                        <strong>Total hours:</strong> {student.totalHours || '0.00'} hours
                      </p>
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
