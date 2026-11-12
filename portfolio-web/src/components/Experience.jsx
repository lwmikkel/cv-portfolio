import { useState } from "react"
import Modal from "./Modal.jsx"
import "./Experience.css"

const experiences = [
  {
    id: 1,
    period: 'June 2026 – Present',
    title: 'IT Supporter',
    org: 'Coop Service Desk',
    summary: 'Phone and remote support for Coop stores, working daily in ServiceNow.',
    description: 'I give phone and remote support to Coop stores from the Coop Service Desk, working daily in ServiceNow. I troubleshoot POS systems, networks and IT equipment, run scripts on the tills and fix software and operational faults.',
    points: [
      'Troubleshooting POS systems, networks and IT equipment',
      'Running scripts on the tills',
      'Fixing software and operational faults',
    ],
    skills: ['ServiceNow', 'Troubleshooting', 'POS systems', 'Networks', 'Remote support'],
  },
  {
    id: 2,
    period: 'March 2025 – September 2025',
    title: 'Baggage Handler',
    org: 'SAS, Copenhagen Airport',
    summary: 'Handled and sorted baggage and made sure aircraft were loaded and unloaded correctly.',
    description: 'I handled and sorted baggage at Copenhagen Airport and ensured correct loading and unloading of aircraft. Safety, precision and punctuality were essential for the flights to depart on time.',
    points: [
      'Handled and sorted baggage',
      'Ensured correct loading and unloading of aircraft',
      'Safety, precision and punctuality were essential for the flights to depart on time',
    ],
    skills: ['Safety', 'Precision', 'Punctuality'],
  },
  {
    id: 3,
    period: 'January 2024 – April 2024',
    title: 'Flagman',
    org: 'Storch, Novo Nordisk Bagsværd',
    summary: 'Flagman on a Novo Nordisk construction site, making sure workers were not underneath the crane during lifts.',
    description: "I worked as a flagman on a Novo Nordisk construction site and made sure workers were not underneath the crane during lifts. My colleagues' safety was my direct responsibility, and when the foremen were absent I took over the foreman role, coordinating colleagues and communicating with crane operators.",
    points: [
      "Direct responsibility for my colleagues' safety",
      'Took over the foreman role when the foremen were absent',
      'Coordinated colleagues and communicated with crane operators',
    ],
    skills: ['Safety', 'Responsibility', 'Coordination', 'Communication'],
  },
]

function Experience() {
  const [selected, setSelected] = useState(null)

  return (
    <section id="experience" className="experience">
      <div className="experience-head">
        <h2>Experience</h2>
      </div>
      <div className="experience-grid">
        {experiences.map(job => (
          <div className="tile experience-card" key={job.id}>
            <div className="label">{job.period}</div>
            <div className="experience-title">{job.title}</div>
            <div className="experience-org">{job.org}</div>
            <p>{job.summary}</p>
            <button onClick={() => setSelected(job)}>Read more →</button>
          </div>
        ))}
      </div>
      {selected && (
        <Modal label={selected.title} onClose={() => setSelected(null)}>
          <div className="modal-main">
            <div className="label">{selected.period}</div>
            <h3>{selected.title}</h3>
            <p className="modal-org">{selected.org}</p>
            <p>{selected.description}</p>
          </div>

          <div className="modal-side">
            <div className="modal-section">
              <div className="label">What I did</div>
              <ul>
                {selected.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="modal-section">
              <div className="label">Skills</div>
              <div className="modal-chips">
                {selected.skills.map(skill => (
                  <span className="chip" key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default Experience
