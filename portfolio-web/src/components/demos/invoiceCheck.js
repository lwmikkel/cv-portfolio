const VAT_RATE = 0.25

export const TOLERANCE = 1
export const MISSING = 'MANGLER'

export function toNumber(text) {
  const value = parseFloat(String(text).replace(',', '.'))
  return Number.isFinite(value) ? value : NaN
}

export function formatAmount(value) {
  return value.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function expectedAmounts(subtotal) {
  const sub = toNumber(subtotal)
  if (Number.isNaN(sub)) return null
  const vat = sub * VAT_RATE
  return { vat, total: sub + vat }
}

export function verifyInvoice({ subtotal, vat, total }) {
  const expected = expectedAmounts(subtotal)
  const vatAmount = toNumber(vat)
  const totalAmount = toNumber(total)
  if (!expected || Number.isNaN(vatAmount) || Number.isNaN(totalAmount)) {
    return { kind: 'unknown', problems: [] }
  }

  const problems = []
  if (Math.abs(vatAmount - expected.vat) > TOLERANCE) {
    problems.push(`Moms forkert (burde vaere DKK ${formatAmount(expected.vat)})`)
  }
  if (Math.abs(totalAmount - expected.total) > TOLERANCE) {
    problems.push(`Total forkert (burde vaere DKK ${formatAmount(expected.total)})`)
  }

  return { kind: problems.length > 0 ? 'error' : 'ok', problems }
}

export function folderFor(number, status) {
  if (status.kind === 'error') return 'errors'
  if (number === MISSING || status.kind === 'unknown') return 'missing'
  return 'approved'
}
