import { Link } from 'react-router-dom'
import './styles/AboutPage.css'

function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-subtitle">
            Committed to quality education through personalized tutoring and innovative technology
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="about-container">
        
        {/* Mission Section */}
        <section className="about-section">
          <div className="about-section-header">
            <h2 className="about-section-title">Our Mission</h2>
            <div className="about-section-line"></div>
          </div>
          <p className="about-text">
            Nowadays, education is more important than ever. But there has always been a lack of
            quality and personalized service regarding after-school student support. Growth Tutoring
            is committed to providing that service to all students through our platform by selecting
            the best tutors and using technology to track and improve student learning outcomes.
          </p>
        </section>

        {/* Core Values Section */}
        <section className="about-section about-values-section">
          <div className="about-section-header">
            <h2 className="about-section-title">Core Values</h2>
            <div className="about-section-line"></div>
          </div>
          <div className="about-values-grid">
            <div className="about-value-card quality-card">
              <div className="about-value-icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 className="about-value-title">Quality Service</h3>
            </div>
            <div className="about-value-card accountability-card">
              <div className="about-value-icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="about-value-title">Accountability</h3>
            </div>
            <div className="about-value-card integrity-card">
              <div className="about-value-icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
              </div>
              <h3 className="about-value-title">Integrity</h3>
            </div>
            <div className="about-value-card respect-card">
              <div className="about-value-icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="about-value-title">Respect</h3>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="about-section about-founder-section">
          <div className="about-section-header">
            <h2 className="about-section-title">About the Founder</h2>
            <div className="about-section-line"></div>
          </div>
          
          <div className="about-founder-content">
            <p className="about-text">
              Hello, my name is Jerry Zhang, and I am the founder of Growth Tutoring LLC. I immigrated
              to the U.S. when I was 10, coming from China, where there is an established tutoring
              system. However, I noticed a lack of programs for students with special needs or from
              low-income families. This gap exists both in the U.S. and China, and even the programs
              that are available often lack personalized support tailored to each student's learning style.
            </p>
            <p className="about-text">
              I am currently a first-generation, fourth-year student at the University of California,
              Irvine, majoring in Informatics. I also transferred from a community college, so I
              understand the challenges students face in pursuing higher education. Over the years,
              I have built the leadership and technical skills needed to create a platform that truly
              helps students succeed.
            </p>
            <p className="about-text">
              My experience includes over 1,340 hours of community service mentoring youth and
              coordinating volunteers with the Orange County Sheriff's Department, where I helped
              organize community programs, competitions, and events. Back at Portola High School,
              I was part of the Bulldog Crew, pairing up with special-needs students to organize
              campus activities. These experiences showed me firsthand the challenges students face,
              both academically and personally, and inspired me to create a platform where every
              student can receive the high-quality, personalized support they deserve.
            </p>
            <p className="about-text">
              My life has always revolved around making a positive impact, and I deeply value equal
              educational opportunities for all. At Growth Tutoring, my goal is simple: make learning
              personal, efficient, and effective, with the utmost integrity and accountability, using
              modern technology to provide quality service for every student.
            </p>
          </div>
        </section>

        {/* Programs Section */}
        <section className="about-programs-section">
          <div className="about-section-header">
            <h2 className="about-section-title">Our Programs</h2>
            <div className="about-section-line"></div>
          </div>
          
          <div className="about-programs-grid">
            
            {/* Special Needs Program */}
            <div className="about-program-card">
              <div className="about-program-header">
                <h3 className="about-program-title">Special Needs Program</h3>
              </div>
              <p className="about-program-text">
                Qualified and highly trained tutors provide personalized tutoring with:
              </p>
              <ul className="about-program-list">
                <li>Evidence-based techniques for students with learning differences</li>
                <li>Confidence-building strategies that address anxiety and motivation</li>
                <li>Individualized sessions adapted to each student's pace and strengths</li>
              </ul>
              <Link to="/coming-soon" className="about-program-button">
                Find a Tutor
              </Link>
            </div>

            {/* Community Impact Program */}
            <div className="about-program-card">
              <div className="about-program-header">
                <h3 className="about-program-title">Community Impact Program</h3>
              </div>
              <p className="about-program-text">
                Supporting students from low-income and rural areas with access to high-quality tutors,
                cutting-edge technologies, and educational resources designed to bridge learning gaps.
              </p>
              <p className="about-program-note">
                Available while funding lasts • Online learning only
              </p>
              <Link to="/coming-soon" className="about-program-button">
                See Openings
              </Link>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}

export default AboutPage