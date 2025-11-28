import { useEffect, useState } from 'react'
import './styles/MyProfilePage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function MyTutorsPage({ currentUser }) {
  const [matchedTutors, setMatchedTutors] = useState([])
  const [pendingTutors, setPendingTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'STUDENT') return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [matchedRes, pendingRes] = await Promise.all([
          fetch(`${API_BASE}/api/students/user/${currentUser.userId}/tutors`),
          fetch(
            `${API_BASE}/api/students/user/${currentUser.userId}/tutor-requests`
          ),
        ])

        const [matchedData, pendingData] = await Promise.all([
          matchedRes.ok ? matchedRes.json() : [],
          pendingRes.ok ? pendingRes.json() : [],
        ])

        setMatchedTutors(matchedData)
        setPendingTutors(pendingData)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load tutors')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUser])

  if (!currentUser) {
    return <div className="my-profile-page">Please log in first.</div>
  }

  if (currentUser.role !== 'STUDENT') {
    return (
      <div className="my-profile-page">
        Only students can view this page.
      </div>
    )
  }

  if (loading) {
    return <div className="my-profile-page">Loading your tutors…</div>
  }

  return (
    <div className="my-profile-page">
      <h1>My Tutors</h1>

      {error && <p className="auth-error">{error}</p>}

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
              <div
                key={tutor.linkId ?? tutor.id}
                className="profile-card"
              >
                <div className="profile-card-main">
                  <div className="profile-card-title">
                    {tutor.firstName} {tutor.lastName}
                  </div>
                  <div className="profile-card-subtitle">
                    {tutor.email} • User ID: {tutor.userUid}
                  </div>
                  <div className="profile-card-subtitle">
                    Status: Waiting for tutor to accept your request
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Accepted / matched tutors */}
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
                  <div className="profile-card-title">
                    {tutor.firstName} {tutor.lastName}
                  </div>
                  <div className="profile-card-subtitle">
                    {tutor.email} • User ID: {tutor.userUid}
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

export default MyTutorsPage