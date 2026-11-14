import './About.css'

function About(){
    return(
        <section id="about" className="about">
        <div className="tile about-me">
            <div className="label">About me</div>
            <p className="about-text">I am Mikkel, 22 years old, and I live in Rødovre. I am in my third semester of software at Aalborg University in Copenhagen.</p>
            <p className="about-text">I spend most of my free time on my own projects. I am especially interested in how AI can take over tasks that people do by hand today.</p>
            <p className="about-text">Alongside my studies I work at the Coop service desk. Store staff call when something has stopped working and they are in a hurry, so I have learned to stay calm and explain the solution in plain language.</p>
        </div>
        </section>
    )
}
export default About
