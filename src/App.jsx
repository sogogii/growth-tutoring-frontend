import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'  

import HomePage from './pages/HomePage'
import AboutPage from './pages/main/AboutPage'
import SubjectsPage from './pages/main/SubjectsPage'
import TutorsPage from './pages/main/TutorsPage'
import TutorProfilePage from './pages/TutorProfilePage'
import ContactPage from './pages/main/ContactPage'
import SignupPage from './pages/login/SignupPage'
import SignupChoicePage from './pages/login/SignupChoicePage'
import LoginPage from './pages/login/LoginPage'
import ForgotPasswordPage from './pages/login/ForgotPasswordPage'
import MyProfilePage from './pages/MyProfilePage'
import SchedulePage from './pages/SchedulePage'
import CheckoutPage from './pages/CheckoutPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import StudentSessionsPage from './pages/StudentSessionsPage'
import ComingSoonPage from './pages/ComingSoonPage'
import HowItWorksPage from './pages/main/HowItWorksPage'
import HowItWorksStudents from './pages/main/HowItWorksStudents'
import HowItWorksTutors from './pages/main/HowItWorksTutors'
import HowItWorksCip from './pages/main/HowItWorksCip'
import ChatListPage from './pages/chat/ChatListPage'
import ChatPage from './pages/chat/ChatPage'
import AdminPage from './pages/AdminPage.jsx'

// relationship pages
import MyStudentsPage from './pages/MyStudentsPage'
import MyTutorsPage from './pages/MyTutorsPage'

import './App.css'
import logo from './assets/company-logo.png'

const IDLE_TIMEOUT_MINUTES = 30
const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE = RAW_API_BASE_URL.replace(/\/+$/, '')

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
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  const [pendingStudentCount, setPendingStudentCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const howItWorksRef = useRef(null)

  const handleLogout = (isIdle = false) => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('lastActivityAt')
    setCurrentUser(null)
    setPendingStudentCount(0)
    setIsUserMenuOpen(false)
    navigate('/') // go back to homepage

    if (isIdle) {
      alert(
        `You have been logged out after ${IDLE_TIMEOUT_MINUTES} minutes of inactivity.`
      )
    }
  }

  // --- Idle timeout ---
  useEffect(() => {
    if (!currentUser) return

    localStorage.setItem('lastActivityAt', String(Date.now()))

    const updateActivity = () => {
      localStorage.setItem('lastActivityAt', String(Date.now()))
    }

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']
    events.forEach((evt) => window.addEventListener(evt, updateActivity))

    const intervalId = setInterval(() => {
      const lastActivity = localStorage.getItem('lastActivityAt')
      if (!lastActivity) return

      const last = parseInt(lastActivity, 10)
      if (Number.isNaN(last)) return

      const now = Date.now()
      if (now - last >= IDLE_TIMEOUT_MS) {
        handleLogout(true)
      }
    }, 60 * 1000)

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity))
      clearInterval(intervalId)
    }
  }, [currentUser])

  // Close How It Works dropdown when clicking outside
  useEffect(() => {
    if (!isHowItWorksOpen) return

    const handleClickOutside = (e) => {
      if (howItWorksRef.current && !howItWorksRef.current.contains(e.target)) {
        setIsHowItWorksOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isHowItWorksOpen])

  // --- Pending student requests (for tutors) ---
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'TUTOR') {
      setPendingStudentCount(0)
      return
    }

    const loadPendingCount = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/tutors/user/${currentUser.userId}/student-requests`
        )
        if (!res.ok) {
          setPendingStudentCount(0)
          return
        }
        const data = await res.json()
        setPendingStudentCount(Array.isArray(data) ? data.length : 0)
      } catch (err) {
        console.error(err)
        setPendingStudentCount(0)
      }
    }

    loadPendingCount()
  }, [currentUser])

  // reusable function to fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!currentUser) {
      setMessageCount(0)
      return
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/chat/unread-count?userId=${currentUser.userId}`
      )
      if (!res.ok) {
        console.error('Failed to load unread count')
        setMessageCount(0)
        return
      }
      const data = await res.json()
      setMessageCount(typeof data === 'number' ? data : 0)
    } catch (err) {
      console.error('Error loading unread count', err)
      setMessageCount(0)
    }
  }, [currentUser])

  // still call it once when user/login changes
  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  // --- Close dropdown when clicking outside ---
  useEffect(() => {
    if (!isUserMenuOpen) return

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  const toggleUserMenu = () => {
    setIsUserMenuOpen((open) => !open)
  }

  const goTo = (path) => {
    navigate(path)
    setIsUserMenuOpen(false)
  }

  const avatarUrl = currentUser?.profileImageUrl || currentUser?.profile_image_url
  const avatarInitial = currentUser?.firstName?.[0] || 'M'

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
          <div className="nav-dropdown" ref={howItWorksRef}>
          <button
            type="button"
            className="nav-link nav-dropdown-trigger"
            onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
          >
            How It Works
            <span className={`nav-dropdown-caret ${isHowItWorksOpen ? 'open' : ''}`}>
              ▾
            </span>
          </button>
          
          {isHowItWorksOpen && (
            <div className="nav-dropdown-menu">
              <Link
                to="/how-it-works/students"
                className="nav-dropdown-item"
                onClick={() => setIsHowItWorksOpen(false)}
              >
                For Students & Parents
              </Link>
              <Link
                to="/how-it-works/tutors"
                className="nav-dropdown-item"
                onClick={() => setIsHowItWorksOpen(false)}
              >
                For Tutors
              </Link>
              <Link
                to="/how-it-works/cip"
                className="nav-dropdown-item"
                onClick={() => setIsHowItWorksOpen(false)}
              >
                For CIP
              </Link>
            </div>
          )}
        </div>
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
            <div className="header-user-section" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu-toggle"
                onClick={toggleUserMenu}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser.firstName}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar user-avatar-fallback">
                    {avatarInitial}
                  </div>
                )}
                <span className="user-menu-label">Me</span>
                <span
                  className={`user-menu-caret ${
                    isUserMenuOpen ? 'open' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-top">
                    <div className="user-menu-top-main">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={currentUser.firstName}
                          className="user-menu-avatar-lg"
                        />
                      ) : (
                        <div className="user-menu-avatar-lg user-avatar-fallback">
                          {avatarInitial}
                        </div>
                      )}
                      <div>
                        <div className="user-menu-name">
                          {currentUser.firstName} {currentUser.lastName}
                        </div>
                        <div className="user-menu-role">
                          {currentUser.role === 'TUTOR'
                            ? 'Tutor'
                            : currentUser.role === 'STUDENT'
                              ? 'Student'
                              : currentUser.role}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="user-menu-view-profile"
                      onClick={() => goTo('/my-profile')}
                    >
                      View profile
                    </button>
                  </div>

                  <div className="user-menu-section">
                    <div className="user-menu-section-title">Account</div>

                    {currentUser?.role === 'ADMIN' && (
                      <button
                        type="button"
                        className="user-menu-link"
                        onClick={() => goTo('/admin')}
                      >
                        Admin
                      </button>
                    )}
                    {currentUser.role === 'TUTOR' && (
                      <>
                        <button
                          type="button"
                          className="user-menu-link"
                          onClick={() => goTo('/my-students')}
                        >
                          My students
                          {pendingStudentCount > 0 && (
                            <span className="notif-badge">
                              {pendingStudentCount}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          className="user-menu-link"
                          onClick={() => goTo('/my-schedule')}
                        >
                          My schedule
                        </button>
                      </>
                    )}
                    {currentUser.role === 'STUDENT' && (
                      <button
                        type="button"
                        className="user-menu-link"
                        onClick={() => goTo('/my-tutors')}
                      >
                        My tutors
                      </button>
                    )}
                    {currentUser.role === 'STUDENT' && (
                      <button
                        type="button"
                        className="user-menu-link"
                        onClick={() => goTo('/my-sessions')}
                      >
                        My sessions
                      </button>
                    )}

                    <button
                      type="button"
                      className="user-menu-link"
                      onClick={() => {
                        navigate('/messages')
                        setIsUserMenuOpen(false)
                      }}
                    >
                      <span className="user-link-badge">
                        Messages
                        {messageCount > 0 && (
                          <span className="notif-badge">
                            {messageCount > 9 ? '9+' : messageCount}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>

                  <div className="user-menu-section user-menu-section-border">
                    <button
                      type="button"
                      className="user-menu-signout"
                      onClick={() => handleLogout(false)}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
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
          <Route
            path="/tutors"
            element={<TutorsPage currentUser={currentUser} />}
          />
          <Route
            path="/tutors/:id"
            element={<TutorProfilePage currentUser={currentUser} />}
          />

          {/* Step 1: choose Tutor vs Student */}
          <Route path="/signup" element={<SignupChoicePage />} />

          {/* Step 2: actual forms */}
          <Route
            path="/signup/tutor"
            element={<SignupPage fixedRole="TUTOR" />}
          />
          <Route
            path="/signup/student"
            element={<SignupPage fixedRole="STUDENT" />}
          />

          {/* Login page needs to update currentUser & localStorage */}
          <Route
            path="/login"
            element={<LoginPage setCurrentUser={setCurrentUser} />}
          />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route
            path="/my-profile"
            element={
              <MyProfilePage
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          />

          <Route
            path="/my-profile"
            element={
              <MyProfilePage
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          />

          {/* relationship pages */}
          <Route
            path="/my-students"
            element={<MyStudentsPage currentUser={currentUser} />}
          />
          <Route
            path="/my-tutors"
            element={<MyTutorsPage currentUser={currentUser} />}
          />

          <Route
            path="/my-schedule"
            element={
              <SchedulePage currentUser={currentUser} />
            }
          />

          <Route path="/my-sessions" element={<StudentSessionsPage />} />

          <Route path="/how-it-works/students" element={<HowItWorksStudents />} />
          <Route path="/how-it-works/tutors" element={<HowItWorksTutors />} />
          <Route path="/how-it-works/cip" element={<HowItWorksCip />} />

          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/messages"
            element={<ChatListPage currentUser={currentUser} />}
          />
          <Route
            path="/chat/:conversationId"
            element={
              <ChatPage
                currentUser={currentUser}
                refreshUnreadCount={refreshUnreadCount}
              />
            }
          />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />

          <Route path="/coming-soon" element={<ComingSoonPage />} />

          <Route
            path="/admin"
            element={
              currentUser && currentUser.role === 'ADMIN' ? (
                <AdminPage currentUser={currentUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-top">
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
