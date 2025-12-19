import { useEffect, useState } from 'react'
import './styles/AdminPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function AdminPage({ currentUser }) {
  const [users, setUsers] = useState([])
  const [tutors, setTutors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'tutors'

  const adminUserId = currentUser?.userId

  useEffect(() => {
    if (!adminUserId) return

    const fetchData = async () => {
      try {
        setError(null)
        setLoading(true)

        // Fetch users
        const usersRes = await fetch(
          `${API_BASE}/api/admin/users?adminUserId=${adminUserId}`,
          { credentials: 'include' }
        )

        if (!usersRes.ok) {
          throw new Error((await usersRes.text()) || 'Failed to load users')
        }

        const usersData = await usersRes.json()
        setUsers(usersData)

        const tutorsRes = await fetch(`${API_BASE}/api/tutors`)

        if (tutorsRes.ok) {
          const tutorsData = await tutorsRes.json()
          // Create a map of userId -> tutor data
          const tutorMap = {}
          tutorsData.forEach(tutor => {
            tutorMap[tutor.userId] = tutor
          })
          setTutors(tutorMap)
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [adminUserId])

  const updateStatus = async (id, status) => {
    if (!adminUserId) return

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${id}/status?adminUserId=${adminUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error((await res.text()) || 'Failed to update status')
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status } : u))
      )
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update status')
    }
  }

  const updateVerificationTier = async (userId, tier) => {
    if (!adminUserId) return

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/tutors/${userId}/verification-tier?adminUserId=${adminUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verificationTier: tier }),
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error((await res.text()) || 'Failed to update verification tier')
      }

      // Update the tutors map
      setTutors(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          verificationTier: tier
        }
      }))

      alert('Verification tier updated successfully!')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update verification tier')
    }
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <p>Not authorized.</p>
  }

  // Filter tutors from users
  const tutorUsers = users.filter(u => u.role === 'TUTOR')

  return (
    <div className="my-profile-page">
      <h1>Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'tutors' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutors')}
        >
          Tutor Verification
        </button>
      </div>

      {loading && <p className="profile-value">Loading...</p>}
      {error && <p className="auth-error">{error}</p>}

      {/* Users Tab */}
      {!loading && !error && activeTab === 'users' && (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => updateStatus(u.id, 'ACTIVE')}
                  >
                    Activate
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => updateStatus(u.id, 'SUSPENDED')}
                  >
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Tutors Verification Tab */}
      {!loading && !error && activeTab === 'tutors' && (
        <div className="tutors-verification-section">
          <h2>Manage Tutor Verification Tiers</h2>
          <p className="section-description">
            Update verification tiers for tutors. Higher tiers indicate greater verification levels.
          </p>

          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Current Tier</th>
                <th>Change Tier</th>
              </tr>
            </thead>
            <tbody>
              {tutorUsers.map((tutor) => {
                const tutorData = tutors[tutor.id]
                const currentTier = tutorData?.verificationTier || 'TIER_1'
                
                return (
                  <tr key={tutor.id}>
                    <td>{tutor.id}</td>
                    <td>
                      {tutor.firstName} {tutor.lastName}
                    </td>
                    <td>{tutor.email}</td>
                    <td>
                      <span className={`status-badge status-${tutor.status.toLowerCase()}`}>
                        {tutor.status}
                      </span>
                    </td>
                    <td>
                      <span className={`tier-badge tier-${currentTier.toLowerCase()}`}>
                        {currentTier.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="tier-buttons">
                        <button
                          className={`btn-tier ${currentTier === 'TIER_1' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(tutor.id, 'TIER_1')}
                          disabled={currentTier === 'TIER_1'}
                        >
                          Tier 1
                        </button>
                        <button
                          className={`btn-tier ${currentTier === 'TIER_2' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(tutor.id, 'TIER_2')}
                          disabled={currentTier === 'TIER_2'}
                        >
                          Tier 2
                        </button>
                        <button
                          className={`btn-tier ${currentTier === 'TIER_3' ? 'active' : ''}`}
                          onClick={() => updateVerificationTier(tutor.id, 'TIER_3')}
                          disabled={currentTier === 'TIER_3'}
                        >
                          Tier 3
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {tutorUsers.length === 0 && (
            <p className="profile-value">No tutors found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPage