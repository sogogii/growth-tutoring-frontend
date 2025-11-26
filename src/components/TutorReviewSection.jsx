import { useEffect, useState } from 'react'
import './styles/TutorReviewsSection.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * TutorReviewsSection
 *
 * Props:
 *  - tutorUserId: the user_id of the tutor (NOT the student)
 *  - currentUser: { userId, role, ... } or null
 */
function TutorReviewsSection({ tutorUserId, currentUser }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [myRating, setMyRating] = useState('')
  const [myComment, setMyComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)

  const isStudent = currentUser?.role === 'STUDENT'

  useEffect(() => {
    if (!tutorUserId) return
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorUserId])

  async function fetchReviews() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_BASE}/api/tutors/user/${tutorUserId}/reviews`
      )
      if (!res.ok) {
        throw new Error('Failed to load reviews')
      }
      const data = await res.json()
      setReviews(data || [])

      // If the logged-in student already left a review, prefill their rating/comment
      if (currentUser && currentUser.role === 'STUDENT') {
        const mine = data.find(
          (r) => r.studentUserId === currentUser.userId
        )
        if (mine) {
          setMyRating(String(mine.rating))
          setMyComment(mine.comment || '')
        } else {
          setMyRating('')
          setMyComment('')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!isStudent) {
      setError('Only students can leave reviews.')
      return
    }

    if (!myRating) {
      setError('Please select a rating.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(
        `${API_BASE}/api/tutors/user/${tutorUserId}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.userId, // student’s user id
            rating: Number(myRating),
            comment: myComment.trim(),
          }),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to save review')
      }

      setSuccess('Your review has been saved.')
      await fetchReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const ratingCount = reviews.length
  const avg =
    ratingCount === 0
      ? null
      : (
          reviews.reduce((sum, r) => sum + Number(r.rating), 0) / ratingCount
        ).toFixed(1)

  return (
    <section className="tutor-reviews-section">
      <div className="reviews-header">
        <h2>Student Reviews</h2>
        <div className="reviews-summary">
          {ratingCount === 0 ? (
            <span className="no-reviews">No reviews yet</span>
          ) : (
            <>
              <span className="avg-rating">
                <span className="stars">★</span> {avg}/5.0
              </span>
              <span className="count-rating">
                ({ratingCount} review{ratingCount !== 1 ? 's' : ''})
              </span>
            </>
          )}
        </div>
      </div>

      {error && <p className="reviews-error">{error}</p>}
      {success && <p className="reviews-success">{success}</p>}

      {/* ----- Review form for students ----- */}
      {isStudent && currentUser && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-row">
            <label>Rate this tutor</label>
            <select
              value={myRating}
              onChange={(e) => setMyRating(e.target.value)}
            >
              <option value="">Select rating</option>
              {/* 1.0 to 5.0 with 0.5 steps */}
              {Array.from({ length: 9 }).map((_, i) => {
                const value = 1 + i * 0.5
                return (
                  <option key={value} value={value.toFixed(1)}>
                    {value.toFixed(1)} / 5.0
                  </option>
                )
              })}
            </select>
          </div>

          <div className="review-form-row">
            <label>Comment (optional)</label>
            <textarea
              rows={3}
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Share how this tutor helped you..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="review-submit"
          >
            {saving ? 'Saving…' : 'Submit review'}
          </button>
        </form>
      )}

      {!isStudent && (
        <p className="reviews-hint">
          Log in as a student to leave a review.
        </p>
      )}

      {/* ----- List of existing reviews ----- */}
      <div className="reviews-list">
        {reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-card-top">
              <div className="review-rating">
                <span className="stars">★</span> {Number(r.rating).toFixed(1)}
              </div>
              <div className="review-author">
                {r.studentFirstName
                  ? `${r.studentFirstName} ${r.studentLastName || ''}`.trim()
                  : 'Student'}
              </div>
            </div>
            {r.comment && (
              <p className="review-comment">
                {r.comment}
              </p>
            )}
            {r.createdAt && (
              <div className="review-date">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="reviews-empty">
            No one has reviewed this tutor yet.
          </div>
        )}
      </div>
    </section>
  )
}

export default TutorReviewsSection
