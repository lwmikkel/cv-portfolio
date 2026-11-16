import './BuiltWith.css'

const STACK = [
    { name: 'C# · .NET', role: 'API', color: '#8FA8FF' },
    { name: 'React', role: 'Front end', color: '#7FB2E5' },
    { name: 'SQLite', role: 'Database', color: '#6CC4D8' },
    { name: 'Azure', role: 'Hosting', color: '#A9C4FF' },
]

function BuiltWith(){
    return(
        <aside className="tile built">
            <p className="built-title">Behind this site</p>
            <p className="built-text">I wrote most of the backend myself in C# and .NET, and built the React frontend with AI assistance.</p>
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
