import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './styles/SessionReportPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const SUBJECTS = [
  'K-12 Math', 'Algebra', 'Geometry', 'Calculus',
  'K-12 English', 'Essay Writing', 'Reading Comprehension',
  'Physics', 'Chemistry', 'Biology',
  'Foreign Languages', 'SAT / ACT Prep', 'AP Courses',
  'Special Needs Support', 'Study Skills', 'Other',
]

const CHALLENGES = [
  'Focus / attention', 'Concept understanding', 'Test anxiety',
  'Homework completion', 'Reading fluency', 'Math computation',
  'Writing organization', 'Memory / recall', 'Motivation', 'None noted',
]

export default function SessionReportPage({ currentUser }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const sessionId   = searchParams.get('sessionId')   ? Number(searchParams.get('sessionId'))   : null
  const studentId   = searchParams.get('studentId')   ? Number(searchParams.get('studentId'))   : null
  const studentName = searchParams.get('studentName') || 'Student'

  const [templates, setTemplates]       = useState([])
  const [templateId, setTemplateId]     = useState(null)
  const [score, setScore]               = useState(7)
  const [subjects, setSubjects]         = useState([])
  const [challenges, setChallenges]     = useState([])
  const [freeText, setFreeText]         = useState('')
  const [preview, setPreview]           = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [submitLoading, setSubmitLoading]   = useState(false)
  const [error, setError]               = useState(null)
  const [success, setSuccess]           = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/reports/templates`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setTemplates(data)
        const def = data.find(t => t.isDefault)
        if (def) setTemplateId(def.id)
      })
      .catch(() => {})
  }, [])

  function toggleSubject(s) {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function toggleChallenge(c) {
    setChallenges(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  function buildBody(isSubscribed = false) {
    return {
      studentUserId: studentId,
      sessionId,
      templateId,
      performanceScore: score,
      subjectsCovered: subjects,
      challenges,
      freeText: freeText.trim() || null,
      isSubscribed,
    }
  }

  async function handlePreview() {
    if (subjects.length === 0) { setError('Please select at least one subject.'); return }
    setError(null)
    setPreviewLoading(true)
    setPreview('')
    try {
      const res = await fetch(`${API_BASE}/api/reports/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(buildBody()),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Preview failed')
      setPreview(data.narrative)
    } catch (e) {
      setError(e.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleSubmit() {
    if (subjects.length === 0) { setError('Please select at least one subject.'); return }
    setError(null)
    setSubmitLoading(true)
    try {
      const isSubscribed = currentUser?.subscribed || false
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(buildBody(isSubscribed)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Submission failed')
      setSuccess(true)
      setTimeout(() => navigate('/sessions'), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (success) {
    return (
      <div className="report-page">
        <div className="report-success">
          <div className="report-success-icon">✓</div>
          <h2>Report submitted!</h2>
          <p>The session report for {studentName} has been saved and sent.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="report-page">
      <div className="report-container">

        <div className="report-header">
          <span className="report-ai-badge">AI Progress Report</span>
          <h1 className="report-title">Session report — {studentName}</h1>
          <p className="report-subtitle">Fill in the details below and AI will generate a professional narrative for the parent.</p>
        </div>

        {/* Performance Score */}
        <section className="report-section">
          <label className="report-label">Overall performance</label>
          <div className="report-score-row">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="report-slider"
            />
            <div className={`report-score-badge ${score >= 8 ? 'great' : score >= 5 ? 'good' : 'needs-work'}`}>
              {score}/10
            </div>
          </div>
          <div className="report-scale-labels">
            <span>Needs improvement</span><span>Excellent</span>
          </div>
        </section>

        {/* Subjects */}
        <section className="report-section">
          <label className="report-label">Subjects covered <span className="report-required">*</span></label>
          <div className="report-chips">
            {SUBJECTS.map(s => (
              <button
                key={s}
                type="button"
                className={`report-chip ${subjects.includes(s) ? 'selected' : ''}`}
                onClick={() => toggleSubject(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Challenges */}
        <section className="report-section">
          <label className="report-label">Challenges observed <span className="report-optional">(optional)</span></label>
          <div className="report-chips">
            {CHALLENGES.map(c => (
              <button
                key={c}
                type="button"
                className={`report-chip challenge ${challenges.includes(c) ? 'selected' : ''}`}
                onClick={() => toggleChallenge(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Template */}
        <section className="report-section">
          <label className="report-label">Report style</label>
          <div className="report-template-row">
            {templates.map(t => (
              <button
                key={t.id}
                type="button"
                className={`report-template-btn ${templateId === t.id ? 'selected' : ''}`}
                onClick={() => setTemplateId(t.id)}
              >
                {t.name}
                {t.isDefault && <span className="report-default-tag">default</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Free text */}
        <section className="report-section">
          <label className="report-label">Additional notes <span className="report-optional">(optional)</span></label>
          <textarea
            className="report-textarea"
            placeholder="Any extra context for the parent — homework assigned, upcoming goals, specific moments of breakthrough…"
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            rows={4}
          />
        </section>

        {/* Error */}
        {error && <p className="report-error">{error}</p>}

        {/* AI Preview */}
        {preview && (
          <section className="report-preview">
            <div className="report-preview-header">
              <span className="report-ai-badge small">AI Draft</span>
              <span className="report-preview-hint">Review and submit below</span>
            </div>
            <p className="report-preview-text">{preview}</p>
          </section>
        )}

        {/* Actions */}
        <div className="report-actions">
          <button
            className="report-btn-preview"
            onClick={handlePreview}
            disabled={previewLoading || subjects.length === 0}
          >
            {previewLoading ? 'Generating…' : preview ? 'Regenerate preview' : 'Preview AI report'}
          </button>
          <button
            className="report-btn-submit"
            onClick={handleSubmit}
            disabled={submitLoading || subjects.length === 0}
          >
            {submitLoading ? 'Submitting…' : 'Submit report'}
          </button>
        </div>

      </div>
    </div>
  )
}