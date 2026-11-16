import './BuiltWith.css'

const STACK = [
    { name: 'C# · .NET', role: 'API', color: '#7C3AED' },
    { name: 'React', role: 'Front end', color: '#0F766E' },
    { name: 'SQLite', role: 'Database', color: '#B45309' },
    { name: 'Azure', role: 'Hosting', color: '#1D4ED8' },
]

function BuiltWith(){
    return(
        <aside className="tile built">
            <div className="built-window" aria-hidden="true">
                <span></span><span></span><span></span>
                <code>this-site</code>
            </div>
            <p className="built-title">I built this site myself.</p>
            <p className="built-text">A C# API serves the projects below, and React shows them.</p>
            <div className="built-chips-wrap">
                <ul className="built-chips">
                    {STACK.map((item) => (
                        <li key={item.name} style={{ '--c': item.color }}>{item.name}</li>
                    ))}
                </ul>
            </div>
            <div className="built-reveal">
                <ul className="built-stack">
                    {STACK.map((item) => (
                        <li key={item.name} style={{ '--c': item.color }}><strong>{item.name}</strong><span>{item.role}</span></li>
                    ))}
                </ul>
            </div>
            <a className="built-link" href="https://github.com/lwmikkel/cv-portfolio" target="_blank" rel="noreferrer">See the code <span aria-hidden="true">→</span></a>
        </aside>
    )
}
export default BuiltWith
