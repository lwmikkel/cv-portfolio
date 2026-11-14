import { useEffect, useState } from 'react'
import './Header.css'

const links = [
  { id: 'about', label: 'About', short: 'About' },
  { id: 'projects', label: 'Projects', short: 'Projects' },
  { id: 'experience', label: 'Experience & Education', short: 'Experience' },
]

function Header() {
  const [active, setActive] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const sections = links.map(link => document.getElementById(link.id)).filter(Boolean)
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(section => observer.observe(section))

    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      if (window.scrollY < 200) setActive(null)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  function toTop(event) {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="header">
      <a className="header-brand" href="#" onClick={toTop} aria-label="Back to top">
        <span className="header-mark">MW</span>
        <span className="header-name">
          <strong>Mikkel Wilquin</strong>
          <span>Software student</span>
        </span>
      </a>

      <nav className="header-nav" aria-label="Sections">
        {links.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={active === link.id ? 'active' : undefined}
            aria-current={active === link.id ? 'true' : undefined}
          >
            <span className="nav-long">{link.label}</span>
            <span className="nav-short">{link.short}</span>
          </a>
        ))}
      </nav>

      <div className="header-right">
        <span className="header-status">Open to student roles</span>
        <div className="header-social">
          <a href="https://github.com/lwmikkel" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg></a>
          <a href="https://www.linkedin.com/in/mikkel-wilquin-742a66248/" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 128 128" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M116 3H12a8.91 8.91 0 00-9 8.8v104.42a8.91 8.91 0 009 8.78h104a8.93 8.93 0 009-8.81V11.77A8.93 8.93 0 00116 3zM39.17 107H21.06V48.73h18.11zm-9-66.21a10.5 10.5 0 1110.49-10.5 10.5 10.5 0 01-10.54 10.48zM107 107H88.89V78.65c0-6.75-.12-15.44-9.41-15.44s-10.87 7.36-10.87 15V107H50.53V48.73h17.36v8h.24c2.42-4.58 8.32-9.41 17.13-9.41C103.6 47.28 107 59.35 107 75z" /></svg></a>
        </div>
      </div>
      <span className="header-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  )
}

export default Header
