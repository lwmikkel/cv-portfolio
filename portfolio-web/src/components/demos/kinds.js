import EventDemo from './EventDemo.jsx'
import InvoiceDemo from './InvoiceDemo.jsx'
import MlDemo from './MlDemo.jsx'

const kinds = [
  { match: /event/i, color: '#2F7FA0', Demo: EventDemo },
  { match: /invoice/i, color: '#4F5FA8', Demo: InvoiceDemo, codeUrl: 'https://github.com/lwmikkel/Ai-Invoice-reader.git' },
  { match: /machine|league/i, color: '#3B6A9C', Demo: MlDemo, codeUrl: 'https://github.com/lwmikkel/Machinelearning.git' },
]

export function kindFor(project) {
  return kinds.find(kind => kind.match.test(project.name)) ?? { color: '#2F7FA0', Demo: null }
}
