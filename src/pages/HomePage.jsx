const cardStyle = {
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '16px',
  flex: '1 1 220px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
}

function HomePage() {
  return (
    <div>
      <h1>Personalized tutoring for real growth</h1>
      <p style={{ marginTop: '12px', maxWidth: '600px' }}>
        Growth Tutoring focuses on tailored lessons that match each student&apos;s goals,
        subjects, and learning style.
      </p>

      <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <h3>1:1 Customized Sessions</h3>
          <p>We design a learning plan based on the student&apos;s current level and goals.</p>
        </div>
        <div style={cardStyle}>
          <h3>Verified Tutors</h3>
          <p>Every tutor is reviewed and approved before their profile goes live.</p>
        </div>
        <div style={cardStyle}>
          <h3>After-Lesson Reports</h3>
          <p>Parents receive a clear summary of each session by email.</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage