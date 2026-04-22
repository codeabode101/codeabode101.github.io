'use client';

import { FaLinkedin, FaGlobe } from 'react-icons/fa';

const TEAM = [
  {
    name: 'Om Raheja',
    image: '/omteam.png',
    credentials: 'UIUC, UWashington, Cornell Admit',
    codingYears: '7+ years',
    teachingYears: '5+ years',
    linkedin: 'https://www.linkedin.com/in/om-raheja-91a26b314/',
    website: 'https://omraheja.me',
  },
  {
    name: 'Varun Pannala',
    image: '/varteam.png',
    credentials: 'UMD, UIUC, UMichigan Admit',
    codingYears: '7+ years',
    teachingYears: '5+ years',
    linkedin: 'https://www.linkedin.com/in/varun-pannala-050a6627a/',
    website: 'https://www.linkedin.com/in/varun-pannala-050a6627a/',
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>About Us</h1>
        <p>Meet the instructors behind CodeAbode</p>
      </section>

      <section className="about-section">
        <div className="team-grid">
          {TEAM.map((member) => (
            <div key={member.name} className="team-card">
              <img
                src={member.image}
                alt={member.name}
                className="team-photo"
              />
              <h2 className="team-name">{member.name}</h2>
              <p className="team-credentials">{member.credentials}</p>
              <p className="team-experience">
                Been coding for {member.codingYears} and teaching for {member.teachingYears}
              </p>
              <div className="team-links">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  aria-label={`${member.name}'s LinkedIn`}
                >
                  <FaLinkedin />
                </a>
                <a
                  href={member.website}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  aria-label={`${member.name}'s website`}
                >
                  <FaGlobe />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}