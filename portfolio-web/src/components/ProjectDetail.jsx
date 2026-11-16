import { kindFor } from './demos/kinds.js'

function ProjectDetail({ project, onClose }) {
  const { color, Demo, codeUrl } = kindFor(project)
  const link = codeUrl ?? project.link
  const bullets = project.bullets.split('|').map(b => b.trim()).filter(b => /[a-z]{3}/i.test(b))
  const hasLink = /^https?:\/\//.test(link)

  return (
    <article id="project-details" className="project-detail" style={{ '--c': color }}>
      {onClose && (
        <div className="project-detail-head">
          <button className="project-close" type="button" onClick={onClose} aria-label="Close project">Close ×</button>
        </div>
      )}

      <h3>{project.name.trim()}</h3>

      <div className={`project-detail-top${bullets.length === 0 ? ' single' : ''}`}>
        <div>
          <h4>About the project</h4>
          <p>{project.description}</p>
        </div>
        {bullets.length > 0 && (
          <div>
            <h4>Behind it</h4>
            <ul>
              {bullets.map(bullet => <li key={bullet}>{bullet}</li>)}
            </ul>
          </div>
        )}
      </div>

      {Demo && (
        <div className="project-demo">
          <details className="project-demo-info">
            <summary className="project-demo-toggle">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v6m0-10v.01" />
              </svg>
              Demo only
            </summary>
            <p className="project-demo-note">This is an interactive demo, not the actual product.</p>
          </details>
          <Demo />
        </div>
      )}

      <div className="project-detail-foot">
        {hasLink && (
          <a className="project-link" href={link} target="_blank" rel="noreferrer">See the code</a>
        )}
      </div>
    </article>
  )
}

export default ProjectDetail
