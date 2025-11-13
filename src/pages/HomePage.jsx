function HomePage() {
  return (
    <div className="home">
      {/* Hero section */}
      <section className="hero">
        <p className="hero-kicker">Searching for growth?</p>
        <h1 className="hero-title">
          Find the right tutor and make every lesson count.
        </h1>
        <p className="hero-subtitle">
          We connect students with vetted tutors and use data to keep every session focused,
          effective, and personal.
        </p>

        <div className="hero-search">
          <input
            type="text"
            placeholder="What would you like to learn today?"
            className="hero-search-input"
          />
          <button className="hero-search-button">Search</button>
        </div>

        <p className="hero-quote">
          “At Growth Tutoring, we aim to provide the highest quality of service for all students.
          We pair students with the best tutors and use technology to make learning personal,
          efficient, and effective.”
          <br />
          <span className="hero-quote-author">
            — Founder of Growth Tutoring
          </span>
        </p>
      </section>

      {/* Testimonials */}
      <section className="section" aria-label="Testimonials">
        <h2 className="section-title">What families are saying</h2>
        <div className="testimonials-grid">
          <TestimonialCard
            title="Outstanding!"
            text="Jeremy is always patient with my son no matter how hard math gets. Highly recommend."
            name="Leo"
            role="12th grader"
          />
          <TestimonialCard
            title="Fast and reliable!"
            text="I am thankful that Growth Tutoring offers flexible scheduling and clear lesson reports."
            name="Sandra"
            role="Parent"
          />
          <TestimonialCard
            title="High-tech platform"
            text="The reports and progress tracking make it so easy to understand how my child is doing."
            name="Dave"
            role="Parent"
          />
        </div>
      </section>

      {/* Top tutors */}
      <section className="section" aria-label="Top tutors">
        <div className="section-header">
          <h2 className="section-title">Top Tutors</h2>
          <span className="section-subtitle">November 2025</span>
        </div>

        <div className="tutor-list">
          <TutorCard
            name="Kyle"
            rating={5}
            summary="Over 6 years of tutoring experience and a Master’s degree in Mathematics Education."
            detail="Specializes in helping students build strong foundations and exam strategies in math."
          />
          <TutorCard
            name="Aliya"
            rating={5}
            summary="Known for making complex science topics easy to understand for younger students."
            detail="Celebrated for clear explanations and detailed after-lesson reports."
          />
          <TutorCard
            name="Yang"
            rating={5}
            summary="Chemistry and Mandarin tutor with experience teaching diverse learners."
            detail="Students consistently report improved grades and confidence after lessons."
          />
        </div>
      </section>

      {/* Growth AI / How it works */}
      <section id="how-it-works" className="section section-ai">
        <h2 className="section-title center">Growth AI</h2>
        <p className="section-text center">
          We use a simple matching process to pair students with tutors who fit their goals,
          schedule, and learning style. After each session, tutors send a clear, structured
          lesson report to parents so progress is easy to follow.
        </p>

        <div className="ai-card">
          <div className="ai-icon">💬</div>
          <h3>Growth Chatbox</h3>
          <p>
            Ask questions about subjects, scheduling, or our tutoring process.
            This is where your future AI assistant can live on the website.
          </p>
        </div>
      </section>
    </div>
  )
}

function TestimonialCard({ title, text, name, role }) {
  return (
    <article className="testimonial-card">
      <div className="stars">★★★★★</div>
      <h3>{title}</h3>
      <p className="testimonial-text">{text}</p>
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

function TutorCard({ name, rating, summary, detail }) {
  return (
    <article className="tutor-card">
      <div className="tutor-card-main">
        <div className="avatar-large" />
        <div className="tutor-info">
          <div className="tutor-header">
            <h3>{name}</h3>
            <span className="stars">{'★'.repeat(rating)}</span>
          </div>
          <p className="tutor-summary">{summary}</p>
          <p className="tutor-detail">{detail}</p>
          <button className="btn btn-outline-sm">Learn More</button>
        </div>
      </div>
    </article>
  )
}

export default HomePage
