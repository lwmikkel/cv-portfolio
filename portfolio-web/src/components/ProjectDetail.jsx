import { kindFor } from './demos/kinds.js'

function ProjectDetail({ project }) {
  const { color, Demo } = kindFor(project)
  const bullets = project.bullets.split('|').map(b => b.trim()).filter(b => /[a-z]{3}/i.test(b))
  const tech = project.tech.split(',').map(t => t.trim())
  const hasLink = /^https?:\/\//.test(project.link)

  return (
    <article className="project-detail" style={{ '--c': color }}>
      <div className="project-detail-head">
        <span className="label">{project.kicker}</span>
        {Demo && <span className="project-live">Live demo</span>}
      </div>

      <h3>{project.name.trim()}</h3>

      <div className={`project-detail-top${bullets.length === 0 ? ' single' : ''}`}>
        <p>{project.description}</p>
        {bullets.length > 0 && (
          <ul>
            {bullets.map(bullet => <li key={bullet}>{bullet}</li>)}
          </ul>
        )}
      </div>

      {Demo && <Demo />}

      <div className="project-detail-foot">
        <div className="project-chips">
          {tech.map(t => <span className="chip" key={t}>{t}</span>)}
        </div>
        {hasLink && (
          <a className="project-link" href={project.link} target="_blank" rel="noreferrer">View on GitHub</a>
        )}
      </div>
    </article>
  )
}

export default ProjectDetail
