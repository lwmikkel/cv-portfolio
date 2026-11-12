import "./Projects.css"
import { useState } from "react"
import Modal from "./Modal.jsx"

function Projects({ projects }) {
  const [selected, setSelected] = useState(null)

  return (
    <section id="projects" className="projects">
      <div className="projects-head">
        <h2>Projects</h2>
      </div>
      <div className="projects-grid">
        {projects.map(project => (
          <div className="tile project-card" key={project.id}>
            <div className="label">{project.kicker}</div>
            <div className="project-title">{project.name}</div>
            <p>{project.description}</p>
            <div className="project-tech">
              {project.tech.split(',').map(t => (
                <span className="chip" key={t}>{t.trim()}</span>
              ))}
            </div>
            <button onClick={() => setSelected(project)}>Read more →</button>
          </div>
        ))}
      </div>
      {selected && (
        <Modal label={selected.name} onClose={() => setSelected(null)}>
          <div className="modal-main">
            <div className="label">{selected.kicker}</div>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <a className="modal-link" href={selected.link} target="_blank" rel="noreferrer">View on GitHub</a>
          </div>

          <div className="modal-side">
            <div className="modal-section">
              <div className="label">What I built</div>
              <ul>
                {selected.bullets.split('|').map(b => (
                  <li key={b}>{b.trim()}</li>
                ))}
              </ul>
            </div>
            <div className="modal-section">
              <div className="label">Built with</div>
              <div className="modal-chips">
                {selected.tech.split(',').map(t => (
                  <span className="chip" key={t}>{t.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default Projects
