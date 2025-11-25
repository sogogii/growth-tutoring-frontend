// src/pages/SignupPage.jsx
import { useState } from 'react'
import './styles/SignupPage.css'

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

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '')

function SignupPage({ fixedRole }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: '',
    userUid: '',
    subjects: [],
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const roleToSend = fixedRole || 'TUTOR'
  const roleLabel = roleToSend === 'TUTOR' ? 'Tutor' : 'Student'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleSubject = (subject) => {
    setForm((prev) => {
      const already = prev.subjects.includes(subject)
      return {
        ...prev,
        subjects: already
          ? prev.subjects.filter((s) => s !== subject)
          : [...prev.subjects, subject],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (roleToSend === 'TUTOR' && form.subjects.length === 0) {
      setError('Please select at least one subject you can teach.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          birthday: form.birthday, // "YYYY-MM-DD"
          role: roleToSend,        // matches SignupRequest.role
          userUid: form.userUid,
          subjectLabel:
            roleToSend === 'TUTOR' ? form.subjects.join(', ') : null,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Signup failed')
      }

      const data = await res.json()
      console.log('Signed up:', data)

      setSuccess('Account created! You can now log in.')
      setForm((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }))
    } catch (err) {
      console.error(err)
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="auth-eyebrow">Create Account</div>
          <h1 className="auth-title">Sign up as {roleLabel}</h1>
          <p className="auth-subtitle">
            Join Growth Tutoring and connect with families looking for
            high-quality {roleToSend === 'TUTOR' ? 'tutoring' : 'support'}.
          </p>

          <ul className="auth-bullet-list">
            <li>
              <span className="auth-bullet-dot" />
              Build strong, long-term learning relationships.
            </li>
            <li>
              <span className="auth-bullet-dot" />
              Flexible sessions that fit your schedule.
            </li>
          </ul>

          <p className="auth-secondary-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="auth-right">
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-caption">
            Fill in your details below to get started.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="userUid">User ID (username)</label>
              <input
                id="userUid"
                name="userUid"
                type="text"
                placeholder="e.g. sungok123"
                value={form.userUid}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="birthday">Birthday</label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                value={form.birthday}
                onChange={handleChange}
                required
              />
              <div className="auth-helper">
                This helps us verify age-appropriate tutoring.
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {roleToSend === 'TUTOR' && (
              <div className="auth-field">
                <label>Subjects you can teach</label>
                <div className="subjects-grid">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const isSelected = form.subjects.includes(subj)
                    return (
                      <button
                        type="button"
                        key={subj}
                        className={`subject-pill ${
                          isSelected ? 'is-selected' : ''
                        }`}
                        onClick={() => toggleSubject(subj)}
                      >
                        {subj}
                      </button>
                    )
                  })}
                </div>
                <div className="auth-helper">
                  Click to select or unselect each subject.
                </div>
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing up…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
