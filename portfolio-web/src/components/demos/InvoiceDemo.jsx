import { useEffect, useRef, useState } from 'react'
import { invoices } from './invoiceSamples.js'
import { verifyInvoice, folderFor, expectedAmounts, formatAmount, toNumber, TOLERANCE, MISSING } from './invoiceCheck.js'
import InvoicePreview from './InvoicePreview.jsx'
import './Demo.css'

const STEP_MS = 480

const folderNames = { approved: 'Godkendt', errors: 'Fejl', missing: 'Mangler' }
const statusText = { ok: 'OK', error: 'FEJL', unknown: 'Kunne ikke beregne' }
const tones = { ok: 'pass', error: 'fail', unknown: 'unknown' }
const marks = { ok: '✓', error: '✗', unknown: '?' }

const amountFields = [
  ['subtotal', 'SUBTOTAL'],
  ['vat', 'MOMS'],
  ['total', 'TOTAL'],
]

const reportColumns = ['Fakturanummer', 'Subtotal', 'Moms', 'Total', 'Status']

function orMissing(text) {
  return String(text).trim() === '' ? MISSING : text
}

function shown(text) {
  const value = toNumber(text)
  return Number.isNaN(value) ? text : formatAmount(value)
}

function buildReport(invoice, edits) {
  const values = { ...invoice.fields, ...edits[invoice.id] }
  const clean = {
    subtotal: orMissing(values.subtotal),
    vat: orMissing(values.vat),
    total: orMissing(values.total),
  }
  const status = verifyInvoice(clean)
  return { values, clean, status, folder: folderFor(values.number, status) }
}

function checkSummary(status, failing) {
  if (status.kind === 'unknown') return 'A number is missing, so nothing can be calculated'
  if (status.kind === 'ok') return 'VAT and total add up'
  if (failing.length === 2) return 'VAT and total are both wrong'
  const row = failing[0]
  return `${row.name} is ${formatAmount(row.found)}, should be ${formatAmount(row.expected)}`
}

function InvoiceDemo() {
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState(4)
  const [open, setOpen] = useState(null)
  const [edits, setEdits] = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function run(next) {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setIndex(next)
    setOpen(null)
    setEdits(list => ({ ...list, [invoices[next].id]: {} }))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(4)
      return
    }

    setStage(0)
    for (let step = 1; step <= 4; step += 1) {
      timers.current.push(setTimeout(() => setStage(step), 250 + step * STEP_MS))
    }
  }

  function change(key, value) {
    const id = invoices[index].id
    setEdits(list => ({ ...list, [id]: { ...list[id], [key]: value } }))
  }

  const invoice = invoices[index]
  const { values, clean, status, folder } = buildReport(invoice, edits)
  const expected = expectedAmounts(clean.subtotal)
  const checks = expected
    ? [
        { name: 'VAT', label: 'VAT = 25 % of subtotal', expected: expected.vat, found: toNumber(clean.vat) },
        { name: 'Total', label: 'Total = subtotal + VAT', expected: expected.total, found: toNumber(clean.total) },
      ]
    : []
  const failing = checks.filter(row => !Number.isNaN(row.found) && Math.abs(row.found - row.expected) > TOLERANCE)
  const statusLine = status.kind === 'error' ? `FEJL - ${status.problems.join(' | ')}` : statusText[status.kind]

  const rows = [
    {
      n: 1,
      title: 'Read the PDF',
      summary: `${invoice.text.split('\n').length} lines of text`,
      mark: '1',
      body: <pre className="mono-box" tabIndex={0}>{invoice.text}</pre>,
    },
    {
      n: 2,
      title: 'Claude extracts',
      summary: `Subtotal ${shown(clean.subtotal)} · VAT ${shown(clean.vat)} · Total ${shown(clean.total)}`,
      mark: '2',
      body: (
        <>
          <dl className="fields">
            <div><dt>LEVERANDOER</dt><dd>{values.supplier}</dd></div>
            <div><dt>FAKTURANUMMER</dt><dd>{values.number}</dd></div>
            <div><dt>DATO</dt><dd>{values.date}</dd></div>
            {amountFields.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  <input
                    className="inv-input"
                    inputMode="decimal"
                    placeholder={MISSING}
                    value={values[key]}
                    aria-label={`${label} (DKK)`}
                    onChange={e => change(key, e.target.value)}
                  />
                  <span className="unit">DKK</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="step-note">Edit an amount, or clear one, and the steps below update.{invoice.note ? ` ${invoice.note}` : ''}</p>
        </>
      ),
    },
    {
      n: 3,
      title: 'Python checks',
      summary: checkSummary(status, failing),
      tone: tones[status.kind],
      mark: marks[status.kind],
      body: checks.length > 0 ? (
        <>
          <table className="check">
            <thead>
              <tr><th scope="col">Rule</th><th scope="col">Expected</th><th scope="col">Found</th></tr>
            </thead>
            <tbody>
              {checks.map(row => {
                const missing = Number.isNaN(row.found)
                const bad = !missing && Math.abs(row.found - row.expected) > TOLERANCE
                return (
                  <tr key={row.name} className={missing ? 'unknown' : bad ? 'fail' : 'pass'}>
                    <th scope="row">{row.label}</th>
                    <td>{formatAmount(row.expected)}</td>
                    <td>{missing ? MISSING : formatAmount(row.found)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="step-note">Tolerance DKK {TOLERANCE}</p>
        </>
      ) : (
        <p className="step-note">The subtotal is missing, so there is nothing to calculate from.</p>
      ),
    },
    {
      n: 4,
      title: 'Report and file',
      summary: (
        <>
          <span className={`verdict ${status.kind}`}>{statusText[status.kind]}</span>
          <span className="flow-folder">{invoice.file} → <b>{folderNames[folder]}/</b></span>
        </>
      ),
      mark: '4',
      body: (
        <div className="xl-wrap">
          <table className="xl">
            <thead>
              <tr>{reportColumns.map(column => <th key={column} scope="col">{column}</th>)}</tr>
            </thead>
            <tbody>
              <tr className={`xl-${status.kind}`}>
                <td>{orMissing(values.number)}</td>
                <td>{shown(clean.subtotal)}</td>
                <td>{shown(clean.vat)}</td>
                <td>{shown(clean.total)}</td>
                <td className="xl-status">{statusLine}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
  ]

  return (
    <div className="demo invoice-demo">
      <div className="demo-bar">
        <div className="demo-group">
          <span className="label">Invoice</span>
          <div className="seg" role="group" aria-label="Sample invoice">
            {invoices.map((item, i) => (
              <button key={item.id} type="button" className={i === index ? 'on' : ''} aria-pressed={i === index} onClick={() => run(i)}>
                {item.id}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="btn-pill ghost small" onClick={() => run(index)}>Run again</button>
      </div>

      <div className="inv2">
        <figure className="inv2-doc">
          <button
            type="button"
            className="doc-view invoice-preview-trigger"
            aria-label={`Enlarge invoice ${invoice.id}`}
            aria-haspopup="dialog"
            onClick={() => setPreviewOpen(true)}
          >
            <img src={invoice.image} alt={`Rendering of ${invoice.file}`} width="640" height={invoice.id === '005' ? 693 : 476} />
            <span className="invoice-expand" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6" />
              </svg>
            </span>
          </button>
          <figcaption>Fictional invoice made by AI</figcaption>
        </figure>

        <div className="inv2-flow">
          <ol className="flow">
            {rows.map(row => {
              const active = stage >= row.n
              const expanded = open === row.n && active
              return (
                <li key={row.n} className={`flow-row${active ? ' on' : ''}${expanded ? ' open' : ''}${row.tone ? ` ${row.tone}` : ''}`}>
                  <button
                    type="button"
                    className="flow-head"
                    aria-expanded={expanded}
                    disabled={!active}
                    onClick={() => setOpen(current => (current === row.n ? null : row.n))}
                  >
                    <span className="flow-n">{row.mark}</span>
                    <span className="flow-title">{row.title}</span>
                    <span className="flow-sum">{row.summary}</span>
                    <span className="flow-chev" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  {expanded && <div className="flow-body">{row.body}</div>}
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {previewOpen && <InvoicePreview invoice={invoice} onClose={() => setPreviewOpen(false)} />}
    </div>
  )
}

export default InvoiceDemo
