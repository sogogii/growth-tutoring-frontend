import { Link } from 'react-router-dom'
import './styles/HomePage.css'

function HomePage() {
  return (
    <div className="home">
      {/* Full-width banner section */}
      <section className="hero-banner">
        <div className="hero-banner-content">
          <p className="hero-banner-company">GROWTH TUTORING LLC</p>
          <h1 className="hero-banner-text">Empowering students to excel academically</h1>
        </div>
      </section>

      {/* Enhanced Hero section */}
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

      {/* Quick How It Works */}
      <section className="section section-how-it-works">
        <h2 className="section-title center">How Growth Tutoring Works</h2>
        <p className="section-text center">
          Getting started is simple. We handle the matching, you focus on learning.
        </p>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">🔍</div>
            <div className="step-number">Step 1</div>
            <h3 className="step-title">Find Your Tutor</h3>
            <p className="step-description">
              Search by subject, availability, or learning style. Filter through hundreds of vetted tutors.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-icon">📅</div>
            <div className="step-number">Step 2</div>
            <h3 className="step-title">Book Sessions</h3>
            <p className="step-description">
              Schedule sessions that fit your calendar. Flexible timing with easy rescheduling.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-icon">📈</div>
            <div className="step-number">Step 3</div>
            <h3 className="step-title">Track Progress</h3>
            <p className="step-description">
              Receive detailed reports after each session. Monitor improvement with data-driven insights.
            </p>
          </div>
        </div>

        <div className="section-cta">
          <Link to="/how-it-works/students" className="btn btn-outline">
            Learn More About Our Process
          </Link>
        </div>
      </section>

      {/* Top tutors */}
      <section className="section" aria-label="Top tutors">
        <div className="section-header">
          <h2 className="section-title">Top Tutors This Month</h2>
          <span className="section-subtitle">December 2024</span>
        </div>
        <p className="section-intro-text">
          Meet our highest-rated tutors who consistently deliver exceptional results.
        </p>

        <div className="tutor-list">
          <TutorCard
            name="Kyle"
            rating={5}
            sessions={127}
            summary="Over 6 years of tutoring experience and a Master's degree in Mathematics Education."
            detail="Specializes in helping students build strong foundations and exam strategies in math."
            subjects={["Math", "Calculus", "SAT Prep"]}
          />
          <TutorCard
            name="Aliya"
            rating={5}
            sessions={98}
            summary="Known for making complex science topics easy to understand for younger students."
            detail="Celebrated for clear explanations and detailed after-lesson reports."
            subjects={["Biology", "Chemistry", "Physics"]}
          />
          <TutorCard
            name="Yang"
            rating={5}
            sessions={84}
            summary="Chemistry and Mandarin tutor with experience teaching diverse learners."
            detail="Students consistently report improved grades and confidence after lessons."
            subjects={["Chemistry", "Mandarin", "STEM"]}
          />
        </div>

        <div className="section-cta">
          <Link to="/tutors" className="btn btn-primary">
            View All Tutors
          </Link>
        </div>
      </section>

      {/* Testimonials */}
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
            <h2 className="section-title">Powered by Growth AI</h2>
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