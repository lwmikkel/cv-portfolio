import "./Hero.css"
import portrait from '../assets/Cvbillede.png'

function Hero(){
    return(
        <section className = "hero">
            <div className = "hero-main">
                <span className="hero-badge">Open to student developer roles</span>
                <h1>Hi, I'm Mikkel.</h1>
                <p>Software student at Aalborg university</p>
                <div className = "hero-buttons">
                    <a href="#projects">View projects</a>
                    <a href="https://github.com/lwmikkel">GitHub</a>
                    <a href="https://www.linkedin.com/in/mikkel-wilquin-742a66248">LinkedIn</a>
                </div>
            </div>
            <div className="hero-photo">
                <img src={portrait} alt="Portrait of Mikkel Wilquin" />
                <div className="hero-photo-caption">
                    <strong>Mikkel Wilquin</strong>
                    <span>Software, AAU Copenhagen</span>
                </div>
                
            </div>
        </section>
    )
}

export default Hero