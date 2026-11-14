import { useState } from "react"
import Modal from "./Modal.jsx"
import "./Timeline.css"

const logoFiles = import.meta.glob('../assets/logos/*.{png,webp,svg,jpg}', { eager: true, import: 'default' })

const logos = {}
for (const path in logoFiles) {
  const name = path.split('/').pop().replace(/\.[^.]+$/, '')
  logos[name] = logoFiles[path]
}

const types = {
  work: { label: 'Work', color: '#0F766E' },
  education: { label: 'Education', color: '#7C3AED' },
  course: { label: 'Course', color: '#B45309' },
}

const timeline = [
  {
    id: 1,
    type: 'work',
    period: 'June 2026 – Present',
    title: 'IT Supporter',
    org: 'Coop, Headquarters',
    logo: 'coop',
    logoText: 'Coop',
    summary: 'Phone and remote support for Coop stores, working daily in ServiceNow.',
    description: 'I give phone and remote support to Coop stores from the Coop Service Desk, working daily in ServiceNow. I troubleshoot POS systems, networks and IT equipment, run scripts on the tills and fix software and operational faults.',
    pointsLabel: 'What I did',
    points: [
      'Troubleshooting POS systems, networks and IT equipment',
      'Running scripts on the tills',
      'Fixing software and operational faults',
    ],
    skills: ['ServiceNow', 'Troubleshooting', 'POS systems', 'Networks', 'Remote support'],
  },
  {
    id: 2,
    type: 'education',
    period: '2025 – 2028 · 3rd semester',
    title: 'Bachelor in Software',
    org: 'Aalborg University',
    logo: 'aau',
    logoText: 'AAU',
    summary: 'Software bachelor at AAU Copenhagen, now in my 3rd semester.',
    description: 'I study Software at Aalborg University Copenhagen. The first semesters have taken me from low-level C through web development with Node.js to system design, object-oriented Java and relational databases.',
    pointsLabel: 'What I learned',
    points: [
      '1st semester: C, with variables, functions, control structures, data structures and memory management',
      '2nd semester: HTML, CSS, JavaScript, Node.js, design and user experience',
      '3rd semester: System design (architecture and methods), Java (OOP) and SQL (PostgreSQL)',
    ],
    skills: ['C', 'Java', 'JavaScript', 'Node.js', 'SQL', 'PostgreSQL', 'System design'],
  },
  {
    id: 3,
    type: 'work',
    period: 'March 2025 – September 2025',
    title: 'Baggage Handler',
    org: 'SAS, Copenhagen Airport',
    logo: 'sas',
    logoText: 'SAS',
    summary: 'Handled and sorted baggage and made sure aircraft were loaded and unloaded correctly.',
    description: 'I handled and sorted baggage at Copenhagen Airport and ensured correct loading and unloading of aircraft. Safety, precision and punctuality were essential for the flights to depart on time.',
    pointsLabel: 'What I did',
    points: [
      'Handled and sorted baggage',
      'Ensured correct loading and unloading of aircraft',
      'Safety, precision and punctuality were essential for the flights to depart on time',
    ],
    skills: ['Safety', 'Precision', 'Punctuality'],
  },
  {
    id: 4,
    type: 'course',
    period: 'November 2024 – January 2025',
    title: 'Security Guard Course',
    org: 'UCplus',
    logo: 'ucplus',
    logoText: 'UC',
    summary: 'Course in security procedures, conflict management and correct reporting.',
    description: 'I completed a security guard course at UCplus focusing on security procedures, conflict management, observation techniques, communication, access control and correct reporting.',
    pointsLabel: 'What I learned',
    points: [
      'Security procedures',
      'Conflict management',
      'Observation techniques',
      'Communication',
      'Access control and correct reporting',
    ],
    skills: ['Conflict management', 'Observation', 'Communication', 'Access control', 'Reporting'],
  },
  {
    id: 5,
    type: 'work',
    period: 'January 2024 – April 2024',
    title: 'Flagman',
    org: 'Storch, Novo Nordisk Bagsværd',
    logo: 'storch',
    logoText: 'Storch',
    summary: 'Flagman on a Novo Nordisk construction site, making sure workers were not underneath the crane during lifts.',
    description: "I worked as a flagman on a Novo Nordisk construction site and made sure workers were not underneath the crane during lifts. My colleagues' safety was my direct responsibility, and when the foremen were absent I took over the foreman role, coordinating colleagues and communicating with crane operators.",
    pointsLabel: 'What I did',
    points: [
      "Direct responsibility for my colleagues' safety",
      'Took over the foreman role when the foremen were absent',
      'Coordinated colleagues and communicated with crane operators',
    ],
    skills: ['Safety', 'Responsibility', 'Coordination', 'Communication'],
  },
  {
    id: 6,
    type: 'education',
    period: '2020 – 2023',
    title: 'Upper Secondary School',
    org: 'Nørre Gymnasium (STX)',
    logo: 'noerre-gymnasium',
    logoText: 'NG',
    summary: 'STX with Physics A and Mathematics A.',
    description: 'I completed the STX programme at Nørre Gymnasium with Physics A and Mathematics A, which is the background I bring into my software studies.',
    pointsLabel: 'What I learned',
    points: [
      'Physics A',
      'Mathematics A',
    ],
    skills: ['Physics', 'Mathematics'],
  },
]

function Logo({ item }) {
  const src = logos[item.logo]

  if (src) {
    return <img className="timeline-logo" src={src} alt={`${item.org} logo`} />
  }

  return <span className="timeline-logo-fallback">{item.logoText}</span>
}

function Timeline() {
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('work')

  const visible = timeline.filter(item => item.type === tab)

  return (
    <section id="experience" className="timeline-section">
      <div className="timeline-head">
        <h2>Experience & Education</h2>
      </div>

      <div className="timeline-tabs" role="tablist">
        {Object.entries(types).map(([key, type]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? 'active' : ''}
            style={{ '--c': type.color }}
            onClick={() => setTab(key)}
          >
            <span className={`timeline-shape tl-${key}`} />
            {type.label}
            <span className="timeline-count">{timeline.filter(item => item.type === key).length}</span>
          </button>
        ))}
      </div>

      <ol className="timeline" style={{ '--c': types[tab].color }}>
        {visible.map(item => (
          <li className="timeline-item" key={item.id}>
            <span className="timeline-dot">
              <span className={`timeline-shape tl-${item.type}`} />
            </span>
            <div className="tile timeline-card">
              <div className="timeline-meta">
                <span className="timeline-badge">{types[item.type].label}</span>
                <span className="label">{item.period}</span>
                <Logo item={item} />
              </div>
              <div className="timeline-title">{item.title}</div>
              <div className="timeline-org">{item.org}</div>
              <p>{item.summary}</p>
              <div className="timeline-chips">
                {item.skills.slice(0, 4).map(skill => (
                  <span className="chip" key={skill}>{skill}</span>
                ))}
              </div>
              <button onClick={() => setSelected(item)}>Read more →</button>
            </div>
          </li>
        ))}
      </ol>

      {selected && (
        <Modal label={selected.title} onClose={() => setSelected(null)}>
          <div className="modal-main" style={{ '--c': types[selected.type].color }}>
            <div className="label">{selected.period}</div>
            <h3>{selected.title}</h3>
            <p className="modal-org">{selected.org}</p>
            <p>{selected.description}</p>
          </div>

          <div className="modal-side" style={{ '--c': types[selected.type].color }}>
            <div className="modal-section">
              <div className="label">{selected.pointsLabel}</div>
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

export default Timeline
