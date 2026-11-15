import "./Hero.css"
import portrait from '../assets/Cvbillede.png'

function Hero(){
    return(
        <section className = "hero">
            <div className = "hero-main">
                <h1>Hi, I'm Mikkel<span className="hero-dot">.</span></h1>
                <p className="hero-lead">Software student at Aalborg University Copenhagen.</p>
                <div className="hero-text">
                    <p>What drives me is taking an idea all the way to something you can actually use.</p>
                    <p>I am looking for a student job where I can work on something real, see how it looks in practice outside my own projects and my studies, and learn from skilled people with more experience.</p>
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
