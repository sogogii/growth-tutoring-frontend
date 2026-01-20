import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/MyReviewsPage.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function MyReviewsPage({ currentUser }) {
  const navigate = useNavigate()
  
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingReview, setEditingReview] = useState(null)
  const [editRating, setEditRating] = useState('')
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentUser && currentUser.userId) {
      fetchMyReviews()
    } else {
      setLoading(false)
      setError('Please log in to view your reviews')
    }
  }, [currentUser])

  const fetchMyReviews = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/students/user/${currentUser.userId}/my-reviews`
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
        `${API_BASE}/api/students/user/${currentUser.userId}/reviews/${reviewId}`,
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
        `${API_BASE}/api/students/user/${currentUser.userId}/reviews/${reviewId}`,
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
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star filled">★</span>)
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>)
    }

    return stars
  }

  if (loading) {
    return (
      <div className="my-reviews-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your reviews...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-reviews-page">
        <div className="error-container">
          <h2>Unable to Load Reviews</h2>
          <p className="error-message">{error}</p>
          <div style={{ marginTop: '20px' }}>
            <button 
              className="btn btn-primary"
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
      <div className="page-header">
        <h1>My Reviews</h1>
        <p className="page-subtitle">
          Reviews you've written for your tutors
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h2>No reviews yet</h2>
          <p>You haven't written any reviews for your tutors yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/my-tutors')}
          >
            View My Tutors
          </button>
        </div>
      ) : (
        <div className="reviews-container">
          {/* Summary Statistics */}
          <div className="reviews-summary">
            <div className="summary-stat">
              <span className="stat-number">{reviews.length}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number">
                {(reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)}
              </span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.reviewId} className="review-card">
                {/* Tutor Info Header */}
                <div 
                  className="tutor-info-header"
                  onClick={() => handleViewTutor(review.tutorUserId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tutor-avatar">
                    {review.tutorFirstName?.charAt(0) || '?'}
                    {review.tutorLastName?.charAt(0) || '?'}
                  </div>
                  <div className="tutor-details">
                    <h3 className="tutor-name">
                      {review.tutorFirstName} {review.tutorLastName}
                    </h3>
                    <p className="tutor-subject">{review.tutorSubjectLabel}</p>
                    {review.tutorHeadline && (
                      <p className="tutor-headline">{review.tutorHeadline}</p>
                    )}
                  </div>
                  <button 
                    className="btn-view-profile"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewTutor(review.tutorUserId)
                    }}
                  >
                    View Profile →
                  </button>
                </div>

                {/* Review Content */}
                {editingReview === review.reviewId ? (
                  // Edit Mode
                  <div className="review-edit-form">
                    <div className="form-group">
                      <label>Rating</label>
                      <select
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                      >
                        <option value="">Select rating</option>
                        {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(val => (
                          <option key={val} value={val}>
                            {val} / 5.0
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Comment</label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={4}
                        placeholder="Share your experience..."
                      />
                    </div>

                    <div className="edit-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSaveEdit(review.reviewId)}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="review-content">
                    <div className="review-rating-row">
                      <div className="stars-display">
                        {renderStars(review.rating)}
                      </div>
                      <span className="rating-number">
                        {Number(review.rating).toFixed(1)} / 5.0
                      </span>
                    </div>

                    {review.comment && (
                      <p className="review-comment">"{review.comment}"</p>
                    )}

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

                    <div className="review-actions">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditClick(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteReview(review.reviewId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyReviewsPage