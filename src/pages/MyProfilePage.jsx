import { useEffect, useState } from 'react'
import './styles/MyProfilePage.css'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151'

const SUBJECT_OPTIONS = [
  'K-12 Math',
  'K-12 English',
  'Physics',
  'Chemistry',
  'Biology',
  'Foreign Languages',
  'Pre College Counseling',
  'Special needs tutoring',
  'Community Impact Program',
]

function MyProfilePage({ currentUser, setCurrentUser }) {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)

  // tutor-specific state
  const [tutorProfile, setTutorProfile] = useState(null)
  const [tutorForm, setTutorForm] = useState({
    subjects: [],
    hourlyRate: '',
    teachingMethod: 'ONLINE',
    summary: '',              // 👈 NEW
  })

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
    subjects: false,
    hourlyRate: false,
    teachingMethod: false,
    summary: false,           // 👈 NEW
  })

  useEffect(() => {
    if (!currentUser) return

    const fetchProfile = async () => {
      setLoading(true)
      try {
        // 1) load user profile
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

        // 2) if tutor, load tutor profile
        if (currentUser.role === 'TUTOR') {
          const tRes = await fetch(
            `http://localhost:8080/api/tutors/user/${currentUser.userId}`
          )
          if (tRes.ok) {
            const tData = await tRes.json()
            setTutorProfile(tData)

            const subjectsArr = (tData.subjectLabel || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)

            setTutorForm({
              subjects: subjectsArr,
              hourlyRate:
                tData.hourlyRate != null ? String(tData.hourlyRate) : '',
              teachingMethod: tData.teachingMethod || 'ONLINE',
              summary: tData.bio || '',        // 👈 NEW (using bio as summary)
            })
          }
        }
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

  // tutor-specific handlers
  const toggleSubject = (subject) => {
    setTutorForm((prev) => {
      const exists = prev.subjects.includes(subject)
      const subjects = exists
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject]
      return { ...prev, subjects }
    })
  }

  const handleTutorChange = (e) => {
    const { name, value } = e.target
    setTutorForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      // 1) update user profile
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

      // 2) if tutor, update tutor profile too
      if (currentUser.role === 'TUTOR' && tutorProfile) {
        const tRes = await fetch(
          `http://localhost:8080/api/tutors/user/${currentUser.userId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subjectLabel: tutorForm.subjects.join(', '),
              hourlyRate: tutorForm.hourlyRate
                ? Number(tutorForm.hourlyRate)
                : null,
              teachingMethod: tutorForm.teachingMethod,
              bio: tutorForm.summary,   
            }),
          }
        )

        if (!tRes.ok) {
          const text = await tRes.text()
          throw new Error(text || 'Failed to save tutor profile')
        }

        const updatedTutor = await tRes.json()
        setTutorProfile(updatedTutor)

        const subjectsArr = (updatedTutor.subjectLabel || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        setTutorForm({
          subjects: subjectsArr,
          hourlyRate:
            updatedTutor.hourlyRate != null
              ? String(updatedTutor.hourlyRate)
              : '',
          teachingMethod: updatedTutor.teachingMethod || 'ONLINE',
          summary: updatedTutor.bio || '',       
        })
      }

      setSuccess('Profile updated successfully.')

      // exit edit mode after save
      setEditing({
        profileImageUrl: false,
        firstName: false,
        lastName: false,
        userUid: false,
        birthday: false,
        subjects: false,
        hourlyRate: false,
        teachingMethod: false,
        summary: false,
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

            {/* Tutor-only section */}
            {currentUser.role === 'TUTOR' && (
              <>
                <h2 className="profile-section-title">Tutor Profile</h2>

                {/* Subjects */}
                <div className="profile-field-row">
                  <label>Subjects</label>
                  {editing.subjects ? (
                    <div className="subject-toggle-group">
                      {SUBJECT_OPTIONS.map((subject) => {
                        const selected =
                          tutorForm.subjects.includes(subject)
                        return (
                          <button
                            key={subject}
                            type="button"
                            className={`subject-toggle ${
                              selected ? 'selected' : ''
                            }`}
                            onClick={() => toggleSubject(subject)}
                          >
                            {subject}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <span className="profile-value">
                      {tutorForm.subjects.length > 0
                        ? tutorForm.subjects.join(', ')
                        : 'Not set'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="field-edit-button"
                    onClick={() => toggleEdit('subjects')}
                  >
                    ✏️
                  </button>
                </div>

                {/* Hourly rate */}
                <div className="profile-field-row">
                  <label>Hourly rate</label>
                  {editing.hourlyRate ? (
                    <input
                      type="number"
                      name="hourlyRate"
                      value={tutorForm.hourlyRate}
                      onChange={handleTutorChange}
                      min="0"
                      step="1"
                      placeholder="e.g. 40"
                    />
                  ) : (
                    <span className="profile-value">
                      {tutorForm.hourlyRate
                        ? `$${tutorForm.hourlyRate}/hr`
                        : 'Not set'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="field-edit-button"
                    onClick={() => toggleEdit('hourlyRate')}
                  >
                    ✏️
                  </button>
                </div>

                {/* Teaching method */}
                <div className="profile-field-row">
                  <label>Teaching method</label>
                  {editing.teachingMethod ? (
                    <select
                      name="teachingMethod"
                      value={tutorForm.teachingMethod}
                      onChange={handleTutorChange}
                    >
                      <option value="ONLINE">Online</option>
                      <option value="IN_PERSON">In person</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  ) : (
                    <span className="profile-value">
                      {tutorForm.teachingMethod === 'IN_PERSON'
                        ? 'In person'
                        : tutorForm.teachingMethod === 'HYBRID'
                        ? 'Hybrid'
                        : 'Online'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="field-edit-button"
                    onClick={() => toggleEdit('teachingMethod')}
                  >
                    ✏️
                  </button>
                </div>

                {/* Summary */}
                <div className="profile-field-row">
                  <label>Summary</label>
                  {editing.summary ? (
                    <textarea
                      name="summary"
                      value={tutorForm.summary}
                      onChange={handleTutorChange}
                      rows={3}
                      className="profile-textarea"
                      placeholder="Brief description about your tutoring experience, style, etc."
                    />
                  ) : (
                    <span className="profile-value">
                      {tutorForm.summary || 'Not set'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="field-edit-button"
                    onClick={() => toggleEdit('summary')}
                  >
                    ✏️
                  </button>
                </div>
              </>
            )}

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

            <button
              type="submit"
              disabled={saving}
              className="primary-button"
            >
              {saving ? 'Saving…' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MyProfilePage
