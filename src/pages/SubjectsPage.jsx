const SUBJECTS = [
  { name: 'Mathematics', levels: 'Elementary · Middle · High School' },
  { name: 'Physics', levels: 'High School · AP' },
  { name: 'Chemistry', levels: 'High School · AP' },
  { name: 'English Writing', levels: 'Middle · High School' },
  { name: 'Study Skills / Planning', levels: 'All grades' }
]

function SubjectsPage() {
  return (
    <div>
      <h1>Subjects We Offer</h1>
      <p style={{ marginTop: '12px', maxWidth: '600px' }}>
        These are the main subjects we currently support. We can expand or customize
        offerings based on student needs.
      </p>

      <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
        {SUBJECTS.map((subject) => (
          <div
            key={subject.name}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <h3>{subject.name}</h3>
            <p style={{ color: '#555', marginTop: '4px' }}>{subject.levels}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubjectsPage
