import { Link } from 'react-router-dom'
import './styles/TutorsPage.css'

// THIS WHOLE PAGE SHOULD BE FIXED , CONNECTED TO THE DATABASE
// THIS IS JUST A MOCKUP!!

const TUTORS = [
  {
    id: 'sungokw',
    name: 'Sungok Woo',
    rating: 5,
    joined: 'November 2025',
    subject: 'K–12 Math',
    experienceYears: 1,
    lessonsTaught: 62,
    education: "Master's in Mathematics @ University of California, Irvine",
    method: 'Online & In-Person',
    summary:
      "Hello, I’m Sungok! I’m currently a PhD student at UCI, and I specialize in teaching AP Calculus and competition math.",
    rate: 60,
  },
  {
    id: 'jerryz',
    name: 'Jerry Zhang',
    rating: 5,
    joined: 'January 2025',
    subject: 'K–10 English',
    experienceYears: 2,
    lessonsTaught: 100,
    education: "Bachelor's in English @ University of California, Los Angeles",
    method: 'Online & In-Person',
    summary:
      "Hello, I’m Jerry, and I graduated from UCLA. I help students build strong reading and writing foundations with clear feedback.",
    rate: 120,
  },
  {
    id: 'mathieuk',
    name: 'Mathieu Khalaf',
    rating: 5,
    joined: 'March 2025',
    subject: 'Pre College Counseling',
    experienceYears: 4,
    lessonsTaught: 200,
    education: "Master's in Education @ University of California, Irvine",
    method: 'Online & In-Person',
    summary:
      'Hello, I’m Mathieu. I have several years of experience guiding students through college applications, essays, and interviews.',
    rate: 70,
  },
  {
    id: 'josephl',
    name: 'Joseph Lu',
    rating: 5,
    joined: '2025',
    subject: 'K–12 Biology',
    experienceYears: 1,
    lessonsTaught: 43,
    education: "Master's in Biology @ University of Southern California",
    method: 'Online & In-Person',
    summary:
      'Hello, I’m Joseph. I enjoy helping students make sense of biology with diagrams, practice questions, and exam strategies.',
    rate: 50,
  },
  {
    id: 'tylerk',
    name: 'Tyler Kuwada',
    rating: 5,
    joined: 'August 2025',
    subject: 'K–12 Chemistry',
    experienceYears: 10,
    lessonsTaught: 80,
    education: "Master's in Chemistry @ CSU Long Beach",
    method: 'Online & In-Person',
    summary:
      'Hello, I’m Tyler! I have 10 years of experience teaching chemistry and love breaking down complex concepts into simple steps.',
    rate: 65,
  },
  {
    id: 'carlq',
    name: 'Carl Qiao',
    rating: 5,
    joined: 'July 2025',
    subject: 'K–8 Math',
    experienceYears: 1,
    lessonsTaught: 51,
    education: 'Student in Mathematics @ University of California, Irvine',
    method: 'Online & In-Person',
    summary:
      'Hello, I’m Carl! I’m a 3rd-year math student at UCI and focus on helping younger students build strong foundations.',
    rate: 30,
  },
  {
    id: 'lenap',
    name: 'Lena Park',
    rating: 5,
    joined: 'March 2025',
    subject: 'K–12 Physics',
    experienceYears: 3,
    lessonsTaught: 90,
    education: "Master's in Aerospace Engineering @ MIT",
    method: 'Online Only',
    summary:
      'Hello, I’m Lena. I love teaching physics with real-world examples and help students gain intuition for challenging topics.',
    rate: 100,
  },
]

function StarRating({ rating }) {
  return (
    <span className="tutor-rating">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

function TutorsPage() {
  return (
    <div className="tutors-page">
      {/* Top banner */}
      <section className="tutors-hero">
        <h1>Our Tutors</h1>
      </section>

      {/* Main content */}
      <section className="tutors-content">
        {/* Search bar section */}
        <header className="tutors-search-header">
          <h2>Search For Tutors</h2>
          <div className="tutors-search-row">
            <input
              className="tutors-search-input"
              type="text"
              placeholder="You can type in tutor's name, subject, etc..."
            />
            <button type="button" className="tutors-filter-button" aria-label="Filter tutors">
              {/* simple funnel icon using SVG */}
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
        </header>

        {/* Tutor list */}
        <div className="tutors-list">
          {TUTORS.map((tutor) => (
            <article key={tutor.id} className="tutor-card">
              <div className="tutor-card-left">
                <div className="tutor-image-placeholder" aria-hidden="true" />
              </div>

              <div className="tutor-card-main">
                <div className="tutor-card-header">
                  <span className="tutor-name">{tutor.name}</span>
                  <StarRating rating={tutor.rating} />
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
                    <strong>Method:</strong> {tutor.method}
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
                  <span className="tutor-rate-amount">${tutor.rate}</span>
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

        {/* Pagination */}
        <footer className="tutors-pagination">
          <button className="tutors-page-link" disabled>
            ← Previous
          </button>
          <button className="tutors-page-link is-active">1</button>
          <button className="tutors-page-link">2</button>
          <button className="tutors-page-link">3</button>
          <span className="tutors-page-ellipsis">…</span>
          <button className="tutors-page-link">67</button>
          <button className="tutors-page-link">68</button>
          <button className="tutors-page-link">Next →</button>
        </footer>
      </section>
    </div>
  )
}

export default TutorsPage