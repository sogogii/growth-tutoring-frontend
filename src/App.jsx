import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SubjectsPage from './pages/SubjectsPage'
import TutorsPage from './pages/TutorsPage'
import ContactPage from './pages/ContactPage'
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
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/tutors" className="nav-link">Our Tutors</Link>
          <Link to="/how-it-works" className="nav-link">How It Works</Link>
          <Link to="/subjects" className="nav-link">Subjects</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </nav>

        <div className="header-right">
          {/* FIX THIS CODE AFTER IMPLEMENTATION */}
          <Link to="/coming-soon" button className="btn btn-primary">Get Matched Today</Link>
          <button className="btn btn-ghost">Sign in</button>
          <button className="btn btn-outline">Register</button>
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
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
        </Routes>
      </main>

      {/* Footer */}
      {/* CHANGE REDIRECTION !!! */}
      
      <footer className="site-footer">
        <div className="footer-top">
          {/* Brand + socials */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              {/* use whatever logo import you already have */}
              <img src={logo} alt="Growth Tutoring" className="footer-logo" />

              {/* CHANGE SOCIAL MEDIA ICON LATER !!!*/}
              <div className="footer-socials">
                <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
                  𝕏
                </a>
                <a href="https://www.instagram.com/growthtutoringhq/" target="_blank" rel="noreferrer" aria-label="Instagram">
                  ◎
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                  ▶
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
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