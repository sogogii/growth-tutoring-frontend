import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/MyReviewsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function MyReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingReview, setEditingReview] = useState(null)
  const [editRating, setEditRating] = useState('')
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  const userId = currentUser.userId

  useEffect(() => {
    if (userId) {
      fetchMyReviews()
    } else {
      setLoading(false)
      setError('Please log in to view your reviews')
    }
  }, [userId])

  const fetchMyReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${API_BASE}/api/students/user/${userId}/my-reviews`
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch reviews: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setReviews(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleViewTutor = (tutorUserId) => {
    navigate(`/tutors/${tutorUserId}`)
  }

  const handleEditClick = (review) => {
    setEditingReview(review.reviewId)
    setEditRating(review.rating.toString())
    setEditComment(review.comment || '')
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
    setEditRating('')
    setEditComment('')
  }

  const handleSaveEdit = async (reviewId) => {
    if (!editRating) {
      alert('Please select a rating')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(
        `${API_BASE}/api/students/user/${userId}/reviews/${reviewId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: parseFloat(editRating),
            comment: editComment
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update review')
      }

      await fetchMyReviews()
      setEditingReview(null)
      setEditRating('')
      setEditComment('')
    } catch (err) {
      alert('Error updating review: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/students/user/${userId}/reviews/${reviewId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      await fetchMyReviews()
    } catch (err) {
      alert('Error deleting review: ' + err.message)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating) => {
    const stars = []
    const numRating = Number(rating)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= numRating ? 'star filled' : 'star'}>
          ★
        </span>
      )
    }
    return stars
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + Number(review.rating), 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="my-reviews-page">
        <div className="reviews-container">
          <h1 className="page-title">My Reviews</h1>
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Loading your reviews...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !reviews.length) {
    return (
      <div className="my-reviews-page">
        <div className="reviews-container">
          <h1 className="page-title">My Reviews</h1>
          <div className="error-message">
            <h2>Unable to Load Reviews</h2>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => {
                setLoading(true)
                setError(null)
                fetchMyReviews()
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-reviews-page">
      <div className="reviews-container">
        <h1 className="page-title">My Reviews</h1>
        <p className="page-subtitle">Reviews you've written for your tutors</p>

        {/* Stats Summary */}
        <div className="reviews-stats">
          <div className="stat-item">
            <div className="stat-number">{reviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">{calculateAverageRating()}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="section-title">
            Your Reviews ({reviews.length})
          </h2>
          <div className="section-divider"></div>

          {reviews.length === 0 ? (
            <div className="empty-section">
              <p>You haven't written any reviews yet.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.reviewId} className="review-card">
                  {/* Tutor Info */}
                  <div className="review-tutor-info">
                    <div className="tutor-avatar">
                      {review.tutorFirstName?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div className="tutor-details">
                      <div className="tutor-name">
                        {review.tutorFirstName} {review.tutorLastName}
                      </div>
                      <div className="tutor-subject">{review.tutorSubject}</div>
                    </div>
                    <button
                      className="view-profile-btn"
                      onClick={() => handleViewTutor(review.tutorUserId)}
                    >
                      View Profile →
                    </button>
                  </div>

                  {editingReview === review.reviewId ? (
                    // Edit Mode
                    <div className="review-edit-mode">
                      <div className="edit-rating-section">
                        <label>Rating:</label>
                        <select 
                          value={editRating} 
                          onChange={(e) => setEditRating(e.target.value)}
                          className="rating-select"
                        >
                          <option value="">Select rating</option>
                          <option value="1">1 Star</option>
                          <option value="2">2 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="5">5 Stars</option>
                        </select>
                      </div>

                      <div className="edit-comment-section">
                        <label>Comment:</label>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Share your experience with this tutor..."
                          rows="4"
                          className="comment-textarea"
                        />
                      </div>

                      <div className="edit-actions">
                        <button
                          className="save-edit-btn"
                          onClick={() => handleSaveEdit(review.reviewId)}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          className="cancel-edit-btn"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      {/* Rating */}
                      <div className="review-rating">
                        <div className="stars-display">
                          {renderStars(review.rating)}
                        </div>
                        <span className="rating-number">
                          {Number(review.rating).toFixed(1)} / 5.0
                        </span>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <div className="review-comment">
                          "{review.comment}"
                        </div>
                      )}

                      {/* Date */}
                      <div className="review-meta">
                        <span className="review-date">
                          Reviewed on {formatDate(review.createdAt)}
                        </span>
                        {review.updatedAt && review.updatedAt !== review.createdAt && (
                          <span className="review-edited">
                            (Edited {formatDate(review.updatedAt)})
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="review-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditClick(review)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteReview(review.reviewId)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyReviewsPage