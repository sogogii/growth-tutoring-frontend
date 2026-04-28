import { useState } from 'react'
import './styles/AIIntakeModal.css'

const SUBJECTS = [
  'K-12 Math', 'K-12 English', 'Physics', 'Chemistry', 'Biology',
  'Foreign Languages', 'Special Needs Tutoring', 'Pre College Counseling',
  'SAT / ACT Prep', 'AP Courses', 'Other',
]

const GRADE_LEVELS = [
  'Elementary (K–5)', 'Middle School (6–8)', 'High School (9–12)',
  'College / Adult', 'Not sure',
]

const LEARNING_NEEDS = [
  'ADHD', 'Dyslexia', 'Dyscalculia', 'Autism Spectrum',
  'Processing Disorder', 'None / Not Applicable',
]

const METHODS = [
  { value: 'ONLINE',    label: 'Online only' },
  { value: 'IN_PERSON', label: 'In-person only' },
  { value: 'HYBRID',    label: 'Either is fine' },
]

const STEPS = ['Subject', 'Grade', 'Needs', 'Budget & Method']

export default function AIIntakeModal({ isOpen, onClose, onSubmit, loading }) {
  const [step, setStep] = useState(0)
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [learningNeeds, setLearningNeeds] = useState([])
  const [maxBudget, setMaxBudget] = useState(150)
  const [preferredMethod, setPreferredMethod] = useState('HYBRID')
  const [specialNotes, setSpecialNotes] = useState('')

  if (!isOpen) return null

  function toggleNeed(need) {
    setLearningNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    )
  }

  function canAdvance() {
    if (step === 0) return subject !== ''
    if (step === 1) return gradeLevel !== ''
    return true
  }

  function handleSubmit() {
    onSubmit({ subject, gradeLevel, learningNeeds, maxBudget, preferredMethod, specialNotes })
  }

  return (
    <div className="intake-overlay" onClick={onClose}>
      <div className="intake-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="intake-header">
          <div className="intake-header-left">
            <span className="intake-ai-badge">Growth AI Match</span>
            <h2 className="intake-title">Find your perfect tutor</h2>
          </div>
          <button className="intake-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Step indicators */}
        <div className="intake-steps">
          {STEPS.map((label, i) => (
            <div key={label} className={`intake-step-dot ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="intake-dot-circle">{i < step ? '✓' : i + 1}</div>
              <span className="intake-dot-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="intake-body">

          {step === 0 && (
            <div className="intake-step">
              <p className="intake-step-label">What subject do you need help with?</p>
              <div className="intake-chips">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`intake-chip ${subject === s ? 'selected' : ''}`}
                    onClick={() => setSubject(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="intake-step">
              <p className="intake-step-label">What grade level?</p>
              <div className="intake-chips">
                {GRADE_LEVELS.map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`intake-chip ${gradeLevel === g ? 'selected' : ''}`}
                    onClick={() => setGradeLevel(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="intake-step">
              <p className="intake-step-label">Any special learning needs? <span className="intake-optional">(optional)</span></p>
              <div className="intake-chips">
                {LEARNING_NEEDS.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`intake-chip ${learningNeeds.includes(n) ? 'selected' : ''}`}
                    onClick={() => toggleNeed(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="intake-step">
              <p className="intake-step-label">Max hourly budget: <strong>${maxBudget}/hr</strong></p>
              <input
                type="range"
                min={25}
                max={150}
                step={5}
                value={maxBudget}
                onChange={e => setMaxBudget(Number(e.target.value))}
                className="intake-slider"
              />
              <div className="intake-slider-labels">
                <span>$25</span><span>$150</span>
              </div>

              <p className="intake-step-label" style={{ marginTop: '1.5rem' }}>Session format preference</p>
              <div className="intake-chips">
                {METHODS.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    className={`intake-chip ${preferredMethod === m.value ? 'selected' : ''}`}
                    onClick={() => setPreferredMethod(m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <p className="intake-step-label" style={{ marginTop: '1.5rem' }}>
                Anything else we should know? <span className="intake-optional">(optional)</span>
              </p>
              <textarea
                className="intake-textarea"
                placeholder="e.g. prefers a female tutor, needs evening availability, preparing for a specific exam…"
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="intake-footer">
          {step > 0 && (
            <button className="intake-btn-back" onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button
              className="intake-btn-next"
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
            >
              Next
            </button>
          ) : (
            <button
              className="intake-btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Finding matches…' : 'Find my matches'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}