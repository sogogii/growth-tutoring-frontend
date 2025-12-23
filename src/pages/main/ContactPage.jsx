import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import './styles/ContactPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY'

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 20 * 1024 * 1024 // 20MB total for all files
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

function ContactPage() {
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    comment: ''
  })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const recaptchaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    
    // Validate file types
    const invalidFiles = selectedFiles.filter(
      file => !ALLOWED_FILE_TYPES.includes(file.type)
    )
    
    if (invalidFiles.length > 0) {
      setError(`Invalid file type. Allowed types: JPG, PNG, GIF, PDF, DOC, DOCX, TXT`)
      return
    }
    
    // Validate individual file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      setError(`File too large. Maximum size per file: 10MB`)
      return
    }
    
    // Validate total size
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      setError(`Total file size too large. Maximum total: 20MB`)
      return
    }
    
    setFiles(selectedFiles)
    setError(null)
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate required fields
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

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current.getValue()
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.')
      return
    }

    setLoading(true)

    try {
      // Convert files to base64
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: reader.result.split(',')[1] // Remove data URL prefix
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
      {/* Top banner */}
      <section className="contact-hero">
        <h1>Contact Us</h1>
      </section>

      {/* Email + Phone + AI assistant */}
      <section className="contact-row">
        <div className="contact-left">
          <h2>
            Email:{" "}
            <span className="contact-inline">info@growthtutoringhq.com</span>
          </h2>
          <p className="contact-note">
            Please note that it may take 3–5 business days for us to get back to you.
            For more urgent questions, call our official number or use our Growth AI chatbox.
          </p>

          <h2>
            Phone Number:{" "}
            <span className="contact-inline">+1 (949)520–0269</span>
          </h2>
          <p className="contact-note">
            We are currently available Monday–Friday, 9am–5pm.
          </p>
        </div>

        <div className="contact-right">
          <h2 className="contact-ai-title">Growth AI</h2>
          <p className="contact-ai-desc">
            We use a simple matching process to pair students with tutors who fit their learning style.
            After each session, tutors send a structured progress report to parents.
          </p>

          <div className="contact-ai-card">
            <div className="contact-ai-icon">💬</div>
            <h3>Growth Chatbox</h3>
            <p>
              Ask questions about subjects, scheduling, or tutoring.  
              Your future AI assistant can live here on the website.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback form */}
      <section className="contact-feedback">
        <h2>Leave a Feedback</h2>

        {error && (
          <div className="feedback-message feedback-error">
            {error}
          </div>
        )}

        {success && (
          <div className="feedback-message feedback-success">
            {success}
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="contact-input"
            placeholder="Your name"
            value={feedbackForm.name}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
            required
          />

          <input
            type="email"
            className="contact-input"
            placeholder="Your email"
            value={feedbackForm.email}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
            required
          />

          <textarea
            className="contact-textarea"
            placeholder="Add your comments..."
            rows={5}
            value={feedbackForm.comment}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
            required
          />

          {/* File attachment section */}
          <div className="file-attachment-section">
            <label className="file-input-label">
              <input
                ref={fileInputRef}
                type="file"
                className="file-input-hidden"
                multiple
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
              />
              <span className="file-input-button">
                📎 Attach Files (Optional)
              </span>
            </label>
            <p className="file-input-hint">
              Max 10MB per file, 20MB total. Supported: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
            </p>
          </div>

          {/* Display selected files */}
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="recaptcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
            />
          </div>

          <button 
            type="submit" 
            className="contact-submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ContactPage