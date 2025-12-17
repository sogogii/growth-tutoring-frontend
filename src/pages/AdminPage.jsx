import { useEffect, useState } from 'react'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function AdminPage({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // admin user's id from the logged-in user object
  const adminUserId = currentUser?.userId

  useEffect(() => {
    if (!adminUserId) return

    const fetchUsers = async () => {
      try {
        setError(null)
        setLoading(true)

        const res = await fetch(
          `${API_BASE}/api/admin/users?adminUserId=${adminUserId}`,
          {
            credentials: 'include',
          }
        )

        if (!res.ok) {
          throw new Error((await res.text()) || 'Failed to load users')
        }

        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
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

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <p>Not authorized.</p>
  }

  return (
    <div className="my-profile-page">
      <h1>Admin – Users</h1>

      {loading && <p className="profile-value">Loading users…</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && (
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
    </div>
  )
}

export default AdminPage