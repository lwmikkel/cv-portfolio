import { useState, useEffect } from 'react'
import './App.css'
import { GuideIntro } from './intro'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'

function App() {
  const [projects, setProjects] = useState([])
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/projects`)
    .then(response => response.json())
    .then(data => setProjects(data))
  }, [])

  return(
      <>
      <Header />
      <Hero />
      <About />
      <Projects projects={projects} />
      {!entered && <GuideIntro onEnter={() => setEntered(true)} />}
      </>
)}  

export default App
