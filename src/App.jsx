import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SubjectsPage from './pages/SubjectsPage'
import TutorsPage from './pages/TutorsPage'
import ContactPage from './pages/ContactPage'
import './App.css'

function App() {
  return (
    <div className="app-root">
      {/* Top navigation bar */}
      <header className="app-header">
        <Link to="/" className="header-left header-left-link">
          <img 
            src="/src/assets/company-logo.png" 
            alt="Growth Tutoring Logo" 
            className="logo-image" 
          />

          <div className="logo-text">
            <div className="logo-name">Growth Tutoring</div>
            <div className="logo-tagline">Learning that sticks</div>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/tutors" className="nav-link">Our Tutors</Link>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <Link to="/subjects" className="nav-link">Subjects</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </nav>

        <div className="header-right">
          <button className="btn btn-primary">Get Matched Today</button>
          <button className="btn btn-ghost">Sign in</button>
          <button className="btn btn-outline">Register</button>
        </div>
      </header>

      {/* Page content */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/tutors" element={<TutorsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-columns">
          <div className="footer-col">
            <div className="footer-logo">Growth Tutoring</div>
            <p className="footer-text">
              Helping students grow with personalized 1:1 tutoring and clear communication.
            </p>
          </div>

          <div className="footer-col">
            <h4>Growth Tutoring</h4>
            <a href="/about">About us</a>
            <a href="/contact">Contact us</a>
            <a href="/tutors">Our tutors</a>
            <a href="/subjects">Subjects</a>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <span>K–12 Math</span>
            <span>K–12 English</span>
            <span>Science</span>
            <span>Study Skills</span>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <span>Tutor Guidelines</span>
            <span>Parent Support</span>
            <span>Safety & Policies</span>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Growth Tutoring. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default App