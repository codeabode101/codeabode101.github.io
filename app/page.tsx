export default function HomePage() {
  return (
    <>
      <section id="home" className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Not just another Code Ninjas.</h1>
            <p className="hero-subtitle">
              Your kid learns essential logic and problem solving by building <b>exactly what they want</b>. Never
              bored again.
            </p>

            <div className="cta-container">
              <a href="/signup" className="cta-button primary">
                Book a Demo
              </a>
              <a href="#curriculum" className="cta-button secondary">
                View Curriculum
              </a>
            </div>
          </div>
        </div>

        <div className="social-proof-bottom">
          <div className="proof-container">
            <div className="proof-item">
              <div className="proof-number">1:2.5</div>
              <div className="proof-text">Teacher Student Ratio</div>
            </div>
            <div className="proof-item">
              <div className="proof-number">100+</div>
              <div className="proof-text">Kids Taught</div>
            </div>
            <div className="proof-item">
              <div className="proof-number">7+</div>
              <div className="proof-text">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="section alt full-screen mission-section">
        <div className="mission-image-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/varpanteach.png" alt="Kids learning programming" className="mission-image" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/omteach.png" alt="Kids building tech" className="mission-image" />
        </div>

        <div className="mission-highlight">
          <p>
            You want your kid to follow their interests so they can give their 100%, but traditional schools teach
            them to be bored and pass tests.
          </p>
          <br />

          <p>
            We&apos;ll keep them focused by building the curriculum around them, whether they want to make their own
            Fortnite or build a robot. We&apos;ll teach them the essential skills they need and match their pace, too.
          </p>
        </div>

        <div className="mission-content">
          <div className="mission-columns">
            <div className="column">
              <h3>Passion is the curriculum.</h3>
              <ul>
                <li>Scratch and Logical Skills</li>
                <li>An Arduino Robot</li>
                <li>Python programming</li>
                <li>Web Development and Design</li>
                <li>iOS and Android App Development</li>
                <li>AI and Machine Learning</li>
                <li>Harvard CS50/PCEP Certification</li>
                <li>Math skills ranging from Addition - Calculus II</li>
              </ul>
              Your kid will learn essential skills <b>regardless</b> and build real world applications.
            </div>
          </div>

          <div className="before-after">
            <div className="before">
              <h4>Before:</h4>
              <p>Bored student taught to memorize syntax, lacking creative thinking skills.</p>
            </div>
            <div className="after">
              <h4>After:</h4>
              <p>Smart, confident young developer who makes their parents proud!</p>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="section reviews-section">
        <div className="review-container">
          <div className="review-card">
            <blockquote className="review-text">
              &quot;I was afraid that Seyon didn&apos;t have the logic and problem solving to start coding. After joining
              Codeabode, he learned to break apart problems into smaller ones and Google when he gets stuck, allowing
              him to learn on his own, too!&quot;
            </blockquote>
            <p className="reviewer-name">— Seyon&apos;s Dad</p>
          </div>
        </div>
      </section>

      <section id="curriculum" className="section curriculum-section">
        <h2>How we teach</h2>
        <p className="lead-text">Our curriculum is made as we learn about your kid. Here are examples we typically base our curriculum on:</p>

        <p>
          <a className="btn curriculum-btn" href="/SampleCurriculum.pdf" target="_blank" rel="noreferrer">
            Sample Arduino Curriculum
          </a>
          <a className="btn curriculum-btn" href="/Syllabus.pdf" target="_blank" rel="noreferrer">
            Sample Python Syllabus
          </a>
        </p>

        <div className="library-classes">
          <h3>Free Trenton Library Classes</h3>
          <p>Underpriviledged areas deserve to have high quality education too.</p>
          <p>Starting September, classes will be held in the Computer Tech Room, every Saturday at 4:00 pm.</p>
          <p>Visit us at 1115 Greenwood Ave, Trenton, NJ 08609</p>
        </div>
      </section>

      <section id="pricing" className="section pricing-section">
        <div className="pricing-box">
          <h2>Classes</h2>
          <p>
            1-on-1 classes are <strong>$33.25 per class.</strong>
          </p>
          <p>
            Class of 1-4 are <strong>$27.5 per class.</strong>
          </p>
          <br />
          <p>All classes have flexible hours and ensure your child is always focused.</p>
          <p>
            Try a free demo class to figure out what <strong>interests you!</strong>
          </p>

          <p>
            <a href="/signup" className="btn signup-btn">
              Book Your Free Demo
            </a>
          </p>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <h2>General Quesions?</h2>
        <form id="contact-form" action="https://formspree.io/f/xeogbndr" method="POST">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" placeholder="Your full name" required />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="_replyto" placeholder="you@example.com" required />

          <label htmlFor="phone">Phone Number</label>
          <input type="text" id="phone" name="phone" placeholder="(123) 456-7890" required />

          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={6} placeholder="Write your message here..." required></textarea>

          <button type="submit">Submit</button>
        </form>
      </section>

      <section id="team" className="section team-section">
        <h2>Meet the Team</h2>
        <div className="team-container">
          <div className="team-member">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/varteam.png" alt="Founder 1" className="team-photo" />
            <a href="https://www.linkedin.com/in/varun-pannala-050a6627a/" target="_blank" rel="noreferrer">
              Varun Pannala
            </a>
          </div>
          <div className="team-member">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/omteam.png" alt="Founder 2" className="team-photo" />
            <a href="https://www.linkedin.com/in/om-raheja-91a26b314/" target="_blank" rel="noreferrer">
              Om Raheja
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-container">
          <h1>Contact Us</h1>

          <div className="social">
            <a href="tel:609-480-9208" target="_blank" rel="noreferrer">
              <i className="fa-solid fa-phone"></i>
            </a>

            <a
              href="https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcRzDfnVXZPqsrkSXStvKgWQjdGwgQMjpzLFZMFWMdqKQlvHnJXWCSjQzVHGqNWBpVxGMXFTm"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-solid fa-envelope"></i>
            </a>
          </div>

          <p>Phone Number: 609-480-9208</p>
          <p> © Copyright DigitalReach NJ - 2025</p>
        </div>
      </footer>
    </>
  );
}

