import { useEffect, useState } from 'react'
import { teams } from './eloData.js'
import { history, total } from './eloReplay.js'
import { models } from './winModel.js'
import './Demo.css'

const STEP = 12
const TICK_MS = 40

const tabs = [
  ['train', 'Train the model'],
  ['results', 'Results'],
]

const count = new Intl.NumberFormat('en-US')

function Train() {
  const [n, setN] = useState(0)
  const [playing, setPlaying] = useState(false)
  const running = playing && n < total

  useEffect(() => {
    if (!running) return undefined
    const id = setInterval(() => setN(value => Math.min(total, value + STEP)), TICK_MS)
    return () => clearInterval(id)
  }, [running])

  const last = n > 0 ? history.steps[n - 1] : null
  const accuracy = last ? (last.hits / n) * 100 : 0
  const done = n >= total

  function start() {
    setN(0)
    setPlaying(true)
  }

  let note = null
  if (done) {
    note = 'Done. Guessing would give about 50 %.'
  } else if (last) {
    note = (
      <>
        <span>{teams[last.blue]} vs {teams[last.red]}</span>
        <b className={last.correct ? 'good' : 'bad'}>{last.correct ? '✓' : '✗'}</b>
      </>
    )
  }

  return (
    <>
      <div className="ml-controls">
        <button type="button" className="btn-pill" disabled={running} onClick={start}>
          {running ? 'Training…' : done ? 'Train again' : 'Start training'}
        </button>
        <span className="ml-count">Match {count.format(n)} of {count.format(total)}</span>
      </div>

      <div className="ml-accuracy">
        <div className="ml-accuracy-head">
          <span>Predicted correctly</span>
          <strong>{last ? `${accuracy.toFixed(1)} %` : '0 %'}</strong>
        </div>
        <span className="bar best">
          <i style={{ width: `${accuracy}%` }} />
        </span>
        {note && <p className="ml-note">{note}</p>}
      </div>
    </>
  )
}

function Results() {
  return (
    <div className="ml-results">
      <p className="ml-label">Prediction accuracy · marker: 50 %</p>
      {models.map(model => (
        <div className="ml-row" key={model.name}>
          <span className="ml-model"><b>{model.name}</b><small>{model.sees}</small></span>
          <span className={`bar${model.best ? ' best' : ''}`}><i style={{ width: `${model.accuracy}%` }} /></span>
          <b className="ml-value">{model.accuracy.toFixed(1)} %</b>
        </div>
      ))}
      <p className="ml-fine">The rating is fitted on all {count.format(total)} matches, the draft models on an 80/20 time split.</p>
    </div>
  )
}

function MlDemo() {
  const [tab, setTab] = useState('train')

  return (
    <div className="demo">
      <div className="demo-bar">
        <div className="seg" role="group" aria-label="View">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" className={tab === key ? 'on' : ''} aria-pressed={tab === key} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="ml-body">
        {tab === 'train' ? <Train /> : <Results />}
      </div>

    </div>
  )
}

export default MlDemo
