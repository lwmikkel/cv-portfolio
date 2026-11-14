import './TechBand.css'
import c from '../assets/tech/c.png'
import java from '../assets/tech/java.png'
import javascript from '../assets/tech/javascript.png'
import python from '../assets/tech/python.png'
import postgresql from '../assets/tech/postgresql.png'
import html5 from '../assets/tech/html5.png'
import css3 from '../assets/tech/css3.png'
import nodejs from '../assets/tech/nodejs.png'
import mongodb from '../assets/tech/mongodb.png'
import csharp from '../assets/tech/csharp.png'
import react from '../assets/tech/react.png'

const technologies = [
  { name: 'C', image: c },
  { name: 'Java', image: java },
  { name: 'JavaScript', image: javascript },
  { name: 'Python', image: python },
  { name: 'SQL · PostgreSQL', image: postgresql },
  { name: 'HTML', image: html5 },
  { name: 'CSS', image: css3 },
  { name: 'Node.js', image: nodejs },
  { name: 'MongoDB', image: mongodb },
  { name: 'C#', image: csharp },
  { name: 'React', image: react },
]

const COPIES = 4

function TechBand() {
  return (
    <section className="tech-band" aria-label="Languages and tools I have worked with">
      <p className="label tech-band-label">Languages and tools</p>
      <div className="tech-window">
        <ul className="tech-track">
          {Array.from({ length: COPIES }, (_, copy) =>
            technologies.map(tech => (
              <li
                key={`${copy}-${tech.name}`}
                className={`tech-item${copy > 0 ? ' tech-dupe' : ''}`}
                aria-hidden={copy > 0 ? 'true' : undefined}
              >
                <img src={tech.image} alt="" width="32" height="32" />
                <span>{tech.name}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  )
}

export default TechBand
