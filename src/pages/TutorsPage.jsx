const MOCK_TUTORS = [
  {
    id: 'T-000001',
    name: 'Daniel Woo',
    subjects: ['Mathematics', 'Physics'],
    levels: 'Middle · High School',
    format: 'In-person & Online',
    experience: '3+ years of tutoring with a focus on problem-solving and exam strategy.'
  },
  {
    id: 'T-000002',
    name: 'Jerry Zhang',
    subjects: ['English Writing'],
    levels: 'Middle · High School',
    format: 'In-person & Online',
    experience: 'Helps students with essay structure, clarity, and academic writing skills.'
  }
]

function TutorsPage() {
  return (
    <div>
      <h1>Our Tutors</h1>
      <p style={{ marginTop: '12px', maxWidth: '600px' }}>
        All tutors go through a review and approval process before their profiles are published.
        The examples below are placeholder profiles that you can replace with real data later.
      </p>

      <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
        {MOCK_TUTORS.map((tutor) => (
          <div
            key={tutor.id}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '14px', color: '#888' }}>{tutor.id}</div>
            <h3 style={{ margin: '4px 0 8px' }}>{tutor.name}</h3>
            <p>
              <b>Subjects:</b> {tutor.subjects.join(', ')}
            </p>
            <p>
              <b>Grade levels:</b> {tutor.levels}
            </p>
            <p>
              <b>Format:</b> {tutor.format}
            </p>
            <p style={{ marginTop: '8px' }}>{tutor.experience}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TutorsPage
