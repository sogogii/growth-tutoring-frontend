import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './styles/TutorProfilePage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function formatJoined(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]

  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

function formatTeachingMethod(method) {
  if (!method) return ''
  switch (method) {
    case 'ONLINE': return 'Online'
    case 'IN_PERSON': return 'In-Person'
    case 'HYBRID': return 'Hybrid'
    default:
      return method.charAt(0) + method.slice(1).toLowerCase()
  }
}

function StarRating({ rating }) {
  const value = Math.round(rating ?? 0)
  const clamped = Math.max(0, Math.min(5, value))
  return (
    <span className="tutor-profile-rating">
      {'★'.repeat(clamped)}
      {'☆'.repeat(5 - clamped)}
    </span>
  )
}

function TutorProfilePage({ currentUser }) {
  const { id } = useParams() // this is tutor's userId in your routes

  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState(null)
  const [reviewsSuccess, setReviewsSuccess] = useState(null)

  const [myRating, setMyRating] = useState('')
  const [myComment, setMyComment] = useState('')
  const [savingReview, setSavingReview] = useState(false)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [openMenuReviewId, setOpenMenuReviewId] = useState(null)


  const isStudent = currentUser?.role === 'STUDENT'

  // --- load tutor info ---
  const loadTutor = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tutors/${userId}`)
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }
      const data = await res.json()

      setTutor({
        userId: data.userId ?? Number(userId),
        name: `${data.firstName} ${data.lastName}`,
        rating: data.ratingAvg ?? 0,
        ratingCount: data.ratingCount ?? 0,
        joined: formatJoined(data.joinedAt),
        subject: data.subjectLabel,
        experienceYears: data.yearsExperience,
        teachingMethod: data.teachingMethod,
        summary: data.bio || '',
        hourlyRate: data.hourlyRate,
        profileImageUrl: data.profileImageUrl || null,
      })
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- load reviews for tutor (via userId) ---
  const loadReviews = async (userId) => {
    setReviewsLoading(true)
    setReviewsError(null)
    try {
      const res = await fetch(
        `${API_BASE}/api/tutors/user/${userId}/reviews`
      )
      if (!res.ok) {
        throw new Error('Failed to load reviews')
      }
      const data = await res.json()
      setReviews(data || [])

      // pre-fill existing review if this student already rated
      if (isStudent && currentUser) {
        const mine = data.find(
          (r) => r.studentUserId === currentUser.userId
        )
        if (mine) {
          setMyRating(String(mine.rating))
          setMyComment(mine.comment || '')
          setEditingReviewId(mine.id)
        } else {
          setMyRating('')
          setMyComment('')
          setEditingReviewId(null)
        }
      }
    } catch (err) {
      console.error(err)
      setReviewsError(err.message)
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    const userId = Number(id)
    setLoading(true)
    setError(null)
    setReviewsSuccess(null)
    loadTutor(userId)
    loadReviews(userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewsError(null)
    setReviewsSuccess(null)

    if (!isStudent || !currentUser) {
      setReviewsError('You must be logged in as a student to leave a review.')
      return
    }
    if (!myRating) {
      setReviewsError('Please select a rating.')
      return
    }

    const userId = tutor?.userId ?? Number(id)
    setSavingReview(true)

    try {
      const res = await fetch(
        `${API_BASE}/api/tutors/user/${userId}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.userId,            // student userId
            rating: Number(myRating),
            comment: myComment.trim(),
          }),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to save review')
      }

      setReviewsSuccess('Your review has been saved.')
      // refresh tutor (avg + count) and reviews list
      await loadTutor(userId)
      await loadReviews(userId)
    } catch (err) {
      console.error(err)
      setReviewsError(err.message)
    } finally {
      setSavingReview(false)
    }
  }

  const renderReviewCard = (r, isMine) => (
    <div key={r.id} className="review-card">
      <div className="review-card-top">
        <div className="review-rating">
          <span className="stars">★</span>{' '}
          {Number(r.rating).toFixed(1)}
        </div>

        <div className="review-author-area">
          <div className="review-author">
            {r.studentFirstName
              ? `${r.studentFirstName} ${r.studentLastName || ''}`.trim()
              : 'Student'}
          </div>

          {isMine && (
            <div className="review-menu-wrapper">
              <button
                type="button"
                className="review-kebab"
                onClick={() =>
                  setOpenMenuReviewId((prev) =>
                    prev === r.id ? null : r.id
                  )
                }
              >
                ⋯
              </button>
              {openMenuReviewId === r.id && (
                <div className="review-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setMyRating(String(r.rating))
                      setMyComment(r.comment || '')
                      setEditingReviewId(r.id)
                      setShowReviewForm(true)
                      setReviewsError(null)
                      setReviewsSuccess(null)
                      setOpenMenuReviewId(null)
                    }}
                  >
                    Edit review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r)}
                  >
                    Delete review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {r.comment && (
        <p className="review-comment">{r.comment}</p>
      )}
      {r.createdAt && (
        <div className="review-date">
          {new Date(r.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )

  const handleDeleteReview = async (review) => {
    if (!isStudent || !currentUser) return

    const confirmed = window.confirm('Delete your review?')
    if (!confirmed) return

    const userId = tutor?.userId ?? Number(id)

    setSavingReview(true)
    setReviewsError(null)
    setReviewsSuccess(null)

    try {
      const res = await fetch(
        `${API_BASE}/api/tutors/user/${userId}/reviews/${review.id}?studentUserId=${currentUser.userId}`,
        {
          method: 'DELETE',
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to delete review')
      }

      setReviewsSuccess('Your review has been deleted.')
      setOpenMenuReviewId(null)
      setEditingReviewId(null)
      setMyRating('')
      setMyComment('')
      setShowReviewForm(false)

      await loadTutor(userId)
      await loadReviews(userId)
    } catch (err) {
      setReviewsError(err.message)
    } finally {
      setSavingReview(false)
    }
  }


  if (loading) {
    return (
      <div className="tutor-profile-page">
        <div className="tutor-profile-card">
          <p>Loading tutor...</p>
        </div>
      </div>
    )
  }

  if (error || !tutor) {
    return (
      <div className="tutor-profile-page">
        <div className="tutor-profile-card">
          <p>Failed to load tutor.</p>
          <Link to="/tutors" className="tutor-profile-back">
            ← Back to tutors
          </Link>
        </div>
      </div>
    )
  }

  const avgRatingDisplay = Number(tutor.rating || 0).toFixed(2)
  const ratingCount = tutor.ratingCount || reviews.length || 0

  const myUserId = currentUser?.userId
  const myReview =
    isStudent && currentUser
      ? reviews.find((r) => r.studentUserId === myUserId)
      : null
  const hasMyReview = Boolean(myReview)

  const otherReviews = hasMyReview
  ? reviews.filter((r) => r.id !== myReview.id)
  : reviews

  return (
    <div className="tutor-profile-page">
      <div className="tutor-profile-card">
        <div className="tutor-profile-header">
          <div className="tutor-profile-left">
            {tutor.profileImageUrl ? (
              <img
                src={tutor.profileImageUrl}
                alt={tutor.name}
                className="tutor-profile-photo"
              />
            ) : (
              <div className="tutor-profile-photo placeholder" />
            )}

            <div>
              <h1 className="tutor-profile-name">{tutor.name}</h1>
              <div className="tutor-profile-rating-row">
                <StarRating rating={tutor.rating} />
                <span className="tutor-profile-rating-number">
                  {avgRatingDisplay} ({ratingCount})
                </span>
              </div>
              <p className="tutor-profile-subject">{tutor.subject}</p>
            </div>
          </div>

          <div className="tutor-profile-right">
            <div className="tutor-profile-rate">
              <span className="amount">${tutor.hourlyRate}</span>
              <span className="unit">/hr</span>
            </div>
            <button type="button" className="tutor-profile-cta">
              Contact Tutor
            </button>
          </div>
        </div>

        <div className="tutor-profile-section-grid">
          <div>
            <h2>Overview</h2>
            <ul className="tutor-profile-list">
              <li><strong>Joined:</strong> {tutor.joined}</li>
              <li>
                <strong>Experience:</strong>{' '}
                {tutor.experienceYears} year
                {tutor.experienceYears > 1 ? 's' : ''}
              </li>
              <li>
                <strong>Method:</strong> {formatTeachingMethod(tutor.teachingMethod)}
              </li>
            </ul>
          </div>

          <div>
            <h2>About {tutor.name.split(' ')[0]}</h2>
            <p>{tutor.summary}</p>
          </div>
        </div>

        {/* --- Reviews section --- */}
        <div className="tutor-profile-section">
          <h2>Student Reviews</h2>

          {reviewsError && (
            <p className="reviews-error">{reviewsError}</p>
          )}
          {reviewsSuccess && (
            <p className="reviews-success">{reviewsSuccess}</p>
          )}

          {/* Review form for students */}
          {isStudent && currentUser && showReviewForm && (
            <form
              className="review-form"
              onSubmit={handleReviewSubmit}
            >
              <div className="review-form-row">
                <label>Rate this tutor</label>
                <select
                  value={myRating}
                  onChange={(e) => setMyRating(e.target.value)}
                >
                  <option value="">Select rating</option>
                  {Array.from({ length: 9 }).map((_, i) => {
                    const value = 1 + i * 0.5
                    const v = value.toFixed(1)
                    return (
                      <option key={v} value={v}>
                        {v} / 5.0
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
                disabled={savingReview}
                className="review-submit"
              >
                {savingReview ? 'Saving…' : 'Submit review'}
              </button>
            </form>
          )}

          {/* Button only if student & no existing review */}
          {isStudent && !hasMyReview && (
            <button
              type="button"
              className="leave-review-button"
              onClick={() => {
                setShowReviewForm((prev) => !prev)
                setReviewsError(null)
                setReviewsSuccess(null)
                if (!showReviewForm) {
                  // opening new review form
                  setMyRating('')
                  setMyComment('')
                  setEditingReviewId(null)
                }
              }}
            >
              {showReviewForm ? 'Cancel Review' : 'Leave a Review'}
            </button>
          )}

          {!isStudent && (
            <p className="reviews-hint">
              Log in as a student to leave a review.
            </p>
          )}

          {isStudent && hasMyReview && (
            <p className="reviews-hint">
              You have already reviewed this tutor. Use the menu on your review to edit or delete it.
            </p>
          )}

          {/* List of reviews */}
          <div className="reviews-list">
            {reviewsLoading ? (
              <div className="reviews-empty">Loading reviews...</div>
            ) : (
              <>
                {/* --- Your own review on top, if it exists --- */}
                {hasMyReview && myReview && (
                  <div className="reviews-subsection">
                    <h3 className="reviews-subtitle">Your review</h3>
                    {renderReviewCard(myReview, true)}
                  </div>
                )}

                {/* --- Other students' reviews --- */}
                <div className="reviews-subsection">
                  <h3 className="reviews-subtitle">
                    {hasMyReview ? "Other students' reviews" : "Student reviews"}
                  </h3>

                  {otherReviews.length === 0 ? (
                    <div className="reviews-empty">
                      {hasMyReview
                        ? 'No other reviews yet.'
                        : 'No one has reviewed this tutor yet.'}
                    </div>
                  ) : (
                    otherReviews.map((r) => renderReviewCard(r, false))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="tutor-profile-footer">
          <Link to="/tutors" className="tutor-profile-back">
            ← Back to tutors
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TutorProfilePage
