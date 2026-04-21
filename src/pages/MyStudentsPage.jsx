import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/MyStudentsPage.css'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function MyStudentsPage({ currentUser }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatLoadingId, setChatLoadingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentUser) return
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(
          `${API_BASE}/api/session-requests/tutor/${currentUser.userId}/session-students`,
          { credentials: 'include' }
        )
        if (!res.ok) throw new Error((await res.text()) || 'Failed to load students')
        setStudents(await res.json())
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [currentUser])

  const handleOpenChat = async (student) => {
    if (!currentUser) return
    try {
      setChatLoadingId(student.userId)
      const res = await fetch(
        `${API_BASE}/api/chat/conversation/with-student?studentUserId=${student.userId}`,
        { method: 'POST', credentials: 'include' }
      )
      if (!res.ok) {
        alert((await res.text()) || 'Failed to start conversation')
        return
      }
      const conv = await res.json()
      navigate(`/messages/${conv.id}`, {
        state: {
          otherName: `${student.firstName} ${student.lastName}`,
          otherUserId: student.userId,
        },
      })
    } catch (err) {
      alert(err.message || 'Failed to start conversation')
    } finally {
      setChatLoadingId(null)
    }
  }

  if (!currentUser) {
    return (
      <div className="my-profile-page">
        <h1>My Students</h1>
        <p className="profile-value">This page is only available for tutor accounts.</p>
      </div>
    )
  }

  return (
    <div className="my-profile-page">
      <h1>My Students</h1>

      {loading && <p className="profile-value">Loading your students…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && (
        <section className="profile-section">
          <h2>Students</h2>
          {students.length === 0 ? (
            <p className="profile-value">
              Students who have taken a session with you will appear here.
            </p>
          ) : (
            <div className="profile-list">
              {students.map((student) => (
                <div key={student.userId} className="profile-card">
                  <div className="profile-card-main">
                    <div>
                      <div className="profile-card-title">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="profile-card-subtitle">ID: {student.userUid}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleOpenChat(student)}
                      disabled={chatLoadingId === student.userId}
                    >
                      {chatLoadingId === student.userId ? 'Opening…' : 'Message'}
                    </button>
                  </div>
                  <div className="student-stats">
                    <p><strong>Sessions completed:</strong> {student.totalSessionsCompleted || 0}</p>
                    <p><strong>Total hours:</strong> {student.totalHours || '0.00'} hours</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default MyStudentsPage