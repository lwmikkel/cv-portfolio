import './About.css'

function About(){
    return(
        <section id="about" className="about">
        <div className="tile about-me">
            <div className="label">About me</div>
            <p className="about-lead">I learn best by building something that runs.</p>
            <p className="about-text">Most of what I know comes from projects: an event platform, a model that estimates win probability in League of Legends and an AI reader for invoices. I like AI a lot and would be glad to work with it, in development or as a consultant. This site is the next project: a C# API on Azure with a React front end.</p>
            <p className="about-text">At the Coop service desk I help store staff who are in a hurry, which taught me to stay calm and explain technical problems in plain language.</p>
        </div>
        </section>
    )
}
export default About
