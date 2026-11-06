import "./Header.css"

function Header() {
  return (
    <header className = "header">
      <p>MW</p>
      <nav className = "header-nav">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#experience">Experience</a>
      <a href="#education">Education</a>
      <a href="#contact">Contact</a>
      </nav>
      <a href="https://github.com/lwmikkel">Visit Github</a>
    </header>
  )
}

export default Header