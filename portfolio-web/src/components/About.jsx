import './About.css'

const now = [
    ['Studying', 'Software at Aalborg University Copenhagen, 2025 to 2028'],
    ['Working', 'IT supporter on the Coop service desk'],
    ['Building', 'This site: a C# API with a React front end'],
    ['Learning', 'C#, .NET and Azure'],
]

function About(){
    return(
        <section id="about" className="about">
        <div className="tile about-me">
            <div className="label">About me</div>
            <p className="about-lead">I learn best by building something that actually runs.</p>
            <p className="about-text">Most of what I know comes from projects: an event platform, a model that estimates win probability in League of Legends, and an AI reader for invoices. What keeps me going is AI and the moment an idea becomes something that works. This site is the next one, a C# API on Azure with a React front end.</p>
        </div>

        <div className="tile about-now">
            <div className="label about-now-label"><span className="about-dot" aria-hidden="true" />Right now</div>
            <dl className="about-now-list">
                {now.map(([title, text]) => (
                    <div key={title}>
                        <dt>{title}</dt>
                        <dd>{text}</dd>
                    </div>
                ))}
            </dl>
        </div>
        </section>
    )
}
export default About
