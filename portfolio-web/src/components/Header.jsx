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

      <span className="header-status">Open to student roles</span>
      <span className="header-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  )
}

export default Header
