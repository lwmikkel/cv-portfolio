import './About.css'

function About(){
    return(
        <section id="about" className="about">
        <div className="tile about-me">
            <div className="label">About me</div>
            <p className="about-lead">I learn best by building something that actually runs.</p>
            <p className="about-text">Most of what I know comes from projects: an event platform, a model that estimates win probability in League of Legends, and an AI reader for invoices. What keeps me going is AI and the moment an idea becomes something that works. This site is the next one, a C# API on Azure with a React front end.</p>
        </div>

        <a href="https://github.com/lwmikkel" className="tile about-github">
            <div className="label">GitHub</div>
            <div>
            <div className="about-github-name">github.com/lwmikkel</div>
            <div className="about-github-cta">See all repositories →</div>
            </div>
        </a>
        </section>
    )
}
export default About