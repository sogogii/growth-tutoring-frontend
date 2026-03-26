import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/AdminPromotionsPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

// Converts contentEditable innerHTML to clean HTML for the email
function sanitizeHtml(html) {
  return html
    .replace(/<div><br><\/div>/g, '</p><p>')
    .replace(/<div>/g, '</p><p>')
    .replace(/<\/div>/g, '')
    .replace(/<br>/g, '<br>')
    .trim()
}

function AdminPromotionsPage({ currentUser }) {
  const navigate = useNavigate()
  const editorRef = useRef(null)

  const [promoSubject, setPromoSubject] = useState('')
  const [promoHeadline, setPromoHeadline] = useState('')
  const [promoSending, setPromoSending] = useState(false)
  const [promoResult, setPromoResult] = useState(null)
  const [promoError, setPromoError] = useState(null)
  const [recipientCount, setRecipientCount] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const adminUserId = currentUser?.userId

  if (!currentUser || currentUser.role !== 'ADMIN') {
    navigate('/')
    return null
  }

  // Toolbar formatting commands
  const format = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const insertLink = () => {
    const url = window.prompt('Enter the URL:')
    if (url) format('createLink', url)
  }

  const handlePreviewRecipients = async () => {
    setPreviewLoading(true)
    setPromoError(null)
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/promotions/recipients`,
        { credentials: 'include' }
      )
      const data = await res.json()
      setRecipientCount(data.count)
    } catch (err) {
      setPromoError('Failed to load recipient count.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSendPromotion = async () => {
    const bodyHtml = sanitizeHtml(editorRef.current?.innerHTML || '')

    if (!promoSubject.trim() || !promoHeadline.trim() || !bodyHtml.trim() || bodyHtml === '<br>') {
      setPromoError('Please fill in all three fields before sending.')
      return
    }

    const confirmed = window.confirm(
      `You are about to send a promotion email to ${recipientCount ?? 'all opted-in'} users. Continue?`
    )
    if (!confirmed) return

    setPromoSending(true)
    setPromoResult(null)
    setPromoError(null)

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/promotions/send?adminUserId=${adminUserId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: promoSubject,
            headline: promoHeadline,
            credentials: 'include',
            bodyHtml: `<p>${bodyHtml}</p>`,
          }),
        }
      )
      const data = await res.json()
      setPromoResult(data)
      setPromoSubject('')
      setPromoHeadline('')
      if (editorRef.current) editorRef.current.innerHTML = ''
      setRecipientCount(null)
    } catch (err) {
      setPromoError('Failed to send promotion email. Please try again.')
    } finally {
      setPromoSending(false)
    }
  }

  return (
    <div className="promotions-page">
      <div className="promotions-container">

        {/* Header */}
        <div className="promotions-header">
          <button className="promotions-back-btn" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </button>
          <h1 className="promotions-title">Send Promotion Email</h1>
          <p className="promotions-subtitle">
            Sends to all active users who opted in to marketing emails at signup or in their profile settings.
          </p>
        </div>

        {/* Card */}
        <div className="promotions-card">

          {/* Preview Recipients */}
          <div className="promotions-preview-bar">
            <button
              className="promotions-preview-btn"
              onClick={handlePreviewRecipients}
              disabled={previewLoading}
            >
              {previewLoading ? 'Loading...' : 'Preview Recipients'}
            </button>
            <span className="promotions-preview-text">
              {recipientCount !== null
                ? <strong>{recipientCount} opted-in user{recipientCount !== 1 ? 's' : ''} will receive this email</strong>
                : 'Click to see how many users will receive this email before sending.'}
            </span>
          </div>

          {/* Subject */}
          <div className="promotions-field">
            <label className="promotions-label">
              Subject Line <span className="promotions-required">*</span>
            </label>
            <input
              type="text"
              className="promotions-input"
              value={promoSubject}
              onChange={(e) => setPromoSubject(e.target.value)}
              placeholder="e.g. New Feature: Gamified Learning is Here!"
            />
          </div>

          {/* Headline */}
          <div className="promotions-field">
            <label className="promotions-label">
              Headline <span className="promotions-required">*</span>
            </label>
            <input
              type="text"
              className="promotions-input"
              value={promoHeadline}
              onChange={(e) => setPromoHeadline(e.target.value)}
              placeholder="e.g. Earn points, unlock rewards, and level up your learning"
            />
            <small className="promotions-hint">
              Shown as a bold subheading at the top of the email.
            </small>
          </div>

          {/* Rich Text Body */}
          <div className="promotions-field">
            <label className="promotions-label">
              Email Body <span className="promotions-required">*</span>
            </label>

            {/* Toolbar */}
            <div className="promotions-toolbar">
              <button type="button" className="toolbar-btn" onClick={() => format('bold')} title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" className="toolbar-btn" onClick={() => format('italic')} title="Italic">
                <em>I</em>
              </button>
              <button type="button" className="toolbar-btn" onClick={() => format('underline')} title="Underline">
                <u>U</u>
              </button>
              <div className="toolbar-divider" />
              <button type="button" className="toolbar-btn" onClick={() => format('insertUnorderedList')} title="Bullet list">
                • List
              </button>
              <button type="button" className="toolbar-btn" onClick={insertLink} title="Insert link">
                Link
              </button>
              <div className="toolbar-divider" />
              <button type="button" className="toolbar-btn" onClick={() => format('removeFormat')} title="Clear formatting">
                Clear
              </button>
            </div>

            {/* Editable area */}
            <div
              ref={editorRef}
              className="promotions-editor"
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Write your email message here. Use the toolbar above to bold text, add bullet points, or insert links."
            />
            <small className="promotions-hint">
              Select text, then click a toolbar button to format it.
            </small>
          </div>

          {/* Error */}
          {promoError && (
            <div className="promotions-error">{promoError}</div>
          )}

          {/* Success */}
          {promoResult && (
            <div className="promotions-success">
              <div className="promotions-success-title">Promotion email sent successfully!</div>
              <div className="promotions-success-detail">
                Sent to <strong>{promoResult.sent}</strong> user{promoResult.sent !== 1 ? 's' : ''}
                {promoResult.failed > 0 && (
                  <span className="promotions-failed-count"> · {promoResult.failed} failed</span>
                )}
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            className="promotions-send-btn"
            onClick={handleSendPromotion}
            disabled={promoSending}
          >
            {promoSending ? 'Sending...' : 'Send Promotion Email'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default AdminPromotionsPage