import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'  
import { FaInstagram, FaYoutube, FaLinkedin, FaTiktok } from 'react-icons/fa'

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
import MyPaymentsPage from './pages/MyPaymentsPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import StudentSessionsPage from './pages/StudentSessionsPage'
import StudentSessionsDetailPage from './pages/StudentSessionsDetailPage'
import TutorSessionsPage from './pages/TutorSessionsPage'
import TutorSessionsDetailPage from './pages/TutorSessionsDetailPage'
import MyEarningsPage from './pages/MyEarningsPage'
import MyReviewsPage from './pages/MyReviewsPage'
import ComingSoonPage from './pages/ComingSoonPage'
import HowItWorksPage from './pages/main/HowItWorksPage'
import HowItWorksStudents from './pages/main/HowItWorksStudents'
import HowItWorksTutors from './pages/main/HowItWorksTutors'
import HowItWorksCip from './pages/main/HowItWorksCip'
import FAQPage from './pages/main/FAQPage'
import ClientTermsPage from './pages/main/ClientTermsPage'
import TutorTermsPage from './pages/main/TutorTermsPage'
import PrivacyPolicyPage from './pages/main/PrivacyPolicyPage'
import InboxPage from './pages/chat/InboxPage.jsx'
import AdminPage from './pages/admin/AdminPage.jsx'
import AdminFlaggedMessagesPage from './pages/admin/AdminFlaggedMessagesPage'

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
  const [pendingSessionCount, setPendingSessionCount] = useState(0)
  const [unreviewedCount, setUnreviewedCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const howItWorksRef = useRef(null)

  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const supportRef = useRef(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [unreadMessages, setUnreadMessages] = useState(0)

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

  // Close Support dropdown when clicking outside
  useEffect(() => {
    if (!isSupportOpen) return

    const handleClickOutside = (e) => {
      if (supportRef.current && !supportRef.current.contains(e.target)) {
        setIsSupportOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSupportOpen])

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

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'TUTOR') {
      setPendingSessionCount(0)
      return
    }

    const loadPendingSessionCount = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/session-requests/tutor/${currentUser.userId}/pending`
        )
        if (!res.ok) {
          setPendingSessionCount(0)
          return
        }
        const data = await res.json()
        setPendingSessionCount(Array.isArray(data) ? data.length : 0)
      } catch (err) {
        console.error(err)
        setPendingSessionCount(0)
      }
    }

    loadPendingSessionCount()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      setUnreviewedCount(0)
      return
    }

    const loadUnreviewedCount = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/admin/flagged-messages/count?adminUserId=${currentUser.userId}`
        )
        if (!res.ok) {
          setUnreviewedCount(0)
          return
        }
        const data = await res.json()
        setUnreviewedCount(data.unreviewed || 0)
      } catch (err) {
        console.error(err)
        setUnreviewedCount(0)
      }
    }

    loadUnreviewedCount()
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
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <Link to="/" className="header-left header-left-link">
          <img
            src={logo}
            alt="Growth Tutoring Logo"
            className="logo-image"
          />
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
          <div className="nav-dropdown" ref={supportRef}>
            <button
              type="button"
              className="nav-link nav-dropdown-trigger"
              onClick={() => setIsSupportOpen(!isSupportOpen)}
            >
              Support
              <span className={`nav-dropdown-caret ${isSupportOpen ? 'open' : ''}`}>
                ▾
              </span>
            </button>
            
            {isSupportOpen && (
              <div className="nav-dropdown-menu">
                <Link
                  to="/contact"
                  className="nav-dropdown-item"
                  onClick={() => setIsSupportOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  to="/faq"
                  className="nav-dropdown-item"
                  onClick={() => setIsSupportOpen(false)}
                >
                  FAQ
                </Link>
                <Link
                  to="/terms/clients"
                  className="nav-dropdown-item"
                  onClick={() => setIsSupportOpen(false)}
                >
                  Terms of Service (Clients)
                </Link>
                <Link
                  to="/terms/tutors"
                  className="nav-dropdown-item"
                  onClick={() => setIsSupportOpen(false)}
                >
                  Terms of Service (Tutors)
                </Link>
                <Link
                  to="/privacy-policy"
                  className="nav-dropdown-item"
                  onClick={() => setIsSupportOpen(false)}
                >
                  Privacy Policy
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="header-right">
          {/*
          <Link to="/coming-soon" className="btn btn-primary">
            Get Matched Today
          </Link>
          */}

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
                      <>
                        <button
                          type="button"
                          className="user-menu-link"
                          onClick={() => goTo('/admin')}
                        >
                          Admin Dashboard
                        </button>
                        <button
                          type="button"
                          className="user-menu-link"
                          onClick={() => goTo('/admin/flagged-messages')}
                        >
                          Flagged Messages
                          {unreviewedCount > 0 && (
                            <span className="notif-badge">{unreviewedCount}</span>
                          )}
                        </button>
                      </>
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
                          <span className="user-link-badge">
                            My schedule
                            {pendingSessionCount > 0 && (
                              <span className="notif-badge">
                                {pendingSessionCount > 9 ? '9+' : pendingSessionCount}
                              </span>
                            )}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="user-menu-link"
                          onClick={() => goTo('/my-earnings')}
                        >
                          My earnings
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
                        onClick={() => goTo('/my-reviews')}
                      >
                        My reviews
                      </button>
                    )}
                    {currentUser.role === 'STUDENT' && (
                      <button
                        type="button"
                        className="user-menu-link"
                        onClick={() => goTo('/my-payments')}
                      >
                        My payments
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

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <nav 
            className="mobile-menu" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>

            {/* Menu Header */}
            <div className="mobile-menu-header">
              <img src={logo} alt="Growth Tutoring" className="mobile-menu-logo" />
              <span className="mobile-menu-brand">Growth Tutoring</span>
            </div>

            {/* Navigation Links */}
            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Navigation</div>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/tutors" onClick={() => setIsMobileMenuOpen(false)}>
                Our Tutors
              </Link>
              <Link to="/subjects" onClick={() => setIsMobileMenuOpen(false)}>
                Subjects
              </Link>
            </div>

            {/* How It Works */}
            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">How It Works</div>
              <Link to="/how-it-works/students" onClick={() => setIsMobileMenuOpen(false)}>
                For Students & Parents
              </Link>
              <Link to="/how-it-works/tutors" onClick={() => setIsMobileMenuOpen(false)}>
                For Tutors
              </Link>
              <Link to="/how-it-works/cip" onClick={() => setIsMobileMenuOpen(false)}>
                For CIP
              </Link>
            </div>

            {/* Support */}
            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Support</div>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                Contact Us
              </Link>
              <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>
                FAQ
              </Link>
            </div>

            {/* User Menu (if logged in) */}
            {currentUser && (
              <div className="mobile-menu-section">
                <div className="mobile-menu-section-title">My Account</div>
                <Link to="/my-profile" onClick={() => setIsMobileMenuOpen(false)}>
                  My Profile
                </Link>
                <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)}>
                  Messages {unreadMessages > 0 && `(${unreadMessages})`}
                </Link>
                {currentUser.role === 'TUTOR' && (
                  <>
                    <Link to="/my-students" onClick={() => setIsMobileMenuOpen(false)}>
                      My Students
                    </Link>
                    <Link to="/earnings" onClick={() => setIsMobileMenuOpen(false)}>
                      Earnings
                    </Link>
                  </>
                )}
                {currentUser.role === 'STUDENT' && (
                  <Link to="/my-tutors" onClick={() => setIsMobileMenuOpen(false)}>
                    My Tutors
                  </Link>
                )}
                <button onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}>
                  Sign Out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

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
          <Route path="/my-sessions/:category" element={<StudentSessionsDetailPage />} />

          <Route path="/tutor/sessions" element={<TutorSessionsPage currentUser={currentUser} />} />
          <Route 
            path="/schedule/sessions/:category" 
            element={<TutorSessionsDetailPage currentUser={currentUser} />} 
          />

          <Route 
            path="/my-earnings" 
            element={<MyEarningsPage currentUser={currentUser} />} 
          />

          <Route
            path="/my-reviews"
            element={<MyReviewsPage currentUser={currentUser} />}
          />

          <Route path="/my-payments" element={<MyPaymentsPage />} />

          <Route path="/how-it-works/students" element={<HowItWorksStudents />} />
          <Route path="/how-it-works/tutors" element={<HowItWorksTutors />} />
          <Route path="/how-it-works/cip" element={<HowItWorksCip />} />

          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms/clients" element={<ClientTermsPage />} />
          <Route path="/terms/tutors" element={<TutorTermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          <Route path="/contact" element={<ContactPage />} />

          <Route 
            path="/messages" 
            element={<InboxPage currentUser={currentUser} refreshUnreadCount={refreshUnreadCount} />} 
          />
          <Route 
            path="/messages/:conversationId" 
            element={<InboxPage currentUser={currentUser} refreshUnreadCount={refreshUnreadCount} />} 
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
          <Route 
            path="/admin/flagged-messages" 
            element={
              currentUser && currentUser.role === 'ADMIN' ?
                <AdminFlaggedMessagesPage currentUser={currentUser} />
              : <Navigate to="/" replace />
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        {/* Social Media Section - First */}
        <div className="footer-social-section">
          <h3 className="footer-social-title">Follow Growth Tutoring</h3>
          <div className="footer-social">
            <a 
              href="https://www.instagram.com/growthtutoringhq/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://www.tiktok.com/@growth.tutoring.l" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
            <a 
              href="https://www.linkedin.com/company/growth-tutoring-llc/posts/?feedView=all" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a 
              href="https://www.youtube.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="footer-links">
          <div className="footer-column">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
          </div>

          <div className="footer-column">
            <h4>Resources</h4>
            <Link to="/how-it-works/students">How It Works</Link>
            <Link to="/subjects">Subjects</Link>
            <Link to="/tutors">Find Tutors</Link>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms/clients">Terms of Service (Clients)</Link>
            <Link to="/terms/tutors">Terms of Service (Tutors)</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; 2025 Growth Tutoring LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App