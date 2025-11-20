import { useState } from 'react'

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

function SignupPage({ fixedRole }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: '',
    userUid: '',
    subjects: [], // for tutors only
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const roleToSend = fixedRole || 'TUTOR'
  const roleLabel = roleToSend === 'STUDENT' ? 'Student' : 'Tutor'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  // Toggle subject on/off when button is clicked
  const toggleSubject = (subject) => {
    setForm((prev) => {
      const exists = prev.subjects.includes(subject)
      const subjects = exists
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject]
      return { ...prev, subjects }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!form.birthday) {
      setError('Please enter your birthday')
      return
    }

    if (!form.userUid.trim()) {
      setError('Please choose a User ID')
      return
    }

    if (roleToSend === 'TUTOR' && form.subjects.length === 0) {
      setError('Please select at least one subject you can teach')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          birthday: form.birthday, // "YYYY-MM-DD"
          password: form.password,
          role: roleToSend,        // TUTOR or STUDENT
          userUid: form.userUid,
          subjectLabel:
            roleToSend === 'TUTOR'
              ? form.subjects.join(', ')
              : null,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Signup failed')
      }

      const data = await res.json()
      console.log('Signed up:', data)
      setSuccess('Account created! You can log in now.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <h1>Sign up as {roleLabel}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-row">
          <label>First name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-row">
          <label>Last name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-row">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-row">
          <label>User ID (username)</label>
          <input
            name="userUid"
            value={form.userUid}
            onChange={handleChange}
            placeholder="e.g. sungok123"
            required
          />
        </div>

        <div className="auth-row">
          <label>Birthday</label>
          <input
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-row">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-row">
          <label>Confirm password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* TUTOR-ONLY SUBJECT TOGGLES */}
        {roleToSend === 'TUTOR' && (
          <div className="auth-row">
            <label>Subjects you can teach</label>
            <div className="subject-toggle-group">
              {SUBJECT_OPTIONS.map((subject) => {
                const selected = form.subjects.includes(subject)
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
            <small className="field-hint">
              Click to select or unselect each subject.
            </small>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

export default SignupPage
