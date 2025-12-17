import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VerificationBadge from '../components/VerificationBadge'
import './styles/TutorsPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

function StarRating({ rating }) {
  const r = rating ?? 0
  return (
    <span className="tutor-rating">
      {'★'.repeat(r)}
      {'☆'.repeat(5 - r)}
    </span>
  )
}

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

function TutorsPage({ currentUser }) {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [sortOption, setSortOption] = useState('ratingDesc')
  const [searchQuery, setSearchQuery] = useState('')

  const tutorsContentRef = useRef(null)

  const navigate = useNavigate()

  const handleOpenChat = async (tutorUserId) => {
    if (!currentUser) {
      alert('Please sign in to start a conversation.')
      navigate('/login')
      return
    }

    try {
      // studentUserId = currentUser.userId  
      // tutorUserId   = id of clicked tutor  

      const res = await fetch(
        `${API_BASE}/api/chat/conversation?studentUserId=${currentUser.userId}&tutorUserId=${tutorUserId}`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const text = await res.text()
        alert(text || 'Failed to start a conversation.')
        return
      }

      const conv = await res.json()
      navigate(`/chat/${conv.id}`) 

    } catch (err) {
      console.error(err)
      alert('Error starting chat.')
    }
  }

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/tutors')
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`)
        }

        const data = await res.json()

        const mapped = data.map((t) => ({
          id: t.userId,
          name: `${t.firstName} ${t.lastName}`,
          rating: t.ratingAvg ?? 0,
          ratingCount: t.ratingCount ?? 0,
          joined: formatJoined(t.joinedAt),
          subject: t.subjectLabel,
          experienceYears: t.yearsExperience,
          teachingMethod: t.teachingMethod,
          summary: t.bio || '',
          hourlyRate: t.hourlyRate,
          profileImageUrl: t.profileImageUrl || null,
          verificationTier: t.verificationTier || 'TIER_1'
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
    localStorage.setItem('tutorsPage', currentPage.toString())
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortOption])

  useEffect(() => {
    if (!tutorsContentRef.current) return

    const rect = tutorsContentRef.current.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const navbarOffset = 90
    const targetY = rect.top + scrollTop - navbarOffset

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    })
  }, [currentPage])

  const num = (v) => (v == null ? 0 : Number(v))
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredTutors = normalizedQuery
    ? tutors.filter((t) => {
        const text = [
          t.name,
          t.subject,
          t.summary,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return text.includes(normalizedQuery)
      })
    : tutors

  const sortedTutors = [...filteredTutors].sort((a, b) => {
    switch (sortOption) {
      case 'ratingDesc':
        return num(b.rating) - num(a.rating)
      case 'rateAsc':
        return num(a.hourlyRate) - num(b.hourlyRate)
      case 'experienceDesc':
        return num(b.experienceYears) - num(a.experienceYears)
      default:
        return 0
    }
  })

  const totalPages = Math.max(1, Math.ceil(sortedTutors.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const currentTutors = sortedTutors.slice(startIndex, startIndex + pageSize)

  return (
    <div className="tutors-page">
      {/* Top banner */}
      <section className="tutors-hero">
        <h1>Our Tutors</h1>
      </section>

      {/* Main content */}
      <section className="tutors-content" ref={tutorsContentRef}>
        <div className="tutors-layout">
          {/* LEFT SIDEBAR */}
          <aside className="tutors-sidebar">
            <h2 className="tutors-sidebar-title">Filter Search</h2>

            <div className="tutors-sidebar-section">
              <h3>Sort by</h3>
              <button
                type="button"
                className={`tutors-sort-chip ${
                  sortOption === 'ratingDesc' ? 'active' : ''
                }`}
                onClick={() => setSortOption('ratingDesc')}
              >
                ⭐ Best rating
              </button>
              <button
                type="button"
                className={`tutors-sort-chip ${
                  sortOption === 'rateAsc' ? 'active' : ''
                }`}
                onClick={() => setSortOption('rateAsc')}
              >
                💰 Lowest price
              </button>
              <button
                type="button"
                className={`tutors-sort-chip ${
                  sortOption === 'experienceDesc' ? 'active' : ''
                }`}
                onClick={() => setSortOption('experienceDesc')}
              >
                ⏳ Most experience
              </button>
            </div>

            <div className="tutors-sidebar-section muted">
              <h3>More filters (coming soon)</h3>
              <p>Subject, grade level, location, and more.</p>
            </div>
          </aside>

          {/* RIGHT MAIN AREA */}
          <div className="tutors-main">
            {/* Search bar */}
            <header className="tutors-search-header">
              <h2>Search For Tutors</h2>
              <div className="tutors-search-row">
                <input
                  className="tutors-search-input"
                  type="text"
                  placeholder="You can type in tutor's name, subject, etc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                <p className="tutors-empty-text">No tutors found yet.</p>
              )}

              {!loading && !error && tutors.length > 0 && filteredTutors.length === 0 && (
                <div className="tutors-empty-wrapper">
                  <div className="tutors-empty-text">
                    No tutors match your search.
                  </div>
                </div>
              )}

              {!loading && !error && currentTutors.map((tutor) => (
                <article key={tutor.id} className="tutor-card">
                  <div className="tutor-card-left">
                    <div className="tutor-image-placeholder" aria-hidden="true" />
                  </div>

                  <div className="tutor-card-main">
                    <div className="tutor-card-header">
                      <span className="tutor-name">{tutor.name}</span>
                      <VerificationBadge tier={tutor.verificationTier} />  {/* ADD THIS */}
                      <div className="rating-wrapper">
                        <StarRating rating={tutor.rating} />
                        <span className="numeric-rating">
                          {tutor.rating != null ? tutor.rating.toFixed(2) : '0.00'}
                          {' '}({tutor.ratingCount ?? 0})
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
                        <strong>Method:</strong> {formatTeachingMethod(tutor.teachingMethod)}
                      </span>
                    </div>

                    <p className="tutor-summary">
                      <strong>Summary:</strong> {tutor.summary}
                    </p>
                    <div className="tutor-card-actions">
                      <Link to={`/tutors/${tutor.id}`} className="btn tutor-learn-more">
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
                      onClick={() => handleOpenChat(tutor.id)} 
                    >
                      💬
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {!loading && !error && sortedTutors.length > pageSize && (
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
          </div>
        </div>
      </section>
    </div>
  )
}

export default TutorsPage
