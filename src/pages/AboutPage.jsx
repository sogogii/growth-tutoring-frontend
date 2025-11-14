import { Link } from 'react-router-dom'
import './AboutPage.css'

function AboutPage() {
  return (
    <div className="about-page">
      {/* Top banner */}
      <section className="about-hero">
        <h1>About Us</h1>
      </section>

      {/* Main content */}
      <section className="about-section">
        <h2>Growth Tutoring</h2>
        <p className="about-paragraph">
          Nowadays, education is more important than ever. But there has always been a lack of
          quality and personalized service regarding after–school student support. Growth Tutoring
          is committed to providing that service to all students through our platform by selecting
          the best tutors and using technology to track and improve student learning outcomes.
        </p>

        <h3>Core Values</h3>
        <p className="about-paragraph">
          <strong>Quality Service, Accountability, Integrity, Respect</strong>
        </p>

        <h3>About the Founder</h3>
        <p className="about-paragraph">
          Hello, my name is Jerry Zhang, and I am the founder of Growth Tutoring LLC. I immigrated
          to the U.S. when I was 10, coming from China, where there is an established tutoring
          system. However, I noticed a lack of programs for students with special needs or from
          low–income families. This gap exists both in the U.S. and China, and even the programs
          that are available often lack personalized support tailored to each student&apos;s
          learning style.
        </p>
        <p className="about-paragraph">
          I am currently a first–generation, fourth–year student at the University of California,
          Irvine, majoring in Informatics. I also transferred from a community college, so I
          understand the challenges students face in pursuing higher education. Over the years,
          I have built the leadership and technical skills needed to create a platform that truly
          helps students succeed.
        </p>
        <p className="about-paragraph">
          My experience includes over 1,340 hours of community service mentoring youth and
          coordinating volunteers with the Orange County Sheriff&apos;s Department, where I helped
          organize community programs, competitions, and events. Back at Portola High School,
          I was part of the Bulldog Crew, pairing up with special–needs students to organize
          campus activities. These experiences showed me firsthand the challenges students face,
          both academically and personally, and inspired me to create a platform where every
          student can receive the high–quality, personalized support they deserve.
        </p>
        <p className="about-paragraph">
          My life has always revolved around making a positive impact, and I deeply value equal
          educational opportunities for all. At Growth Tutoring, my goal is simple: make learning
          personal, efficient, and effective, with the utmost integrity and accountability, using
          modern technology to provide quality service for every student.
        </p>
      </section>

      {/* Special Needs Program */}
      <section className="about-section">
        <h3>Special Needs Program</h3>
        <p className="about-paragraph">
          The Special Needs Program provides qualified and highly trained tutors to provide
          personalized tutoring where:
        </p>
        <ul className="about-list">
          <li>
            Tutors provide evidence–based techniques designed to help students with learning
            differences.
          </li>
          <li>
            Lessons help students build confidence and resilience through strategies that address
            anxiety and increase motivation.
          </li>
          <li>
            Sessions are adapted to the student&apos;s pace and strengths, providing individualized
            attention that supports both academic progress and personal growth.
          </li>
        </ul>

        <Link to="/coming-soon" className="about-cta-button">
          Find Tutor
        </Link>
      </section>

      {/* Community Impact Program */}
      <section className="about-section">
        <h3>Community Impact Program (CIP)</h3>
        <p className="about-paragraph">
          The Community Impact Program helps students from low–income and rural areas of the U.S.
          and beyond. The program provides access to high–quality tutors, cutting–edge technologies,
          and educational resources designed to bridge learning gaps and create opportunities for
          academic success.
        </p>
        <p className="about-paragraph about-note">
          Please note that this program will only be available while funding lasts, and it is only
          available through online learning.
        </p>

        <Link to="/coming-soon" className="about-cta-button">
          See Openings
        </Link>
      </section>
    </div>
  )
}

export default AboutPage