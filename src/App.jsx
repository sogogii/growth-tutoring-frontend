import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SubjectsPage from './pages/SubjectsPage'
import TutorsPage from './pages/TutorsPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Top navigation bar */}
      <header
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: '#ffffffcc',
          backdropFilter: 'blur(8px)',
          zIndex: 10
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>
          Growth Tutoring
        </div>
        <nav style={{ display: 'flex', gap: '16px', fontSize: '15px' }}>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/subjects">Subjects</Link>
          <Link to="/tutors">Our Tutors</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 80px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/tutors" element={<TutorsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #eee',
          padding: '16px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#777'
        }}
      >
        © {new Date().getFullYear()} Growth Tutoring. All rights reserved.
      </footer>
    </div>
  )
}

export default App