import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import './styles/ContactPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LfiZJYqAAAAABfYL-6eKswDG0RBEJoBZrEGa_ta'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024 // 20MB total

function ContactPage() {
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', comment: '' })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const recaptchaRef = useRef(null)
  const fileInputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    
    // Validate individual file sizes
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds the 10MB limit.`)
        return
      }
    }

    // Validate total size
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      setError('Total file size exceeds 20MB. Please remove some files.')
      return
    }

    setFiles(selectedFiles)
    setError('')
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!feedbackForm.name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!feedbackForm.email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!feedbackForm.comment.trim()) {
      setError('Please enter your feedback.')
      return
    }

    const recaptchaToken = recaptchaRef.current.getValue()
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.')
      return
    }

    setLoading(true)

    try {
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: reader.result.split(',')[1]
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      const attachments = await Promise.all(filePromises)

      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackForm,
          recaptchaToken,
          attachments
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to submit feedback')
      }

      setSuccess('Thank you for your feedback! We will get back to you soon.')
      setFeedbackForm({ name: '', email: '', comment: '' })
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      recaptchaRef.current.reset()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-subtitle">
            We're here to help with any questions about tutoring, scheduling, or our platform
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="contact-container">
        
        {/* Contact Information Section */}
        <section className="contact-info-section">
          <div className="contact-info-grid">
            
            {/* Email Card */}
            <div className="contact-info-card">
              <div className="contact-info-icon contact-email-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h3 className="contact-info-title">Email Us</h3>
              <a href="mailto:info@growthtutoringhq.com" className="contact-info-value">
                info@growthtutoringhq.com
              </a>
              <p className="contact-info-note">
                Response time: 3-5 business days
              </p>
            </div>

            {/* Phone Card */}
            <div className="contact-info-card">
              <div className="contact-info-icon contact-phone-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3 className="contact-info-title">Call Us</h3>
              <a href="tel:+19492320738" className="contact-info-value">
                +1 (949) 232-0738
              </a>
              <p className="contact-info-note">
                Monday–Friday, 9am–5pm PST
              </p>
            </div>

            {/* AI Chatbox Card */}
            <div className="contact-info-card contact-ai-card">
              <div className="contact-info-icon contact-ai-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="contact-info-title">Growth AI Chatbox</h3>
              <p className="contact-ai-description">
                Ask questions about subjects, scheduling, or tutoring. Your AI assistant is coming soon.
              </p>
              <span className="contact-coming-soon-badge">Coming Soon</span>
            </div>

          </div>
        </section>

        {/* Feedback Form Section */}
        <section className="contact-feedback-section">
          <div className="contact-section-header">
            <h2 className="contact-section-title">Send Us Feedback</h2>
            <div className="contact-section-line"></div>
          </div>

          <div className="contact-form-container">
            {error && (
              <div className="contact-alert contact-alert-error">
                <span className="contact-alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="contact-alert contact-alert-success">
                <span className="contact-alert-icon">✓</span>
                <span>{success}</span>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-form-field">
                  <label className="contact-form-label">Name</label>
                  <input
                    type="text"
                    className="contact-form-input"
                    placeholder="Your name"
                    value={feedbackForm.name}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="contact-form-field">
                  <label className="contact-form-label">Email</label>
                  <input
                    type="email"
                    className="contact-form-input"
                    placeholder="your.email@example.com"
                    value={feedbackForm.email}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="contact-form-field">
                <label className="contact-form-label">Message</label>
                <textarea
                  className="contact-form-textarea"
                  placeholder="Tell us how we can help..."
                  rows={6}
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  required
                />
              </div>

              {/* File attachment */}
              <div className="contact-file-section">
                <label className="contact-file-label">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="contact-file-input-hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                  />
                  <span className="contact-file-button">
                    📎 Attach Files (Optional)
                  </span>
                </label>
                <p className="contact-file-hint">
                  Max 10MB per file, 20MB total • Supported: JPG, PNG, PDF, DOC, TXT
                </p>
              </div>

              {/* Display selected files */}
              {files.length > 0 && (
                <div className="contact-file-list">
                  {files.map((file, index) => (
                    <div key={index} className="contact-file-item">
                      <div className="contact-file-info">
                        <span className="contact-file-name">{file.name}</span>
                        <span className="contact-file-size">{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        className="contact-file-remove"
                        onClick={() => removeFile(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* reCAPTCHA */}
              <div className="contact-recaptcha">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="contact-submit-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  )
}

export default ContactPage