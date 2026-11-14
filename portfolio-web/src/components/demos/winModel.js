const INTERCEPT = -0.01486316
const COEFFICIENT = 0.0116277

export function winProbability(blueElo, redElo) {
  const z = INTERCEPT + COEFFICIENT * (blueElo - redElo)
  return 1 / (1 + Math.exp(-z))
}

export const models = [
  { name: 'Draft only', sees: 'Champion picks', auc: 0.494, accuracy: 51.0, logLoss: 0.877 },
  { name: 'Elo rating', sees: 'Team strength', auc: 0.639, accuracy: 59.5, logLoss: 0.662, best: true },
  { name: 'Draft + Elo', sees: 'Both combined', auc: 0.527, accuracy: 52.3, logLoss: 1.197 },
]
