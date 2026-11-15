import { useEffect, useRef } from 'react'
import './About.css'
import { ROBOT_SVG } from './guideRobot'

const ROWS = [
    {
        color: '#0F766E',
        icon: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" /><path d="M22 9v6" /></>,
        text: 'I am Mikkel, 22 years old, and I live in Rødovre. I am in my third semester of software at Aalborg University in Copenhagen.',
    },
    {
        color: '#7C3AED',
        icon: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
        text: 'I spend most of my free time on my own projects. I am especially interested in how AI can take over tasks that people do by hand today.',
    },
    {
        color: '#B45309',
        icon: <><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="2.5" y="13" width="4" height="6" rx="1.5" /><rect x="17.5" y="13" width="4" height="6" rx="1.5" /><path d="M20 19c0 1.7-2 2.5-5 2.5" /></>,
        text: 'Alongside my studies I work at the Coop service desk. Store staff call when something has stopped working and they are in a hurry, so I have learned to stay calm and explain the solution in plain language.',
    },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function About(){
    const cardRef = useRef(null)

    useEffect(() => {
        const card = cardRef.current
        const bot = card.querySelector('.guide-bot')
        const wrap = card.querySelector('.about-botwrap')
        const btn = card.querySelector('.about-askbtn')
        const ask = card.querySelector('.about-ask')
        const slot = card.querySelector('.about-slot')
        const reveal = card.querySelector('.about-reveal')
        const eyes = bot.querySelector('[data-p="eyes"]')
        const rows = [...card.querySelectorAll('.about-row')].map((row) => [...row.querySelectorAll('.w')])
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const controller = new AbortController()
        const signal = controller.signal
        const timers = []
        let alive = true
        let done = false
        let waited = 0

        const cls = (name, on) => bot.classList.toggle(name, on)
        const later = (fn, ms) => timers.push(setTimeout(fn, ms))

        const go = async () => {
            if (done) return
            done = true
            if (reduce) {
                ask.style.display = 'none'
                slot.appendChild(bot)
                reveal.classList.add('open')
                return
            }
            btn.style.animation = 'none'
            btn.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-30px) scale(.86)', opacity: 0 }], { duration: 320, easing: 'ease-in', fill: 'forwards' })
            cls('idle', false)
            cls('open', true)
            cls('think', true)
            await bot.animate([{ transform: 'none' }, { transform: 'translateY(-14px)' }, { transform: 'none' }], { duration: 380, easing: 'ease-out' }).finished.catch(() => {})
            await sleep(520)
            if (!alive) return
            cls('think', false)
            const from = bot.getBoundingClientRect()
            const height = ask.getBoundingClientRect().height
            slot.appendChild(bot)
            const to = bot.getBoundingClientRect()
            ask.animate([{ height: height + 'px', opacity: 1 }, { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' })
            reveal.classList.add('open')
            const dx = from.left - to.left
            const dy = from.bottom - to.bottom
            const scale = from.width / to.width
            bot.animate([
                { transform: `translate(${dx}px,${dy}px) scale(${scale})` },
                { transform: `translate(${dx * 0.5}px,${dy * 0.2 - 26}px) scale(${(scale + 1) / 2})`, offset: 0.55 },
                { transform: 'none' },
            ], { duration: 760, easing: 'cubic-bezier(.3,.1,.2,1)' })
            cls('point', true)
            let count = 0
            rows.forEach((words, index) => words.forEach((word) => {
                word.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 520 + index * 260 + count * 26, easing: 'ease-out', fill: 'backwards' })
                count += 1
            }))
            await sleep(520 + 2 * 260 + count * 26 + 300)
            if (!alive) return
            cls('point', false)
            cls('open', false)
            cls('happy', true)
            cls('hello', true)
            await sleep(1900)
            if (!alive) return
            cls('hello', false)
            cls('happy', false)
            cls('idle', true)
        }

        window.addEventListener('pointermove', (event) => {
            const rect = bot.getBoundingClientRect()
            const dx = event.clientX - (rect.left + rect.width / 2)
            const dy = event.clientY - (rect.top + rect.height * 0.28)
            const length = Math.hypot(dx, dy) || 1
            const amount = Math.min(1, length / 180)
            eyes.style.transform = `translate(${dx / length * 4.5 * amount}px,${dy / length * 3.5 * amount}px)`
        }, { signal })
        btn.addEventListener('click', go, { signal })
        bot.addEventListener('click', go, { signal })

        const watch = setInterval(() => {
            if (done) return
            const rect = card.getBoundingClientRect()
            const visible = rect.top < window.innerHeight * 0.85 && rect.bottom > 0
            if (!visible || document.querySelector('[data-guide-intro]')) return
            waited += 500
            if (waited === 1500 && !reduce) {
                cls('hello', true)
                later(() => cls('hello', false), 1900)
            }
            if (waited >= 9000) go()
        }, 500)

        return () => {
            alive = false
            controller.abort()
            clearInterval(watch)
            timers.forEach(clearTimeout)
            card.querySelectorAll('*').forEach((node) => node.getAnimations().forEach((animation) => animation.cancel()))
            wrap.appendChild(bot)
            bot.className = 'guide-bot idle'
            ask.style.display = ''
            btn.style.animation = ''
            reveal.classList.remove('open')
        }
    }, [])

    return(
        <section id="about" className="about">
        <div className="tile about-me" ref={cardRef}>
            <div className="about-head">
                <div className="about-pill">About me</div>
                <div className="about-slot"></div>
            </div>
            <div className="about-ask">
                <div className="about-botwrap">
                    <div className="guide-bot idle" role="img" aria-label="Robot guide" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 120 170">${ROBOT_SVG}</svg>` }} />
                </div>
                <button className="about-askbtn" type="button">More about Mikkel <i aria-hidden="true">↑</i></button>
            </div>
            <div className="about-reveal">
                <div className="about-inner">
                    {ROWS.map((row) => (
                        <div className="about-row" key={row.color} style={{ '--c': row.color }}>
                            <span className="about-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{row.icon}</svg>
                            </span>
                            <p className="about-text">{row.text.split(' ').map((word, index) => <span className="w" key={index}>{word} </span>)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </section>
    )
}
export default About
