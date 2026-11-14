import { useState } from 'react'
import './Projects.css'
import ProjectDetail from './ProjectDetail.jsx'
import { kindFor } from './demos/kinds.js'

function Projects({ projects }) {
  const [selectedId, setSelectedId] = useState(null)
  const current = projects.find(project => project.id === selectedId) ?? projects[0]

  return (
    <section id="projects" className="projects">
      <div className="projects-head">
        <h2>Projects</h2>
      </div>

      {current && (
        <div className="projects-layout">
          <div className="projects-list">
            {projects.map(project => (
              <button
                key={project.id}
                type="button"
                className={`project-pick${project.id === current.id ? ' active' : ''}`}
                style={{ '--c': kindFor(project).color }}
                aria-pressed={project.id === current.id}
                onClick={() => setSelectedId(project.id)}
              >
                <span className="label">{project.kicker}</span>
                <span className="project-pick-title">{project.name.trim()}</span>
                <span className="project-pick-tech">{project.tech.split(',').map(t => t.trim()).join(' · ')}</span>
              </button>
            ))}
          </div>

          <ProjectDetail key={current.id} project={current} />
        </div>
      )}
    </section>
  )
}

export default Projects
