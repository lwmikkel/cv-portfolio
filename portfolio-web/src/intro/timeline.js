// The "script" of the intro, as plain functions of time. No React, no DOM, no 3D here.
//
// Both robots (3D and the 2D fallback) and all the page animations are driven from this one clock,
// so everything stays in sync: where the robot walks, when it points, when the cursor clicks.
//
//   const tl = new Timeline(layout)
//   tl.start('linkedin', now)   -> a "plan" (see below) or null if the robot is busy
//   tl.cues(now)                -> what the robot should be doing right now

import { COMMANDS } from './config.js'

const mod = (a, n) => ((a % n) + n) % n

// Arm angle (rad) when pointing, and where that puts the hand relative to the shoulder.
// The cursor starts at the hand, so the 3D model and the page have to agree on this number.
export const POINT_ANGLE = 2.55
const SHOULDER = { x: 0.6, y: 1.84 } // model units, measured from the feet
const ARM_LENGTH = 0.82

export function handOffset(side, px) {
  return [
    side * (SHOULDER.x + ARM_LENGTH * Math.sin(POINT_ANGLE)) * px,
    -(SHOULDER.y - ARM_LENGTH * Math.cos(POINT_ANGLE)) * px,
  ]
}

export class Timeline {
  constructor(layout, { reduceMotion = false } = {}) {
    this.L = layout
    this.reduce = reduceMotion
    this.reset(0)
    this._cues = {}
  }

  reset(t) {
    this.t0 = t // when the idle wandering started
    this.run = null // the command that is running, if any
    this.lockUntil = 0
  }

  isBusy(t) {
    return t < this.lockUntil
  }

  // Idle wandering: a loop through the waypoints, with a short pause at each one.
  wanderAt(phase) {
    const { wp, walk } = this.L
    if (phase < walk.lead) return wp[0]
    const q = phase - walk.lead
    const seg = Math.min(wp.length - 2, Math.floor(q / (walk.move + walk.pause)))
    const w = q - seg * (walk.move + walk.pause)
    const a = wp[seg]
    const b = wp[seg + 1]
    const u = w < walk.move ? w / walk.move : 1
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]
  }

  // Times (seconds after the click) of everything that happens for one command.
  plan(key, from) {
    const c = this.L.cmd[key]
    const n = COMMANDS[key].text.length
    const ty = Math.max(0.7, n * 0.075 + 0.15) // typing the word into the bar
    const send = ty + 0.35 // "send" is pressed
    const mv0 = send + 0.5 // the robot starts walking
    const dist = Math.hypot(c.stand[0] - from[0], c.stand[1] - from[1])
    const cycles = Math.max(2, Math.round(dist / this.L.walk.speed / this.L.walk.step))
    const D = this.reduce ? 0.35 : cycles * this.L.walk.step // walking time
    const arr = mv0 + D // arrives
    const click = arr + 0.72 // the cursor clicks
    const total = click + (key === 'site' ? 2.0 : 1.4) // everything is done
    return { n, ty, send, mv0, D, arr, click, total }
  }

  // Starts a command at time t. Returns the run, or null if the robot is still busy with the last one.
  start(key, t) {
    if (this.isBusy(t) || !this.L.cmd[key]) return null
    const c = this.L.cmd[key]
    const from = this.run ? this.run.to : this.wanderAt(mod(t - this.t0, this.L.walk.loop))
    const P = this.plan(key, from)
    const side = c.point[0] < c.stand[0] ? -1 : 1 // which arm points: -1 = the left one on screen
    this.run = { key, t0: t, from: [from[0], from[1]], to: c.stand, point: c.point, side, P }
    this.lockUntil = t + P.total
    return this.run
  }

  // Where the robot's feet are at time t (stage pixels).
  pos(t) {
    const run = this.run
    if (!run) return this.reduce ? this.L.wp[0] : this.wanderAt(mod(t - this.t0, this.L.walk.loop))
    const rt = t - run.t0
    const P = run.P
    if (rt <= P.mv0) return run.from
    if (rt >= P.arr) return run.to
    let u = (rt - P.mv0) / P.D
    u = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u) // ease in and out
    return [run.from[0] + (run.to[0] - run.from[0]) * u, run.from[1] + (run.to[1] - run.from[1]) * u]
  }

  // Everything the robot needs to know at time t.
  cues(t) {
    const c = this._cues
    const p = this.pos(t)
    const q = this.pos(t - 0.05)
    c.x = p[0]
    c.y = p[1]
    c.vx = (p[0] - q[0]) / 0.05
    c.vy = (p[1] - q[1]) / 0.05
    c.speed = Math.hypot(c.vx, c.vy)
    c.pointSide = 0 // -1 / 1 = raise that arm to point, 0 = none
    c.lookAt = null // [x, y] the robot looks at
    c.eyesOpen = false
    c.cheer = false // both arms up, little hops
    c.happy = false // glowing cheeks, bigger chest light
    c.wave = !this.run && !this.reduce && t - this.t0 >= 0.5 && t - this.t0 < 3.0 // the greeting wave
    const run = this.run
    if (run) {
      const rt = t - run.t0
      const P = run.P
      if (rt >= P.arr - 0.15 && rt < P.arr + 1.0) c.pointSide = run.side
      if (rt >= P.arr - 0.2 && rt < P.arr + 1.2) c.lookAt = run.point
      c.eyesOpen = rt >= P.send && rt < P.click + 0.1
      c.cheer = rt >= P.click + 0.3 && rt < P.click + 1.6
      c.happy = rt >= P.click && rt < P.click + 2.6
    }
    return c
  }
}
