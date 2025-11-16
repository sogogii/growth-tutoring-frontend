import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './styles/TutorProfilePage.css'

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
  return (
    <span className="tutor-profile-rating">
      {'★'.repeat(rating ?? 0)}
      {'☆'.repeat(5 - (rating ?? 0))}
    </span>
  )
}

function TutorProfilePage() {
  const { id } = useParams()        // publicId from URL
  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tutors/${id}`)
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`)
        }
        const data = await res.json()

        // Map backend → frontend shape (similar to TutorsPage)
        setTutor({
          id: data.publicId,
          name: `${data.firstName} ${data.lastName}`,
          rating: data.ratingAvg ?? 0,
          joined: formatJoined(data.joinedAt),
          subject: data.subjectLabel,
          experienceYears: data.yearsExperience,
          lessonsTaught: data.lessonsTaught,
          education: data.education,
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

    fetchTutor()
  }, [id])

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
          <Link to="/tutors" className="tutor-profile-back">← Back to tutors</Link>
        </div>
      </div>
    )
  }

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
                  {tutor.rating.toFixed(2)}
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
              <li><strong>Experience:</strong> {tutor.experienceYears} year{tutor.experienceYears > 1 ? 's' : ''}</li>
              <li><strong>Lessons Taught:</strong> {tutor.lessonsTaught}</li>
              <li><strong>Method:</strong> {formatTeachingMethod(tutor.teachingMethod)}</li>
            </ul>
          </div>

          <div>
            <h2>Education</h2>
            <p>{tutor.education}</p>
          </div>
        </div>

        <div className="tutor-profile-section">
          <h2>About {tutor.name.split(' ')[0]}</h2>
          <p>{tutor.summary}</p>
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
