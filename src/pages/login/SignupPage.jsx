import { useState } from 'react'
import './styles/SignupPage.css'

import EducationInput from '../../components/EducationInput'
import TermsOfServiceModal from '../../components/TermsOfServiceModal'

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

// ========== PASSWORD VALIDATION HELPER ==========
function validatePassword(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const isValid = Object.values(requirements).every(req => req)
  
  return { requirements, isValid }
}

function PasswordRequirements({ password, showRequirements }) {
  if (!showRequirements) return null

  const { requirements } = validatePassword(password)

  const requirementsList = [
    { key: 'minLength', label: 'At least 8 characters' },
    { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
    { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
    { key: 'hasNumber', label: 'One number (0-9)' },
    { key: 'hasSpecial', label: 'One special character (!@#$%^&*)' },
  ]

  return (
    <div className="password-requirements">
      <p className="requirements-title">Password must contain:</p>
      <ul className="requirements-list">
        {requirementsList.map(({ key, label }) => (
          <li
            key={key}
            className={`requirement-item ${requirements[key] ? 'met' : 'unmet'}`}
          >
            <span className="requirement-icon">
              {requirements[key] ? '✓' : '○'}
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SignupPage({ fixedRole }) {
  const [step, setStep] = useState(1) // 1: Form, 2: Verification
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: '',
    userUid: '',
    subjects: [],
    education: ''
  })

  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [education, setEducation] = useState('')

  const roleToSend = fixedRole || 'TUTOR'
  const roleLabel = roleToSend === 'TUTOR' ? 'Tutor' : 'Student'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Show requirements when user starts typing password
    if (name === 'password' && !showPasswordRequirements) {
      setShowPasswordRequirements(true)
    }
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

  // Step 1: Submit form and send verification email
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate password complexity
    const { isValid } = validatePassword(form.password)
    if (!isValid) {
      setError('Password does not meet complexity requirements.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (roleToSend === 'TUTOR' && form.subjects.length === 0) {
      setError('Please select at least one subject you can teach.')
      return
    }

    if (roleToSend === 'TUTOR' && !form.education.trim()) {
      setError('Please provide your educational background.')
      return
    }

    if (!termsAccepted) {
      setError('You must accept the Terms of Service to continue.')
      return
    }

    setLoading(true)

    try {
      // Send verification code
      const res = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to send verification code')
      }

      setSuccess('Verification code sent to your email!')
      setStep(2) // Move to verification step
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify code and complete signup
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Verify the code
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          code: verificationCode,
        }),
      })

      if (!verifyRes.ok) {
        const text = await verifyRes.text()
        throw new Error(text || 'Invalid verification code')
      }

      // Now complete the signup
      const signupRes = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          birthday: form.birthday,
          role: roleToSend,
          userUid: form.userUid,
          subjectLabel:
            roleToSend === 'TUTOR' ? form.subjects.join(', ') : null,
          education: roleToSend === 'TUTOR' ? form.education : null,
        }),
      })

      if (!signupRes.ok) {
        const text = await signupRes.text()
        throw new Error(text || 'Signup failed')
      }

      const data = await signupRes.json()
      console.log('Signed up:', data)

      setSuccess('Account created successfully! You can now log in.')
      
      // Reset form
      setForm((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }))
      setVerificationCode('')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to resend code')
      }

      setSuccess('New verification code sent!')
    } catch (err) {
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
          <div className="auth-eyebrow">Create Account</div>
          <h1 className="auth-title">Sign up as {roleLabel}</h1>
          <p className="auth-subtitle">
            {step === 1 
              ? `Join Growth Tutoring and connect with ${roleToSend === 'TUTOR' ? 'families' : 'tutors'}.`
              : 'Enter the verification code sent to your email.'
            }
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

          {/* Tutor-specific notices - ONLY for tutors */}
          {roleToSend === 'TUTOR' && step === 1 && (
            <div className="auth-notice-box">
              <div className="auth-notice-item auth-notice-warning">
                <strong>Account Approval Required:</strong> Your profile will require admin approval after signup and won't be visible 
                in our tutor directory until an administrator reviews and activates your account.
              </div>
              <div className="auth-notice-item auth-notice-alert">
                <strong>Applications Currently Closed:</strong> We are not currently accepting new tutor applications. 
                If you have questions, please contact us at <a href="mailto:info@growthtutoringhq.com">info@growthtutoringhq.com</a>.
              </div>
            </div>
          )}

          <p className="auth-secondary-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="auth-right">
          {step === 1 ? (
            <>
              <h2 className="auth-form-title">Create your account</h2>
              <p className="auth-form-caption">
                Fill in your details below to get started.
              </p>

              <form className="auth-form" onSubmit={handleSubmitForm}>
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
                      onFocus={() => setShowPasswordRequirements(true)}
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

                {/* Password Requirements Display */}
                <PasswordRequirements 
                  password={form.password} 
                  showRequirements={showPasswordRequirements}
                />

                {roleToSend === 'TUTOR' && (
                  <>
                  <div className="auth-field">
                    <label htmlFor="education">
                      Educational Background <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <EducationInput
                      value={form.education}
                      onChange={(value) => setForm(prev => ({ ...prev, education: value }))}
                      required={true}
                      placeholder="e.g., Bachelor of Science in Biology, University of California, Irvine"
                    />
                  </div>
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
                  </>
                )}

                {/* Terms of Service Checkbox */}
                <div className="signup-terms-container">
                  <label className="signup-terms-label">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked)
                        setError(null)
                      }}
                      className="signup-terms-checkbox"
                    />
                    <span className="signup-terms-text">
                      I agree to the{' '}
                      <button
                        type="button"
                        className="signup-terms-link"
                        onClick={() => setShowTermsModal(true)}
                      >
                        Terms of Service
                      </button>
                      <span style={{color: '#ef4444'}}>    *</span>
                    </span>
                  </label>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Sending code…' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="auth-form-title">Verify your email</h2>
              <p className="auth-form-caption">
                We sent a 6-digit code to <strong>{form.email}</strong>
              </p>

              <form className="auth-form" onSubmit={handleVerifyCode}>
                <div className="auth-field">
                  <label htmlFor="verificationCode">Verification Code</label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    style={{
                      fontSize: '24px',
                      textAlign: 'center',
                      letterSpacing: '8px'
                    }}
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button type="submit" disabled={loading || verificationCode.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify & Create Account'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c3aed',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Resend code
                  </button>
                  {' | '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setVerificationCode('')
                      setError(null)
                      setSuccess(null)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c3aed',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Change email
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  )
}

export default SignupPage