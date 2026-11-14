import { teams, matches } from './eloData.js'
import { winProbability } from './winModel.js'

const BASE = 1500
const K = 20

function replay() {
  const ratings = new Array(teams.length).fill(BASE)
  let hits = 0
  const steps = matches.map(([blue, red, result]) => {
    const eloBlue = ratings[blue]
    const eloRed = ratings[red]
    const probability = winProbability(eloBlue, eloRed)
    const correct = (probability > 0.5) === (result === 1)
    if (correct) hits += 1
    const change = K * (result - 1 / (1 + 10 ** ((eloRed - eloBlue) / 400)))
    ratings[blue] += change
    ratings[red] -= change
    return { blue, red, result, eloBlue, eloRed, probability, correct, hits, change }
  })
  return { steps, final: ratings }
}

export const history = replay()
export const total = history.steps.length
