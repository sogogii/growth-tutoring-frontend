// src/App.jsx
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SubjectsPage from './pages/SubjectsPage'
import TutorsPage from './pages/TutorsPage'
import TutorProfilePage from './pages/TutorProfilePage'
import ContactPage from './pages/ContactPage'
import SignupPage from './pages/login/SignupPage'
import SignupChoicePage from './pages/login/SignupChoicePage'
import LoginPage from './pages/login/LoginPage'
import ComingSoonPage from './pages/ComingSoonPage'
import HowItWorksPage from './pages/HowItWorksPage'

import './App.css'
import logo from './assets/company-logo.png'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  return null
}

function App() {
  // Load current user from localStorage on first render
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    navigate('/') // go back to homepage
  }

  return (
    <div className="app-root">
      {/* Top navigation bar */}
      <header className="app-header">
        <Link to="/" className="header-left header-left-link">
          <img
            src={logo}
            alt="Growth Tutoring Logo"
            className="logo-image"
          />

          <div className="logo-text">
            <div className="logo-name">Growth Tutoring</div>
            <div className="logo-tagline">Learning that sticks</div>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/about" className="nav-link">
            About Us
          </Link>
          <Link to="/tutors" className="nav-link">
            Our Tutors
          </Link>
          <Link to="/how-it-works" className="nav-link">
            How It Works
          </Link>
          <Link to="/subjects" className="nav-link">
            Subjects
          </Link>
          <Link to="/contact" className="nav-link">
            Contact Us
          </Link>
        </nav>

        <div className="header-right">
          <Link to="/coming-soon" className="btn btn-primary">
            Get Matched Today
          </Link>

          {currentUser ? (
            <div className="header-user-section">
              <span className="user-greeting">
                Hi, {currentUser.firstName}!
              </span>

              <Link to="/my-profile" className="user-link">
                My Profile
              </Link>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-outline">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="app-main">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/tutors" element={<TutorsPage />} />
          <Route path="/tutors/:id" element={<TutorProfilePage />} />
          {/* Step 1: choose Tutor vs Student */}
          <Route path="/signup" element={<SignupChoicePage />} />

          {/* Step 2: actual forms */}
          <Route path="/signup/tutor" element={<SignupPage fixedRole="TUTOR" />} />
          <Route path="/signup/student" element={<SignupPage fixedRole="STUDENT" />} />
          {/* pass setCurrentUser so LoginPage can update header + localStorage */}
          <Route
            path="/login"
            element={<LoginPage setCurrentUser={setCurrentUser} />}
          />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          {/* temporary: My Profile uses ComingSoon page */}
          <Route path="/my-profile" element={<ComingSoonPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-top">
          {/* Brand + socials */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src={logo} alt="Growth Tutoring" className="footer-logo" />

              <div className="footer-socials">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X"
                >
                  𝕏
                </a>
                <a
                  href="https://www.instagram.com/growthtutoringhq/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  ◎
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                >
                  ▶
                </a>
                <a
                  href="https://www.linkedin.com/company/growth-tutoring-llc/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  in
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="footer-links-grid">
            <div className="footer-column">
              <h4>Growth Tutoring</h4>
              <Link to="/about">About us</Link>
              <Link to="/contact">Contact us</Link>
              <Link to="/tutors">Our tutors</Link>
              <Link to="/coming-soon">Join Us</Link>
              <Link to="/coming-soon">FAQ</Link>
              <Link to="/coming-soon">Technology</Link>
              <Link to="/how-it-works">How it works</Link>
            </div>

            <div className="footer-column">
              <h4>Explore</h4>
              <Link to="/subjects">K-12 Math</Link>
              <Link to="/subjects">K-12 English</Link>
              <Link to="/subjects">K-12 Sciences</Link>
              <Link to="/subjects">Foreign Languages</Link>
              <Link to="/subjects">Pre College Counseling</Link>
              <Link to="/subjects">Special Needs Tutoring</Link>
              <Link to="/coming-soon">Online Courses</Link>
              <Link to="/coming-soon">Community Impact Program</Link>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <Link to="/coming-soon">Tutor Guidelines</Link>
              <Link to="/coming-soon">Learning Tips</Link>
              <Link to="/coming-soon">Parent Support</Link>
              <Link to="/coming-soon">Blog</Link>
              <Link to="/coming-soon">Safety &amp; Security Policies</Link>
              <Link to="/coming-soon">Terms of Service</Link>
              <Link to="/coming-soon">Resource library</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Growth Tutoring LLC. All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}

export default App
