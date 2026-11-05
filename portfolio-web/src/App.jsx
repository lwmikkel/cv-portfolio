import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch("https://lwm-portfolio-api-c5dvg2awbrd7hcfd.norwayeast-01.azurewebsites.net/projects")
    .then(response => response.json())
    .then(data => setProjects(data))
  }, [])

  return(
      <div> 
      {projects.map(project => 
      <div className='projects' key={project.name}>
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      <a href = {project.link}>Read more</a>
      </div>
      )}
      </div>
    
)}  

export default App
