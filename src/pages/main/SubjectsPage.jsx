import { Link } from 'react-router-dom'
import './styles/SubjectsPage.css'

const SUBJECTS = [
  {
    name: 'Mathematics',
    description:
      'From foundational skills to advanced problem solving. Build confidence in algebra, geometry, calculus, and more.',
    icon: '📐',
    filterValue: 'K-12 Math'
  },
  {
    name: 'English Reading & Writing',
    description:
      'Improve reading comprehension, grammar, and essay writing with clear feedback and practice.',
    icon: '📖',
    filterValue: 'K-12 English'
  },
  {
    name: 'Special Needs Services',
    description:
      'Individualized support tailored to different learning styles and needs, with a focus on structure and clarity.',
    icon: '🤝',
    filterValue: 'Special needs tutoring'
  },
  {
    name: 'Physics',
    description:
      'Support with mechanics, waves, and introductory physics topics, focusing on intuition and practice problems.',
    icon: '⚛️',
    filterValue: 'Physics'
  },
  {
    name: 'Chemistry',
    description:
      'Support for general chemistry and AP courses, with emphasis on concepts, labs, and exam preparation.',
    icon: '🧪',
    filterValue: 'Chemistry'
  },
  {
    name: 'Biology',
    description:
      'Help with cell biology, genetics, ecology, and exam strategies for high school and introductory college courses.',
    icon: '🧬',
    filterValue: 'Biology'
  },
  {
    name: 'Foreign Languages',
    description:
      'Practice vocabulary, grammar, and conversation skills in languages such as Spanish, Mandarin, and more.',
    icon: '🌍',
    filterValue: 'Foreign Languages'
  },
  {
    name: 'Pre College Counseling',
    description:
      'Guidance on course planning, applications, essays, and study habits to prepare for college.',
    icon: '🎓',
    filterValue: 'Pre College Counseling'
  },
  {
    name: 'Community Impact Program',
    description:
      'Grant-supported tutoring and mentoring opportunities for students who qualify for the Community Impact Program.',
    icon: '💫',
    filterValue: null // No filter for this one
  },
]

function SubjectsPage() {
  return (
    <div className="subjects-page">
      {/* Top banner */}
      <section className="subjects-hero">
        <h1>Subjects</h1>
      </section>

      {/* Main content */}
      <section className="subjects-content">
        <header className="subjects-intro">
          <h2>Subjects we offer</h2>
          <p>Find the right one for you.</p>
        </header>

        <div className="subjects-grid">
          {SUBJECTS.map((subject) => (
            subject.filterValue ? (
              <Link
                key={subject.name}
                to="/tutors"
                state={{ selectedSubject: subject.filterValue }}
                className="subject-card"
              >
                <div className="subject-icon">
                  {subject.icon}
                </div>
                <h3 className="subject-title">{subject.name}</h3>
                <p className="subject-description">{subject.description}</p>
                <div className="subject-link-arrow">→</div>
              </Link>
            ) : (
              <div key={subject.name} className="subject-card subject-card-disabled">
                <div className="subject-icon">
                  {subject.icon}
                </div>
                <h3 className="subject-title">{subject.name}</h3>
                <p className="subject-description">{subject.description}</p>
              </div>
            )
          ))}
        </div>
      </section>
    </div>
  )
}

export default SubjectsPage