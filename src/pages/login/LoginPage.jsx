// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/SignupPage.css'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '') // remove trailing /

function LoginPage({ setCurrentUser }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Login failed')
      }

      const data = await res.json()

      const userObj = {
        userId: data.userId,
        userUid: data.userUid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role, // should already be "TUTOR" or "STUDENT"
        profileImageUrl: data.profileImageUrl || null,
      }

      if (setCurrentUser) {
        setCurrentUser(userObj)
      }

      localStorage.setItem('currentUser', JSON.stringify(userObj))
      localStorage.setItem('lastActivityAt', String(Date.now()))


      navigate('/') // go to homepage or dashboard
    } catch (err) {
      console.error(err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="auth-eyebrow">Welcome Back</div>
          <h1 className="auth-title">Log in to your account</h1>
          <p className="auth-subtitle">
            Access your tutoring dashboard, manage lessons, and connect with
            students and families.
          </p>

          <ul className="auth-bullet-list">
            <li>
              <span className="auth-bullet-dot" />
              Keep track of your sessions and progress.
            </li>
            <li>
              <span className="auth-bullet-dot" />
              Update your profile and availability anytime.
            </li>
          </ul>

          <p className="auth-secondary-link">
            Don&apos;t have an account? <a href="/signup">Create one</a>
          </p>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="auth-right">
          <h2 className="auth-form-title">Log In</h2>
          <p className="auth-form-caption">Enter your email and password.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
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

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>

            <div className="auth-footer-text">
              <a href="/forgot-password" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}>
                Forgot your password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage