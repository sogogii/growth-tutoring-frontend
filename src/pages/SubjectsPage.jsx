import './styles/SubjectsPage.css'

const SUBJECTS = [
  {
    name: 'Mathematics',
    description:
      'From foundational skills to advanced problem solving. Build confidence in algebra, geometry, calculus, and more.',
  },
  {
    name: 'Special Needs Services',
    description:
      'Individualized support tailored to different learning styles and needs, with a focus on structure and clarity.',
  },
  {
    name: 'Chemistry',
    description:
      'Support for general chemistry and AP courses, with emphasis on concepts, labs, and exam preparation.',
  },
  {
    name: 'English Reading & Writing',
    description:
      'Improve reading comprehension, grammar, and essay writing with clear feedback and practice.',
  },
  {
    name: 'Biology',
    description:
      'Help with cell biology, genetics, ecology, and exam strategies for high school and introductory college courses.',
  },
  {
    name: 'Physics',
    description:
      'Support with mechanics, waves, and introductory physics topics, focusing on intuition and practice problems.',
  },
  {
    name: 'Foreign Languages',
    description:
      'Practice vocabulary, grammar, and conversation skills in languages such as Spanish, Mandarin, and more.',
  },
  {
    name: 'Pre College Counseling',
    description:
      'Guidance on course planning, applications, essays, and study habits to prepare for college.',
  },
  {
    name: 'Community Impact Program',
    description:
      'Grant-supported tutoring and mentoring opportunities for students who qualify for the Community Impact Program.',
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
            <article key={subject.name} className="subject-card">
              <div className="subject-image-placeholder" aria-hidden="true">
                <span className="subject-image-icon">📚</span>
              </div>
              <h3 className="subject-title">{subject.name}</h3>
              <p className="subject-description">{subject.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default SubjectsPage