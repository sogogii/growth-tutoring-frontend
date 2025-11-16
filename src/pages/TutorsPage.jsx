import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './styles/TutorsPage.css'

function StarRating({ rating }) {
  return (
    <span className="tutor-rating">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

function formatJoined(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr) // joined_at from backend, e.g. "2025-11-01"
  if (Number.isNaN(d.getTime())) return dateStr // fallback if invalid

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]

  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

function formatTeachingMethod(method) {
  if (!method) return ''

  switch (method) {
    case 'ONLINE':
      return 'Online'
    case 'IN_PERSON':
      return 'In-Person'
    case 'HYBRID':
      return 'Hybrid'
    default:
      return method.charAt(0) + method.slice(1).toLowerCase()
  }
}

function TutorsPage() {

  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10 // tutors per page

  const tutorsContentRef = useRef(null)

  const [sortOption, setSortOption] = useState('ratingDesc')
  const [isSortOpen, setIsSortOpen] = useState(false)

  const handleSortChange = (value) => {
    setSortOption(value)
    setIsSortOpen(false)    // close dropdown after choosing
  }

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/tutors')
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`)
        }

        const data = await res.json()

        // map backend fields → frontend shape
        const mapped = data.map((t) => ({
          id: t.publicId,
          name: `${t.firstName} ${t.lastName}`,
          rating: t.ratingAvg ?? 0,
          joined: formatJoined(t.joinedAt),
          subject: t.subjectLabel,
          experienceYears: t.yearsExperience,
          lessonsTaught: t.lessonsTaught,
          education: t.education,
          teachingMethod: t.teachingMethod, // 'ONLINE', 'IN_PERSON', 'HYBRID'
          summary: t.bio || '',
          hourlyRate: t.hourlyRate,
          profileImageUrl: t.profileImageUrl || null,
        }))

        setTutors(mapped)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTutors()
  }, [])

  useEffect(() => {
    localStorage.setItem('tutorsPage', currentPage);
  }, [currentPage]);

  const num = (v) => (v == null ? 0 : Number(v))

  // Sort tutors first
  const sortedTutors = [...tutors].sort((a, b) => {
    switch (sortOption) {
      case 'ratingDesc':
        return num(b.rating) - num(a.rating)
      case 'rateAsc':
        return num(a.hourlyRate) - num(b.hourlyRate)
      case 'experienceDesc':
        return num(b.experienceYears) - num(a.experienceYears)
      case 'lessonsDesc':
        return num(b.lessonsTaught) - num(a.lessonsTaught)
      default:
        return 0
    }
  })
  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedTutors.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const currentTutors = sortedTutors.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    if (!tutorsContentRef.current) return

    const rect = tutorsContentRef.current.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    const navbarOffset = 90 
    const targetY = rect.top + scrollTop - navbarOffset

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [sortOption])

  return (
    <div className="tutors-page">
      {/* Top banner */}
      <section className="tutors-hero">
        <h1>Our Tutors</h1>
      </section>

      {/* Main content */}
      <section className="tutors-content" ref={tutorsContentRef}>
        {/* Search bar section */}
        <header className="tutors-search-header">
          <h2>Search For Tutors</h2>

          <div className="tutors-search-row">
            <input
              className="tutors-search-input"
              type="text"
              placeholder="You can type in tutor's name, subject, etc..."
            />
            <button
              type="button"
              className="tutors-filter-button"
              aria-label="Sort tutors"
              onClick={() => setIsSortOpen((open) => !open)}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="tutors-filter-icon"
              >
                <path
                  d="M4 4h16l-6 7v5l-4 2v-7L4 4z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {isSortOpen && (
            <div className="tutors-sort-menu">
              <button
                type="button"
                className={`tutors-sort-option ${sortOption === 'ratingDesc' ? 'active' : ''}`}
                onClick={() => handleSortChange('ratingDesc')}
              >
                Best rating
              </button>
              <button
                type="button"
                className={`tutors-sort-option ${sortOption === 'rateAsc' ? 'active' : ''}`}
                onClick={() => handleSortChange('rateAsc')}
              >
                Lowest price
              </button>
              <button
                type="button"
                className={`tutors-sort-option ${sortOption === 'experienceDesc' ? 'active' : ''}`}
                onClick={() => handleSortChange('experienceDesc')}
              >
                Most experience
              </button>
              <button
                type="button"
                className={`tutors-sort-option ${sortOption === 'lessonsDesc' ? 'active' : ''}`}
                onClick={() => handleSortChange('lessonsDesc')}
              >
                Most lessons taught
              </button>
            </div>
          )}
        </header>

        {/* Tutor list */}
        <div className="tutors-list">
          {loading && <p>Loading tutors...</p>}

          {error && (
            <p className="tutors-error">
              Failed to load tutors: {error}
            </p>
          )}

          {!loading && !error && tutors.length === 0 && (
            <p>No tutors found yet.</p>
          )}

          {!loading && !error && currentTutors.map((tutor) => (
            <article key={tutor.id} className="tutor-card">
              <div className="tutor-card-left">
                <div className="tutor-image-placeholder" aria-hidden="true" />
              </div>

              <div className="tutor-card-main">
                <div className="tutor-card-header">
                  <span className="tutor-name">{tutor.name}</span>
                  <div className="rating-wrapper">
                    <StarRating rating={tutor.rating} />
                    <span className="numeric-rating">
                      {tutor.rating != null ? tutor.rating.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                <div className="tutor-meta">
                  <span>
                    <strong>Joined:</strong> {tutor.joined}
                  </span>
                  <span>
                    <strong>Subject:</strong> {tutor.subject}
                  </span>
                  <span>
                    <strong>Experience:</strong> {tutor.experienceYears} year
                    {tutor.experienceYears > 1 ? 's' : ''}
                  </span>
                  <span>
                    <strong>Lessons Taught:</strong> {tutor.lessonsTaught}
                  </span>
                </div>

                <div className="tutor-meta">
                  <span>
                    <strong>Education:</strong> {tutor.education}
                  </span>
                  <span>
                    <strong>Method:</strong> {formatTeachingMethod(tutor.teachingMethod)}
                  </span>
                </div>

                <p className="tutor-summary">
                  <strong>Summary:</strong> {tutor.summary}
                </p>

                <div className="tutor-card-actions">
                  <Link to="/coming-soon" className="btn tutor-learn-more">
                    Learn More
                  </Link>
                </div>
              </div>

              <div className="tutor-card-right">
                <div className="tutor-rate">
                  <span className="tutor-rate-amount">${tutor.hourlyRate}</span>
                  <span className="tutor-rate-unit">/hr</span>
                </div>
                <button
                  type="button"
                  className="tutor-chat-button"
                  aria-label={`Message ${tutor.name}`}
                >
                  💬
                </button>
              </div>
            </article>
          ))}
        </div>

        {!loading && !error && tutors.length > pageSize && (
          <div className="tutors-pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ‹ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next ›
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default TutorsPage