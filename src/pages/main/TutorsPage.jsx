import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import VerificationBadge from '../../components/VerificationBadge'
import './styles/TutorsPage.css'

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

const SUBJECT_OPTIONS = [
  'K-12 Math',
  'K-12 English',
  'Physics',
  'Chemistry',
  'Biology',
  'Foreign Languages',
  'Pre College Counseling',
  'Special needs tutoring',
]

const METHOD_OPTIONS = ['ONLINE', 'HYBRID', 'IN_PERSON']

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
  const location = useLocation()
  const navigate = useNavigate()
  
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [sortOption, setSortOption] = useState('ratingDesc')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 150])
  const [showPricePanel, setShowPricePanel] = useState(false)
  const [showMethodPanel, setShowMethodPanel] = useState(false)
  const [showSubjectsPanel, setShowSubjectsPanel] = useState(false)
  
  // Subject filter - initialize from navigation state if present
  const [selectedSubjects, setSelectedSubjects] = useState(() => {
    if (location.state?.selectedSubject) {
      return [location.state.selectedSubject]
    }
    return []
  })

  // Method filter
  const [selectedMethods, setSelectedMethods] = useState([])

  const tutorsContentRef = useRef(null)

  const handleOpenChat = async (tutorUserId, tutorName) => {
    if (!currentUser) {
      alert('Please sign in to start a conversation.')
      navigate('/login')
      return
    }

    try {
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
      navigate(`/chat/${conv.id}`, {
        state: { 
          otherName: tutorName,
          otherUserId: tutorUserId
        }
      })
    } catch (err) {
      console.error(err)
      alert('Error starting chat.')
    }
  }

  // Toggle subject selection
  const toggleSubject = (subject) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject)
      } else {
        return [...prev, subject]
      }
    })
  }

  // Toggle method selection
  const toggleMethod = (method) => {
    setSelectedMethods(prev => {
      if (prev.includes(method)) {
        return prev.filter(m => m !== method)
      } else {
        return [...prev, method]
      }
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setPriceRange([0, 150])
    setSelectedSubjects([])
    setSelectedMethods([])
    setSearchQuery('')
    if (['online', 'hybrid', 'inPerson'].includes(sortOption)) {
      setSortOption('ratingDesc')
    }
  }

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tutors`)
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
          summary: t.headline || '',
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
  }, [searchQuery, sortOption, priceRange, selectedSubjects, selectedMethods])

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

  // Click outside to close panels
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.tutors-sidebar-section') && 
          !e.target.closest('.filter-dropdown-panel')) {
        setShowPricePanel(false)
        setShowMethodPanel(false)
        setShowSubjectsPanel(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const num = (v) => (v == null ? 0 : Number(v))
  const normalizedQuery = searchQuery.trim().toLowerCase()

  // Filter by search query
  const searchFiltered = normalizedQuery
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

  // Filter by price range
  const priceFiltered = searchFiltered.filter((t) => {
    const rate = t.hourlyRate ?? 0
    return rate >= priceRange[0] && rate <= priceRange[1]
  })

  // Filter by subjects
  const subjectFiltered = selectedSubjects.length > 0
    ? priceFiltered.filter((t) => {
        if (!t.subject) return false
        return selectedSubjects.some(selected => 
          t.subject.toLowerCase().includes(selected.toLowerCase())
        )
      })
    : priceFiltered

  // Filter by teaching method
  const methodFiltered = selectedMethods.length > 0
    ? subjectFiltered.filter((t) => {
        if (!t.teachingMethod) return false
        return selectedMethods.includes(t.teachingMethod)
      })
    : subjectFiltered

  // Sort
  const sortedTutors = [...methodFiltered].sort((a, b) => {
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

  const activeFiltersCount = 
    (priceRange[0] > 0 || priceRange[1] < 150 ? 1 : 0) +
    selectedSubjects.length +
    selectedMethods.length

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
            <div className="tutors-sidebar-header">
              <h2 className="tutors-sidebar-title">Filters</h2>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  Clear all ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Sort by section */}
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
                  sortOption === 'experienceDesc' ? 'active' : ''
                }`}
                onClick={() => setSortOption('experienceDesc')}
              >
                ⏳ Most experience
              </button>
            </div>

            {/* Price Range */}
            <div className="tutors-sidebar-section">
              <h3>Price Range</h3>
              
              <button
                type="button"
                className={`filter-trigger ${showPricePanel ? 'active' : ''}`}
                onClick={() => setShowPricePanel(!showPricePanel)}
              >
                <span>${priceRange[0]} - ${priceRange[1]}/hr</span>
                <span>{showPricePanel ? '▲' : '▼'}</span>
              </button>

              {showPricePanel && (
                <div className="filter-dropdown-panel">
                  <div className="filter-panel-header">
                    <span>Select Price Range</span>
                    <button 
                      className="filter-panel-close"
                      onClick={() => setShowPricePanel(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="price-range-values">
                    <span>${priceRange[0]}/hr</span>
                    <span>${priceRange[1]}/hr</span>
                  </div>

                  <div className="price-range-slider-container">
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="price-range-slider"
                      style={{ '--range-percent': `${(priceRange[1] / 150) * 100}%` }}
                    />
                  </div>

                  <button 
                    className="filter-apply-button"
                    onClick={() => setShowPricePanel(false)}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Method */}
            <div className="tutors-sidebar-section">
              <h3>Method</h3>
              
              <button
                type="button"
                className={`filter-trigger ${showMethodPanel ? 'active' : ''}`}
                onClick={() => setShowMethodPanel(!showMethodPanel)}
              >
                <span>
                  {selectedMethods.length > 0 
                    ? `${selectedMethods.length} selected` 
                    : 'All methods'}
                </span>
                <span>{showMethodPanel ? '▲' : '▼'}</span>
              </button>

              {showMethodPanel && (
                <div className="filter-dropdown-panel">
                  <div className="filter-panel-header">
                    <span>Teaching Method</span>
                    <button 
                      className="filter-panel-close"
                      onClick={() => setShowMethodPanel(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="method-options-container">
                    {METHOD_OPTIONS.map((method) => (
                      <label
                        key={method}
                        className={`method-option ${selectedMethods.includes(method) ? 'active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="method-checkbox"
                          checked={selectedMethods.includes(method)}
                          onChange={() => toggleMethod(method)}
                        />
                        <span className="method-label">{formatTeachingMethod(method)}</span>
                      </label>
                    ))}
                  </div>

                  <button 
                    className="filter-apply-button"
                    onClick={() => setShowMethodPanel(false)}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Subjects */}
            <div className="tutors-sidebar-section">
              <h3>Subjects</h3>
              
              <button
                type="button"
                className={`filter-trigger ${showSubjectsPanel ? 'active' : ''}`}
                onClick={() => setShowSubjectsPanel(!showSubjectsPanel)}
              >
                <span>
                  {selectedSubjects.length > 0 
                    ? `${selectedSubjects.length} selected` 
                    : 'All subjects'}
                </span>
                <span>{showSubjectsPanel ? '▲' : '▼'}</span>
              </button>

              {showSubjectsPanel && (
                <div className="filter-dropdown-panel">
                  <div className="filter-panel-header">
                    <span>Select Subjects</span>
                    <button 
                      className="filter-panel-close"
                      onClick={() => setShowSubjectsPanel(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="subjects-options-container">
                    {SUBJECT_OPTIONS.map((subject) => (
                      <label
                        key={subject}
                        className={`subject-option ${selectedSubjects.includes(subject) ? 'active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="subject-checkbox"
                          checked={selectedSubjects.includes(subject)}
                          onChange={() => toggleSubject(subject)}
                        />
                        <span className="subject-label">{subject}</span>
                      </label>
                    ))}
                  </div>

                  <button 
                    className="filter-apply-button"
                    onClick={() => setShowSubjectsPanel(false)}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Backdrop for mobile */}
          {(showPricePanel || showMethodPanel || showSubjectsPanel) && (
            <div 
              className="filter-backdrop active"
              onClick={() => {
                setShowPricePanel(false)
                setShowMethodPanel(false)
                setShowSubjectsPanel(false)
              }}
            />
          )}

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

            {/* Results count */}
            {!loading && !error && (
              <div className="tutors-results-count">
                {sortedTutors.length} tutor{sortedTutors.length !== 1 ? 's' : ''} found
              </div>
            )}

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

              {!loading && !error && tutors.length > 0 && sortedTutors.length === 0 && (
                <div className="tutors-empty-wrapper">
                  <div className="tutors-empty-text">
                    No tutors match your filters.
                  </div>
                </div>
              )}

              {!loading && !error && currentTutors.map((tutor) => (
                <article key={tutor.id} className="tutor-card">
                  <div className="tutor-card-left">
                    {tutor.profileImageUrl ? (
                      <img 
                        src={tutor.profileImageUrl} 
                        alt={tutor.name}
                        className="tutor-profile-pic"
                      />
                    ) : (
                      <div className="tutor-profile-pic tutor-profile-placeholder">
                        {tutor.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="tutor-card-main">
                    <div className="tutor-header">
                      <h3 className="tutor-name">{tutor.name}</h3>
                      <VerificationBadge tier={tutor.verificationTier} />
                    </div>

                    <div className="tutor-rating-row">
                      <StarRating rating={tutor.rating} />
                      <div className="tutor-rating-count">
                        <span className="rating-number">{tutor.rating.toFixed(1)}</span>
                        <span>
                          ({tutor.ratingCount ?? 0})
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
                      <Link to={`/tutors/${tutor.id}`} className="tutor-learn-more">
                        Learn More
                      </Link>
                    </div>
                  </div>

                  <div className="tutor-card-right">
                    <div className="tutor-rate">
                      <span className="tutor-rate-amount">${tutor.hourlyRate}</span>
                      <span className="tutor-rate-unit">/hr</span>
                    </div>
                    {/*
                    <button
                      type="button"
                      className="tutor-chat-button"
                      aria-label={`Message ${tutor.name}`}
                      onClick={() => handleOpenChat(tutor.id, tutor.name)}
                    >
                      💬
                    </button>
                    */}
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