import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/SignupPage.css'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '')

function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1 = enter email, 2 = enter code, 3 = enter new password
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to send reset code')
      }

      setSuccess('Reset code sent to your email!')
      setTimeout(() => {
        setStep(2)
        setSuccess(null)
      }, 1500)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: resetCode }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Invalid or expired code')
      }

      setSuccess('Code verified!')
      setTimeout(() => {
        setStep(3)
        setSuccess(null)
      }, 1000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: resetCode,
          newPassword,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to reset password')
      }

      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to resend code')
      }

      setSuccess('New code sent!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="auth-eyebrow">Account Recovery</div>
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">
            {step === 1 && "Enter your email address and we'll send you a verification code to reset your password."}
            {step === 2 && "Enter the 6-digit code we sent to your email."}
            {step === 3 && "Create a new password for your account."}
          </p>

          <ul className="auth-bullet-list">
            <li>
              <span className="auth-bullet-dot" />
              Secure password reset process
            </li>
            <li>
              <span className="auth-bullet-dot" />
              Code expires in 3 minutes
            </li>
          </ul>

          <p className="auth-secondary-link">
            Remember your password? <a href="/login">Log in</a>
          </p>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="auth-right">
          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <>
              <h2 className="auth-form-title">Enter your email</h2>
              <p className="auth-form-caption">
                We'll send a verification code to this email.
              </p>

              <form className="auth-form" onSubmit={handleRequestReset}>
                <div className="auth-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset code'}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: Enter Verification Code */}
          {step === 2 && (
            <>
              <h2 className="auth-form-title">Enter verification code</h2>
              <p className="auth-form-caption">
                Check your email for the 6-digit code.
              </p>

              <form className="auth-form" onSubmit={handleVerifyCode}>
                <div className="auth-field">
                  <label htmlFor="resetCode">Verification Code</label>
                  <input
                    id="resetCode"
                    name="resetCode"
                    type="text"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="000000"
                    required
                    style={{
                      fontSize: '24px',
                      letterSpacing: '8px',
                      textAlign: 'center',
                    }}
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button type="submit" disabled={loading || resetCode.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify code'}
                </button>

                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c3aed',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline',
                    }}
                  >
                    Resend code
                  </button>
                  {' • '}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c3aed',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline',
                    }}
                  >
                    Change email
                  </button>
                </div>
              </form>
            </>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <>
              <h2 className="auth-form-title">Create new password</h2>
              <p className="auth-form-caption">
                Enter a new password for your account.
              </p>

              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="auth-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage