import { Link } from 'react-router-dom'
import './styles/HomePage.css'
import { useState, useEffect, useRef } from 'react'
import findTutorImage from '../assets/homepage-find-your-tutor.jpg'
import bookSessionsImage from '../assets/homepage-book-sessions.jpg'
import trackProgressImage from '../assets/homepage-track-progress.jpg'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function TopTutorsSection() {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    const fetchTopTutors = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tutors`)
        if (res.ok) {
          const data = await res.json()
          
          const mapped = data.map((t) => ({
            userId: t.userId,
            name: `${t.firstName} ${t.lastName}`,
            rating: t.ratingAvg ?? 0,
            ratingCount: t.ratingCount ?? 0,
            subjectLabel: t.subjectLabel,
            headline: t.headline || '',
            hourlyRate: t.hourlyRate,
            profileImageUrl: t.profileImageUrl || null
          }))
          
          const topTutors = mapped
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)
          
          setTutors(topTutors)
        }
      } catch (err) {
        console.error('Error loading top tutors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopTutors()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || tutors.length === 0) return

    let animationFrameId
    let isScrolling = true

    const continuousScroll = () => {
      if (!isScrolling) return

      // Scroll by 1 pixel to the right (adjust for speed)
      scrollContainer.scrollLeft += 0.5 // Change this value to control speed

      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
      
      // Loop back to start when reaching the end
      if (scrollContainer.scrollLeft >= maxScroll) {
        scrollContainer.scrollLeft = 0
      }

      animationFrameId = requestAnimationFrame(continuousScroll)
    }

    // Start scrolling after a short delay
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(continuousScroll)
    }, 1000)

    // Pause on hover
    const handleMouseEnter = () => {
      isScrolling = false
      cancelAnimationFrame(animationFrameId)
    }
    
    const handleMouseLeave = () => {
      isScrolling = true
      animationFrameId = requestAnimationFrame(continuousScroll)
    }

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(timeoutId)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [tutors])

  if (loading) {
    return (
      <section className="section section-top-tutors">
        <h2 className="top-tutors-title">Our Top Tutors</h2>
        <p className="section-text center">Loading...</p>
      </section>
    )
  }

  if (tutors.length === 0) {
    return null
  }

  return (
    <section className="section section-top-tutors">
      <h2 className="top-tutors-title">Our Top Tutors</h2>
      <p className="section-text center">
        Meet our highest-rated tutors who consistently deliver exceptional results.
      </p>

      <div className="top-tutors-carousel">
        <div className="top-tutors-scroll" ref={scrollRef}>
          {tutors.map((tutor) => (
            <Link 
              key={tutor.userId} 
              to={`/tutors/${tutor.userId}`} 
              className="top-tutor-card"
            >
              <div className="top-tutor-avatar">
                {tutor.profileImageUrl ? (
                  <img src={tutor.profileImageUrl} alt={tutor.name} />
                ) : (
                  <div className="top-tutor-avatar-placeholder">
                    {tutor.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="top-tutor-info">
                <h3 className="top-tutor-name">{tutor.name}</h3>
                
                <div className="top-tutor-rating">
                  <span className="stars">★</span>
                  <span className="rating-number">
                    {tutor.rating.toFixed(1)}
                  </span>
                  <span className="rating-count">
                    ({tutor.ratingCount} reviews)
                  </span>
                </div>
                
                {tutor.subjectLabel && (
                  <div className="top-tutor-subjects">
                    {tutor.subjectLabel}
                  </div>
                )}
                
                {tutor.headline && (
                  <p className="top-tutor-bio">{tutor.headline}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="section-cta">
        <Link to="/tutors" className="btn btn-primary">
          View All Tutors
        </Link>
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <div className="home">
      {/* Full-width banner section */}
      <section className="hero-banner">
        <div className="hero-banner-content">
          <p className="hero-banner-company">GROWTH TUTORING LLC</p>
          <h1 className="hero-banner-text">Tutor Matching Platform Built on Trust</h1>
        </div>
      </section>

      {/* Enhanced Hero section */}
      {/*
      <section className="hero">
        <p className="hero-kicker">Searching for growth?</p>
        <h1 className="hero-title">
          Find the right tutor and make every lesson count.
        </h1>
        <p className="hero-subtitle">
          Connect with vetted tutors who match your goals and learning style.
        </p>

        <div className="hero-actions">
          <div className="hero-search">
            <input
              type="text"
              placeholder="What would you like to learn today?"
              className="hero-search-input"
            />
            <button className="hero-search-button">Search</button>
          </div>
          
          
          <div className="hero-cta-buttons">
            <Link to="/coming-soon" className="btn btn-primary">
              Get Matched Today
            </Link>
            <Link to="/tutors" className="btn btn-outline">
              Browse Tutors
            </Link>
          </div>
        </div>
      </section>
      */}

      {/* Quick How It Works */}
      <section className="section section-how-it-works">
        <h2 className="how-works-title">How Growth Tutoring Works</h2>
        <p className="section-text center">
          Getting started is simple. We handle the matching, you focus on learning.
        </p>
        
        <div className="steps-grid">
          <div className="step-card step-card-split">
            <div className="step-card-image">
              <img src={findTutorImage} alt="Find Your Tutor" />
            </div>
            <div className="step-card-text">
              <div className="step-number-badge">Step 1</div>
              <h3 className="step-item-title">Find Your Tutor</h3>
              <p className="step-item-description">
                Search by subject, availability, or learning style. Filter through vetted tutors.
              </p>
            </div>
          </div>

          <div className="step-card step-card-split">
            <div className="step-card-image step-card-image-2">
              <img src={bookSessionsImage} alt="Book Sessions" />
            </div>
            <div className="step-card-text">
              <div className="step-number-badge">Step 2</div>
              <h3 className="step-item-title">Book Sessions</h3>
              <p className="step-item-description">
                Schedule sessions that fit your calendar. Flexible timing with easy rescheduling.
              </p>
            </div>
          </div>

          <div className="step-card step-card-split">
            <div className="step-card-image">
              <img src={trackProgressImage} alt="Track Progress" />
            </div>
            <div className="step-card-text">
              <div className="step-number-badge">Step 3</div>
              <h3 className="step-item-title">Track Progress</h3>
              <p className="step-item-description">
                Receive detailed reports after each session. Monitor improvement with data-driven insights.
              </p>
            </div>
          </div>
        </div>

        <div className="section-cta">
          <Link to="/how-it-works/students" className="btn btn-outline">
            Learn More About Our Process
          </Link>
        </div>
      </section>

      {/* Top tutors */}
      <TopTutorsSection />

      {/* Testimonials */}
      {/*}
      <section className="section section-testimonials" aria-label="Testimonials">
        <h2 className="section-title center">What Families Are Saying</h2>
        <p className="section-text center">
          Real feedback from students and parents who've experienced the Growth Tutoring difference.
        </p>
        
        <div className="testimonials-grid">
          <TestimonialCard
            title="Outstanding Results!"
            text="Jeremy is always patient with my son no matter how hard math gets. His grades improved from a C to an A in just 3 months."
            name="Leo"
            role="12th grader"
            metric="C → A in 3 months"
          />
          <TestimonialCard
            title="Fast and Reliable!"
            text="I am thankful that Growth Tutoring offers flexible scheduling and clear lesson reports. Communication is seamless."
            name="Sandra"
            role="Parent"
            metric="50+ sessions completed"
          />
          <TestimonialCard
            title="High-Tech Platform"
            text="The reports and progress tracking make it so easy to understand how my child is doing. Best investment we've made."
            name="Dave"
            role="Parent"
            metric="4.8/5 average rating"
          />
        </div>
      </section>
      

      {/* Growth AI */}
      <section className="section section-ai">
        <div className="ai-content">
          <div className="ai-text-content">
            <h2 className="section-title">Powered by Growth AI (COMING SOON)</h2>
            <p className="section-text">
              Our intelligent matching system pairs students with tutors based on learning style, 
              goals, and schedule compatibility. After each session, tutors provide structured 
              reports that help track progress and identify areas for improvement.
            </p>
            <ul className="ai-features-list">
              <li>
                <span className="ai-feature-icon">✓</span>
                <span>Smart tutor-student matching</span>
              </li>
              <li>
                <span className="ai-feature-icon">✓</span>
                <span>Automated progress tracking</span>
              </li>
              <li>
                <span className="ai-feature-icon">✓</span>
                <span>Personalized learning insights</span>
              </li>
              <li>
                <span className="ai-feature-icon">✓</span>
                <span>Data-driven recommendations</span>
              </li>
            </ul>
          </div>
          
          <div className="ai-card">
            <div className="ai-icon">💬</div>
            <h3>Growth Chatbox</h3>
            <p>
              Ask questions about subjects, scheduling, or our tutoring process. 
              Get instant answers 24/7.
            </p>
            <button className="btn btn-outline-sm">Try Now</button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section section-final-cta">
        <div className="final-cta-content">
          <p className="final-cta-subtitle">
            Join thousands of students achieving their academic goals with personalized tutoring.
          </p>
          <div className="final-cta-buttons">
            <Link to="/signup" className="cta-button cta-button-primary">
              Get Started Free
            </Link>
            <Link to="/contact" className="cta-button cta-button-secondary">
              Contact Us
            </Link>
          </div>
          <div className="final-cta-divider"></div>
          <p className="final-cta-quote">
            "At Growth Tutoring, we provide the highest quality service for all students. We use technology to make learning personal, efficient, and effective."
          </p>
          <p className="final-cta-author">— Founder of Growth Tutoring</p>
        </div>
      </section>
    </div>
  )
}

function TestimonialCard({ title, text, name, role, metric }) {
  return (
    <article className="testimonial-card">
      <div className="stars">★★★★★</div>
      <h3>{title}</h3>
      <p className="testimonial-text">{text}</p>
      {metric && <div className="testimonial-metric">{metric}</div>}
      <div className="testimonial-footer">
        <div className="avatar-placeholder" />
        <div>
          <div className="testimonial-name">{name}</div>
          <div className="testimonial-role">{role}</div>
        </div>
      </div>
    </article>
  )
}

function TutorCard({ name, rating, sessions, summary, detail, subjects }) {
  return (
    <article className="tutor-card">
      <div className="tutor-card-main">
        <div className="avatar-large" />
        <div className="tutor-info">
          <div className="tutor-header">
            <div>
              <h3>{name}</h3>
              <div className="tutor-meta">
                <span className="stars">{'★'.repeat(rating)}</span>
                <span className="tutor-sessions">{sessions} sessions</span>
              </div>
            </div>
          </div>
          {subjects && (
            <div className="tutor-subjects">
              {subjects.map((subject, idx) => (
                <span key={idx} className="subject-tag">{subject}</span>
              ))}
            </div>
          )}
          <p className="tutor-summary">{summary}</p>
          <p className="tutor-detail">{detail}</p>
          <Link to={`/tutors/${name.toLowerCase()}`} className="btn btn-outline-sm">
            View Profile
          </Link>
        </div>
      </div>
    </article>
  )
}

export default HomePage