import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch("http://localhost:5262/projects")
    .then(response => response.json())
    .then(data => setProjects(data))
  }, [])

  return(
    <ul>
      {projects.map(project => <li key={project.name}>{project.name} - {project.description}</li>)}
    </ul>
  )
}

export default App
