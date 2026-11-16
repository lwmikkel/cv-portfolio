import EventDemo from './EventDemo.jsx'
import InvoiceDemo from './InvoiceDemo.jsx'
import MlDemo from './MlDemo.jsx'

const kinds = [
  { match: /event/i, color: '#0F766E', Demo: EventDemo },
  { match: /invoice/i, color: '#7C3AED', Demo: InvoiceDemo, codeUrl: 'https://github.com/lwmikkel/Ai-Invoice-reader.git' },
  { match: /machine|league/i, color: '#B45309', Demo: MlDemo, codeUrl: 'https://github.com/lwmikkel/Machinelearning.git' },
]

export function kindFor(project) {
  return kinds.find(kind => kind.match.test(project.name)) ?? { color: '#0F766E', Demo: null }
}
