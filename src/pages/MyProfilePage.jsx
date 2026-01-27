import { useEffect, useState } from 'react'
import './styles/MyProfilePage.css'
import ClickableAvatar from '../components/ClickableAvatar'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

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
    headline: '',
    bio: '',
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
    headline: false,
    bio: false,
  })

  useEffect(() => {
    if (!currentUser) return

    const fetchProfile = async () => {
      setLoading(true)
      try {
        // 1) load user profile
        const res = await fetch(
          `${API_BASE}/api/users/${currentUser.userId}`
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
            `${API_BASE}/api/tutors/user/${currentUser.userId}`
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
                tData.hourlyRate != null
                  ? String(tData.hourlyRate)
                  : '',
              teachingMethod: tData.teachingMethod || 'ONLINE',
              headline: tData.headline || '',
              bio: tData.bio || '',
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
        `${API_BASE}/api/users/${currentUser.userId}`,
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
          `${API_BASE}/api/tutors/user/${currentUser.userId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subjectLabel: tutorForm.subjects.join(', '),
              hourlyRate: tutorForm.hourlyRate
                ? Number(tutorForm.hourlyRate)
                : null,
              teachingMethod: tutorForm.teachingMethod,
              headline: tutorForm.headline,
              bio: tutorForm.bio,
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
          headline: updatedTutor.headline || '',
          bio: updatedTutor.bio || '',
        })
      }

      setSuccess('Profile updated successfully!')

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
        headline: false,
        bio: false,
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
    return (
      <div className="my-profile-page">
        <div className="profile-container">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h2>Access Required</h2>
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="my-profile-page">
        <div className="profile-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="my-profile-page">
        <div className="profile-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Error Loading Profile</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="my-profile-page">
        <div className="profile-container">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Profile Data</h2>
            <p>No profile data found.</p>
          </div>
        </div>
      </div>
    )
  }

  const avatarSrc = form.profileImageUrl || DEFAULT_AVATAR

  return (
    <div className="my-profile-page">
      <div className="profile-container">
        {/* Header with Avatar */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <ClickableAvatar
                currentImage={form.profileImageUrl}
                onImageChange={(imageUrl) => {
                  setForm(prev => ({ ...prev, profileImageUrl: imageUrl }))
                }}
                userName={`${form.firstName} ${form.lastName}`}
                currentUser={currentUser}   
                setCurrentUser={setCurrentUser}  
              />
              <div className="profile-header-text">
                <h1 className="profile-name">
                  {form.firstName} {form.lastName}
                </h1>
                <p className="profile-role">
                  {currentUser.role === 'TUTOR' ? 'Tutor' : 'Student'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form className="profile-form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="my-profile-section">
            <div className="section-header">
              <h2 className="section-title">Personal Information</h2>
              <span className="section-subtitle">Your basic account details</span>
            </div>

            <div className="form-grid">

              {/* First Name */}
              <div className="form-field">
                <label className="field-label">
                  First Name
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => toggleEdit('firstName')}
                  >
                    {editing.firstName ? '✓ Done' : '✏️ Edit'}
                  </button>
                </label>
                {editing.firstName ? (
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                ) : (
                  <div className="field-value">{form.firstName}</div>
                )}
              </div>

              {/* Last Name */}
              <div className="form-field">
                <label className="field-label">
                  Last Name
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => toggleEdit('lastName')}
                  >
                    {editing.lastName ? '✓ Done' : '✏️ Edit'}
                  </button>
                </label>
                {editing.lastName ? (
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                ) : (
                  <div className="field-value">{form.lastName}</div>
                )}
              </div>

              {/* Username */}
              <div className="form-field">
                <label className="field-label">
                  Username
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => toggleEdit('userUid')}
                  >
                    {editing.userUid ? '✓ Done' : '✏️ Edit'}
                  </button>
                </label>
                {editing.userUid ? (
                  <>
                    <input
                      type="text"
                      name="userUid"
                      value={form.userUid}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                    <small className="field-hint">Username must be unique</small>
                  </>
                ) : (
                  <div className="field-value">@{form.userUid}</div>
                )}
              </div>

              {/* Birthday */}
              <div className="form-field">
                <label className="field-label">
                  Birthday
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => toggleEdit('birthday')}
                  >
                    {editing.birthday ? '✓ Done' : '✏️ Edit'}
                  </button>
                </label>
                {editing.birthday ? (
                  <input
                    type="date"
                    name="birthday"
                    value={form.birthday}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                ) : (
                  <div className="field-value">
                    {new Date(form.birthday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tutor-only section */}
          {currentUser.role === 'TUTOR' && (
            <div className="my-profile-section tutor-section">
              <div className="section-header">
                <h2 className="section-title">Tutor Profile</h2>
                <span className="section-subtitle">
                  Information visible to students
                </span>
              </div>

              <div className="form-grid">
                {/* Subjects */}
                <div className="form-field full-width">
                  <label className="field-label">
                    Subjects
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => toggleEdit('subjects')}
                    >
                      {editing.subjects ? '✓ Done' : '✏️ Edit'}
                    </button>
                  </label>
                  {editing.subjects ? (
                    <div className="subject-grid">
                      {SUBJECT_OPTIONS.map((subject) => {
                        const selected = tutorForm.subjects.includes(subject)
                        return (
                          <button
                            key={subject}
                            type="button"
                            className={`subject-tag ${selected ? 'selected' : ''}`}
                            onClick={() => toggleSubject(subject)}
                          >
                            {selected && '✓ '}
                            {subject}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="field-value">
                      {tutorForm.subjects.length > 0 ? (
                        <div className="subject-badges">
                          {tutorForm.subjects.map((subject) => (
                            <span key={subject} className="subject-badge">
                              {subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No subjects selected</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Hourly Rate */}
                <div className="form-field">
                  <label className="field-label">
                    Hourly Rate
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => toggleEdit('hourlyRate')}
                    >
                      {editing.hourlyRate ? '✓ Done' : '✏️ Edit'}
                    </button>
                  </label>
                  {editing.hourlyRate ? (
                    <div className="input-with-prefix">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={tutorForm.hourlyRate}
                        onChange={handleTutorChange}
                        className="form-input with-prefix"
                        min="0"
                        step="1"
                        placeholder="40"
                      />
                      <span className="input-suffix">/hour</span>
                    </div>
                  ) : (
                    <div className="field-value price">
                      {tutorForm.hourlyRate
                        ? `$${tutorForm.hourlyRate}/hour`
                        : 'Not set'}
                    </div>
                  )}
                </div>

                {/* Teaching Method */}
                <div className="form-field">
                  <label className="field-label">
                    Teaching Method
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => toggleEdit('teachingMethod')}
                    >
                      {editing.teachingMethod ? '✓ Done' : '✏️ Edit'}
                    </button>
                  </label>
                  {editing.teachingMethod ? (
                    <select
                      name="teachingMethod"
                      value={tutorForm.teachingMethod}
                      onChange={handleTutorChange}
                      className="form-select"
                    >
                      <option value="ONLINE">Online</option>
                      <option value="IN_PERSON">In Person</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  ) : (
                    <div className="field-value">
                      {tutorForm.teachingMethod === 'IN_PERSON'
                        ? 'In Person'
                        : tutorForm.teachingMethod === 'HYBRID'
                        ? 'Hybrid'
                        : 'Online'}
                    </div>
                  )}
                </div>

                {/* Headline */}
                <div className="form-field full-width">
                  <label className="field-label">
                    Headline
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => toggleEdit('headline')}
                    >
                      {editing.headline ? '✓ Done' : '✏️ Edit'}
                    </button>
                  </label>
                  {editing.headline ? (
                    <>
                      <input
                        type="text"
                        name="headline"
                        value={tutorForm.headline}
                        onChange={handleTutorChange}
                        className="form-input"
                        maxLength={255}
                        placeholder="Brief tagline that appears on tutors listing"
                      />
                      <small className="field-hint">
                        Brief summary shown on tutors listing page (max 255 characters)
                      </small>
                    </>
                  ) : (
                    <div className="field-value">
                      {tutorForm.headline || (
                        <span className="text-muted">No headline set</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="form-field full-width">
                  <label className="field-label">
                    Bio
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => toggleEdit('bio')}
                    >
                      {editing.bio ? '✓ Done' : '✏️ Edit'}
                    </button>
                  </label>
                  {editing.bio ? (
                    <>
                      <textarea
                        name="bio"
                        value={tutorForm.bio}
                        onChange={handleTutorChange}
                        className="form-textarea"
                        rows={6}
                        placeholder="Share your teaching experience, philosophy, qualifications, and what makes you unique..."
                      />
                      <small className="field-hint">
                        Detailed bio shown on your tutor profile page. Share your background,
                        teaching philosophy, and what makes you unique.
                      </small>
                    </>
                  ) : (
                    <div className="field-value bio-text">
                      {tutorForm.bio || (
                        <span className="text-muted">No bio written yet</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Information Section */}
          <div className="my-profile-section readonly-section">
            <div className="section-header">
              <h2 className="section-title">Account Information</h2>
              <span className="section-subtitle">Read-only account details</span>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="field-label">Email</label>
                <div className="field-value readonly">
                  {profile.email}
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Account Status</label>
                <div className="field-value readonly">
                  <span className={`status-badge ${profile.status.toLowerCase()}`}>
                    {profile.status}
                  </span>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Member Since</label>
                <div className="field-value readonly">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <span className="alert-message">{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={saving}
              className="submit-btn"
            >
              {saving ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MyProfilePage