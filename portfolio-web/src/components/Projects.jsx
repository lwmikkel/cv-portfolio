import { useState, useSyncExternalStore } from 'react'
import './Projects.css'
import ProjectDetail from './ProjectDetail.jsx'
import { kindFor } from './demos/kinds.js'

const mobileQuery = '(max-width: 600px)'

function subscribeToViewport(onChange) {
  const query = window.matchMedia(mobileQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function isMobileViewport() {
  return window.matchMedia(mobileQuery).matches
}

function Projects({ projects }) {
  const [selectedId, setSelectedId] = useState(null)
  const isMobile = useSyncExternalStore(subscribeToViewport, isMobileViewport, () => false)
  const current = projects.find(project => project.id === selectedId) ?? (isMobile ? null : projects[0])

  return (
    <section id="projects" className="projects">
      <div className="projects-head">
        <h2>Projects</h2>
      </div>

      {projects.length > 0 && (
        <div className="projects-layout">
          <div className="projects-list">
            {projects.map(project => (
              <button
                key={project.id}
                type="button"
                className={`project-pick${project.id === current?.id ? ' active' : ''}`}
                style={{ '--c': kindFor(project).color }}
                aria-pressed={isMobile ? undefined : project.id === current?.id}
                aria-expanded={isMobile ? project.id === current?.id : undefined}
                aria-controls={isMobile && project.id === current?.id ? 'project-details' : undefined}
                onClick={() => setSelectedId(isMobile && selectedId === project.id ? null : project.id)}
              >
                <span className="label">{project.kicker}</span>
                <span className="project-pick-title">{project.name.trim()}</span>
                <span className="project-pick-tech">{project.tech.split(',').map(t => t.trim()).join(' · ')}</span>
                <span className="project-pick-toggle" aria-hidden="true">{project.id === current?.id ? '−' : '+'}</span>
              </button>
            ))}
          </div>

          {current && (
            <ProjectDetail key={current.id} project={current} onClose={isMobile ? () => setSelectedId(null) : undefined} />
          )}
        </div>
      )}
    </section>
  )
}

export default Projects
