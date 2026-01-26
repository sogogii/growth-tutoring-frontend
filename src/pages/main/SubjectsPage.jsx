import { Link } from 'react-router-dom'
import './styles/SubjectsPage.css'

const SUBJECTS = [
  {
    name: 'Mathematics',
    description:
      'From foundational skills to advanced problem solving. Build confidence in algebra, geometry, calculus, and more.',
    filterValue: 'K-12 Math'
  },
  {
    name: 'English Reading & Writing',
    description:
      'Improve reading comprehension, grammar, and essay writing with clear feedback and practice.',
    filterValue: 'K-12 English'
  },
  {
    name: 'Special Needs Services',
    description:
      'Individualized support tailored to different learning styles and needs, with a focus on structure and clarity.',
    filterValue: 'Special needs tutoring'
  },
  {
    name: 'Physics',
    description:
      'Support with mechanics, waves, and introductory physics topics, focusing on intuition and practice problems.',
    filterValue: 'Physics'
  },
  {
    name: 'Chemistry',
    description:
      'Support for general chemistry and AP courses, with emphasis on concepts, labs, and exam preparation.',
    filterValue: 'Chemistry'
  },
  {
    name: 'Biology',
    description:
      'Help with cell biology, genetics, ecology, and exam strategies for high school and introductory college courses.',
    filterValue: 'Biology'
  },
  {
    name: 'Foreign Languages',
    description:
      'Practice vocabulary, grammar, and conversation skills in languages such as Spanish, Mandarin, and more.',
    filterValue: 'Foreign Languages'
  },
  {
    name: 'Pre College Counseling',
    description:
      'Guidance on course planning, applications, essays, and study habits to prepare for college.',
    filterValue: 'Pre College Counseling'
  },
  {
    name: 'Community Impact Program',
    description:
      'Grant-supported tutoring and mentoring opportunities for students who qualify for the Community Impact Program.',
    filterValue: null
  },
]

function SubjectsPage() {
  return (
    <div className="subjects-page">
      {/* Hero Section */}
      <section className="subjects-hero">
        <div className="subjects-hero-content">
          <h1 className="subjects-hero-title">Our Subjects</h1>
          <p className="subjects-hero-subtitle">
            Expert tutoring across a wide range of subjects to help you succeed
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="subjects-container">
        
        {/* Subjects Grid Section */}
        <section className="subjects-section">
          <div className="subjects-section-header">
            <h2 className="subjects-section-title">Choose Your Subject</h2>
            <div className="subjects-section-line"></div>
            <p className="subjects-section-subtitle">
              Find verified tutors in the subject you need help with
            </p>
          </div>

          <div className="subjects-grid">
            {SUBJECTS.map((subject) => {
              return subject.filterValue ? (
                <Link
                  key={subject.name}
                  to="/tutors"
                  state={{ selectedSubject: subject.filterValue }}
                  className="subject-card"
                >
                  <div className="subject-card-content">
                    <h3 className="subject-title">{subject.name}</h3>
                    <p className="subject-description">{subject.description}</p>
                  </div>
                  <div className="subject-card-footer">
                    <span className="subject-link-text">Find Tutors</span>
                    <svg className="subject-link-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              ) : (
                <div key={subject.name} className="subject-card subject-card-disabled">
                  <div className="subject-card-content">
                    <h3 className="subject-title">{subject.name}</h3>
                    <p className="subject-description">{subject.description}</p>
                  </div>
                  <div className="subject-card-footer">
                    <span className="subject-coming-soon-badge">Coming Soon</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="subjects-cta-section">
          <div className="subjects-cta-card">
            <h3 className="subjects-cta-title">Don't see your subject?</h3>
            <p className="subjects-cta-text">
              We're always expanding our offerings. Contact us to let us know what subjects you're interested in.
            </p>
            <Link to="/contact" className="subjects-cta-button">
              Contact Us
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}

export default SubjectsPage