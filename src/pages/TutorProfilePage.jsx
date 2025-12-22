// src/pages/TutorProfilePage.jsx - Complete Improved Version
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import VerificationBadge from '../components/VerificationBadge'
import './styles/TutorProfilePage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function formatJoined(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
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
  const { id } = useParams()
  const navigate = useNavigate()

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

  const [linkStatus, setLinkStatus] = useState('NONE')
  const [linkLoading, setLinkLoading] = useState(false)

  // Load tutor info
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
        teachingMethod: formatTeachingMethod(data.teachingMethod),
        bio: data.bio || '',
        education: data.education || '',
        hourlyRate: data.hourlyRate,
        profileImageUrl: data.profileImageUrl || null,
        verificationTier: data.verificationTier || 'TIER_1'
      })
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load reviews
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

  // Load link status
  const loadLinkStatus = async (studentUserId, tutorUserId) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/student-tutor-links/status?studentUserId=${studentUserId}&tutorUserId=${tutorUserId}`
      )
      if (!res.ok) {
        setLinkStatus('NONE')
        return
      }
      const data = await res.json()
      setLinkStatus(data.status || 'NONE')
    } catch (err) {
      console.error(err)
      setLinkStatus('NONE')
    }
  }

  useEffect(() => {
    const userId = Number(id)
    setLoading(true)
    setError(null)
    setReviewsSuccess(null)
    loadTutor(userId)
    loadReviews(userId)

    if (isStudent && currentUser) {
      loadLinkStatus(currentUser.userId, userId)
    }
  }, [id, isStudent, currentUser])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuReviewId && !e.target.closest('.review-menu-wrapper')) {
        setOpenMenuReviewId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuReviewId])

  // Submit review
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
            userId: currentUser.userId,
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
      setShowReviewForm(false)
      await loadTutor(userId)
      await loadReviews(userId)
    } catch (err) {
      console.error(err)
      setReviewsError(err.message)
    } finally {
      setSavingReview(false)
    }
  }

  // Delete review
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

  // Render review card
  const renderReviewCard = (r, isMine) => (
    <div key={r.id} className="review-card">
      <div className="review-card-top">
        <div style={{ flex: 1 }}>
          <span className="review-card-reviewer">
            {r.studentFirstName
              ? `${r.studentFirstName} ${r.studentLastName || ''}`.trim()
              : 'Student'}
            {isMine && ' (You)'}
          </span>
          <div style={{ marginTop: '4px' }}>
            <span className="review-card-rating">
              {'★'.repeat(r.rating)}
            </span>
          </div>
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

      {r.comment && (
        <p className="review-card-comment">{r.comment}</p>
      )}
      {r.createdAt && (
        <p className="review-card-date">
          {new Date(r.createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )

  // Handle add tutor request
  const handleAddTutorRequest = async () => {
    if (!isStudent || !currentUser) {
      alert('Please log in as a student to add this tutor.')
      return
    }

    const tutorUserId = tutor?.userId ?? Number(id)

    setLinkLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/student-tutor-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentUserId: currentUser.userId,
          tutorUserId,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to send request')
      }

      await loadLinkStatus(currentUser.userId, tutorUserId)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to send request')
    } finally {
      setLinkLoading(false)
    }
  }

  // Handle contact tutor (open chat)
  const handleContactTutor = async () => {
    if (!currentUser) {
      alert('Please log in to contact this tutor.')
      return
    }

    const tutorUserId = tutor?.userId ?? Number(id)
    
    // Determine student and tutor IDs based on current user role
    let studentUserId, finalTutorUserId
    
    if (currentUser.role === 'STUDENT') {
      studentUserId = currentUser.userId
      finalTutorUserId = tutorUserId
    } else if (currentUser.role === 'TUTOR') {
      // If current user is a tutor viewing another tutor's profile,
      // they can't start a conversation (tutors can only chat with students)
      alert('Only students can contact tutors.')
      return
    } else {
      alert('Invalid user role.')
      return
    }

    setLinkLoading(true)
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/conversation?studentUserId=${studentUserId}&tutorUserId=${finalTutorUserId}`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to start conversation')
      }

      const conv = await res.json()
      navigate(`/chat/${conv.id}`, {
        state: { 
          otherName: tutor.name,
          otherUserId: tutorUserId
        }
      })
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to start conversation')
    } finally {
      setLinkLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="tutor-profile-page">
        <div className="tutor-profile-card">
          <div className="tutor-profile-loading">
            <p>Loading tutor profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tutor) {
    return (
      <div className="tutor-profile-page">
        <div className="tutor-profile-card">
          <div className="tutor-profile-loading">
            <p>Failed to load tutor profile.</p>
            <Link to="/tutors" className="tutor-profile-back">
              ← Back to tutors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const avgRatingDisplay = Number(tutor.rating || 0).toFixed(1)
  const ratingCount = tutor.ratingCount || reviews.length || 0
  const myUserId = currentUser?.userId
  const myReview = isStudent && currentUser ? reviews.find((r) => r.studentUserId === myUserId) : null
  const hasMyReview = Boolean(myReview)
  const otherReviews = hasMyReview ? reviews.filter((r) => r.id !== myReview.id) : reviews

  // Parse subjects into array
  const subjectsArray = tutor.subject ? tutor.subject.split(',').map(s => s.trim()) : []

  const addTutorLabel = (() => {
    switch (linkStatus) {
      case 'PENDING': return 'Request Sent'
      case 'ACCEPTED': return 'Tutor Added'
      case 'DECLINED': return 'Add Tutor'
      default: return 'Add Tutor'
    }
  })()

  const addTutorDisabled = linkLoading || linkStatus === 'PENDING' || linkStatus === 'ACCEPTED'

  return (
    <div className="tutor-profile-page">
      <div className="tutor-profile-card">
        {/* Modern Header with Gradient */}
        <div className="tutor-profile-header">
          <div className="tutor-profile-header-content">
            {/* Profile Photo */}
            <div className="tutor-profile-photo-wrapper">
              {tutor.profileImageUrl ? (
                <img
                  src={tutor.profileImageUrl}
                  alt={tutor.name}
                  className="tutor-profile-photo"
                />
              ) : (
                <div className="tutor-profile-photo placeholder">
                  {tutor.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Tutor Info */}
            <div className="tutor-profile-info">
              <div className="tutor-profile-name-row">
                <h1 className="tutor-profile-name">{tutor.name}</h1>
                <VerificationBadge tier={tutor.verificationTier} />
              </div>

              <div className="tutor-profile-rating-row">
                <StarRating rating={tutor.rating} />
                <span className="tutor-profile-rating-number">
                  {avgRatingDisplay} ({ratingCount})
                </span>
              </div>

              {/* Subject Tags */}
              <div className="tutor-profile-subjects">
                {subjectsArray.map((subject, idx) => (
                  <span key={idx} className="tutor-profile-subject-tag">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions (Price & Buttons) */}
            <div className="tutor-profile-actions">
              <div className="tutor-profile-rate">
                <span className="amount">${tutor.hourlyRate}</span>
                <span className="unit">/hr</span>
              </div>

              <button 
                type="button" 
                className="tutor-profile-cta"
                onClick={handleContactTutor}
              >
                Contact Tutor
              </button>

              {isStudent && (
                <button
                  type="button"
                  className="tutor-profile-secondary-cta"
                  onClick={handleAddTutorRequest}
                  disabled={addTutorDisabled}
                >
                  {linkLoading ? 'Sending…' : addTutorLabel}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="tutor-profile-content">
          {/* Overview & About Grid */}
          <div className="tutor-profile-section-grid">
            <div className="tutor-profile-section">
              <h2>Overview</h2>
              <ul className="tutor-profile-list">
                <li>
                  <strong>Joined:</strong>
                  <span>{tutor.joined}</span>
                </li>
                <li>
                  <strong>Experience:</strong>
                  <span>{tutor.experienceYears} year{tutor.experienceYears > 1 ? 's' : ''}</span>
                </li>
                <li>
                  <strong>Method:</strong>
                  <span>{tutor.teachingMethod}</span>
                </li>
                {tutor.education && (
                  <li>
                    <strong>Education:</strong>
                    <span>{tutor.education}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="tutor-profile-section">
              <h2>About {tutor.name.split(' ')[0]}</h2>
              <div className="tutor-profile-bio">
                {tutor.bio || 'No bio provided yet.'}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="tutor-profile-reviews">
            <div className="tutor-profile-section">
              <h2>Student Reviews</h2>

              {reviewsSuccess && (
                <div className="reviews-success">{reviewsSuccess}</div>
              )}
              {reviewsError && (
                <div className="reviews-error">{reviewsError}</div>
              )}

              {/* Review Form */}
              {isStudent && showReviewForm && (
                <div className="review-form">
                  <div className="review-form-row">
                    <label htmlFor="rating">Rating</label>
                    <select
                      id="rating"
                      value={myRating}
                      onChange={(e) => setMyRating(e.target.value)}
                    >
                      <option value="">Select rating</option>
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Fair</option>
                      <option value="3">3 - Good</option>
                      <option value="4">4 - Very Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                  </div>

                  <div className="review-form-row">
                    <label htmlFor="comment">Comment</label>
                    <textarea
                      id="comment"
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="Share your experience..."
                    />
                  </div>

                  <button
                    type="button"
                    className="review-submit"
                    onClick={handleReviewSubmit}
                    disabled={savingReview || !myRating}
                  >
                    {savingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}

              {/* Review button for students */}
              {isStudent && !hasMyReview && !showReviewForm && (
                <button
                  type="button"
                  className="review-submit"
                  style={{ marginBottom: '20px' }}
                  onClick={() => setShowReviewForm(true)}
                >
                  Leave a Review
                </button>
              )}

              {!isStudent && (
                <p className="reviews-hint">
                  Log in as a student to leave a review.
                </p>
              )}

              {isStudent && hasMyReview && !showReviewForm && (
                <p className="reviews-hint">
                  You have already reviewed this tutor. Use the menu on your review to edit or delete it.
                </p>
              )}

              {/* Display Reviews */}
              <div className="reviews-list">
                {reviewsLoading ? (
                  <div className="reviews-hint">Loading reviews...</div>
                ) : (
                  <>
                    {myReview && renderReviewCard(myReview, true)}
                    {otherReviews.map((r) => renderReviewCard(r, false))}
                    {reviews.length === 0 && (
                      <p className="reviews-hint">No reviews yet. Be the first to review!</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tutor-profile-footer">
          <Link to="/tutors" className="tutor-profile-back">
            ← Back to all tutors
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TutorProfilePage