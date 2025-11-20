import { useEffect, useState } from 'react'
import './styles/MyProfilePage.css'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151'

function MyProfilePage({ currentUser, setCurrentUser }) {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // which fields are in "edit mode"
  const [editing, setEditing] = useState({
    profileImageUrl: false,
    firstName: false,
    lastName: false,
    userUid: false,
    birthday: false,
  })

  useEffect(() => {
    if (!currentUser) return

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `http://localhost:8080/api/users/${currentUser.userId}`
        )
        if (!res.ok) {
          throw new Error('Failed to load profile')
        }
        const data = await res.json()
        setProfile(data)
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          userUid: data.userUid || '',
          birthday: data.birthday || '',
          profileImageUrl: data.profileImageUrl || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const toggleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }))
    setSuccess(null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${currentUser.userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to save profile')
      }

      const updated = await res.json()
      setProfile(updated)
      setForm({
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        userUid: updated.userUid || '',
        birthday: updated.birthday || '',
        profileImageUrl: updated.profileImageUrl || '',
      })
      setSuccess('Profile updated successfully.')

      // exit edit mode after save
      setEditing({
        profileImageUrl: false,
        firstName: false,
        lastName: false,
        userUid: false,
        birthday: false,
      })

      // update header / currentUser (firstName, lastName, userUid)
      const newCurrentUser = {
        ...currentUser,
        firstName: updated.firstName,
        lastName: updated.lastName,
        userUid: updated.userUid,
      }
      setCurrentUser(newCurrentUser)
      localStorage.setItem('currentUser', JSON.stringify(newCurrentUser))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!currentUser) {
    return <div className="auth-page">Please log in to view your profile.</div>
  }

  if (loading) {
    return <div className="auth-page">Loading profile...</div>
  }

  if (error && !form) {
    return <div className="auth-page">Error: {error}</div>
  }

  if (!form) {
    return <div className="auth-page">No profile data found.</div>
  }

  const avatarSrc = form.profileImageUrl || DEFAULT_AVATAR

  return (
    <div className="auth-page">
      <h1>My Profile</h1>

      <div className="profile-layout">
        <div className="profile-avatar-column">
          <img
            src={avatarSrc}
            alt="Profile"
            className="profile-avatar"
          />
        </div>

        <div className="profile-form-column">
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Profile picture URL */}
            <div className="profile-field-row">
              <label>Profile picture URL</label>
              {editing.profileImageUrl ? (
                <input
                  name="profileImageUrl"
                  value={form.profileImageUrl}
                  onChange={handleChange}
                  placeholder="Paste an image URL"
                />
              ) : (
                <span className="profile-value">
                  {form.profileImageUrl || 'Not set'}
                </span>
              )}
              <button
                type="button"
                className="field-edit-button"
                onClick={() => toggleEdit('profileImageUrl')}
              >
                ✏️
              </button>
            </div>

            {/* First name */}
            <div className="profile-field-row">
              <label>First name</label>
              {editing.firstName ? (
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              ) : (
                <span className="profile-value">{form.firstName}</span>
              )}
              <button
                type="button"
                className="field-edit-button"
                onClick={() => toggleEdit('firstName')}
              >
                ✏️
              </button>
            </div>

            {/* Last name */}
            <div className="profile-field-row">
              <label>Last name</label>
              {editing.lastName ? (
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              ) : (
                <span className="profile-value">{form.lastName}</span>
              )}
              <button
                type="button"
                className="field-edit-button"
                onClick={() => toggleEdit('lastName')}
              >
                ✏️
              </button>
            </div>

            {/* User ID */}
            <div className="profile-field-row">
              <label>User ID (username)</label>
              {editing.userUid ? (
                <input
                  name="userUid"
                  value={form.userUid}
                  onChange={handleChange}
                  required
                />
              ) : (
                <span className="profile-value">{form.userUid}</span>
              )}
              <button
                type="button"
                className="field-edit-button"
                onClick={() => toggleEdit('userUid')}
              >
                ✏️
              </button>
            </div>
            <small className="field-hint">
              You can only change your User ID once every 30 days.
            </small>

            {/* Birthday */}
            <div className="profile-field-row">
              <label>Birthday</label>
              {editing.birthday ? (
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={handleChange}
                  required
                />
              ) : (
                <span className="profile-value">{form.birthday}</span>
              )}
              <button
                type="button"
                className="field-edit-button"
                onClick={() => toggleEdit('birthday')}
              >
                ✏️
              </button>
            </div>

            {/* Read-only fields */}
            <div className="profile-field-row">
              <label>Email</label>
              <span className="profile-value read-only">
                {profile.email}
              </span>
            </div>

            <div className="profile-field-row">
              <label>Account status</label>
              <span className="profile-value read-only">
                {profile.status}
              </span>
            </div>

            <div className="profile-field-row">
              <label>Created at</label>
              <span className="profile-value read-only">
                {profile.createdAt}
              </span>
            </div>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MyProfilePage
