// Turns the "cues" from the timeline (walking? pointing? waving?) into a smooth body pose:
// angles, offsets and fades. It knows nothing about 3D or SVG, so Robot3D and Robot2D both use it.
//
// Everything is smoothed with exponential easing (see `ease`), which looks the same at any frame rate.

import { POINT_ANGLE } from './timeline.js'

const lerp = (a, b, k) => a + (b - a) * k
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export class PoseState {
  constructor(px) {
    this.k = px / 50 // desktop robot = 50 px per model unit; thresholds below are tuned for that
    this.gt = 0 // running time, for breathing, swaying and blinking
    this.walkPhase = 0
    this.walkAmt = 0
    this.dir = 1
    this.face = 0
    this.ptL = 0
    this.ptR = 0
    this.wave = 0
    this.cheer = 0
    this.cheek = 0
    this.lookX = 0
    this.lookY = 0
    this.blinkAt = 2.4
    this.blinkT = -1
    this.o = {} // the result, reused every frame
    // smoothed outputs that need their previous value
    this.s = { bob: 0, tiltZ: 0, tiltX: 0, legL: 0, legR: 0, armZL: -0.07, armZR: 0.07, armXL: 0, armXR: 0 }
  }

  step(c, dt, pointer) {
    const ease = (rate) => 1 - Math.exp(-rate * dt)
    const s = this.s
    const o = this.o
    this.gt += dt
    const gt = this.gt

    // ---- walking ----
    const moving = c.speed > 20 * this.k
    this.walkAmt = lerp(this.walkAmt, moving ? 1 : 0, ease(12))
    if (moving) this.walkPhase += dt * Math.min(13, 6 + (c.speed / this.k) * 0.05)
    else this.walkPhase += (Math.round(this.walkPhase / Math.PI) * Math.PI - this.walkPhase) * ease(8) // settle the stride
    if (Math.abs(c.vx) > 11 * this.k) this.dir = c.vx > 0 ? 1 : -1
    this.face = lerp(this.face, moving ? -this.dir * 0.97 : 0, ease(7)) // three-quarter turn while walking
    const sw = Math.sin(this.walkPhase)
    const wa = this.walkAmt
    s.legL = lerp(s.legL, sw * 0.62 * wa, ease(22))
    s.legR = lerp(s.legR, -sw * 0.62 * wa, ease(22))

    // ---- body: breathing, walking bob, little hops when cheering ----
    this.cheer = lerp(this.cheer, c.cheer ? 1 : 0, ease(10))
    const bob = Math.sin(gt * 2.0) * 0.018 + Math.abs(Math.cos(this.walkPhase)) * 0.07 * wa + Math.abs(Math.sin(gt * 5.5)) * 0.14 * this.cheer
    s.bob = lerp(s.bob, bob, ease(24))
    s.tiltZ = lerp(s.tiltZ, sw * 0.03 * wa, ease(12))
    s.tiltX = lerp(s.tiltX, -0.07 * wa, ease(8))

    // ---- arms: swing while walking, point, wave, cheer ----
    this.ptL = lerp(this.ptL, c.pointSide < 0 ? 1 : 0, ease(10))
    this.ptR = lerp(this.ptR, c.pointSide > 0 ? 1 : 0, ease(10))
    this.wave = lerp(this.wave, c.wave ? 1 : 0, ease(8))
    const upL = Math.max(this.ptL, this.cheer)
    const upR = Math.max(this.ptR, this.wave, this.cheer)
    const swayL = -sw * 0.55 * wa + Math.sin(gt * 1.4) * 0.03 * (1 - wa)
    const swayR = sw * 0.55 * wa + Math.sin(gt * 1.4 + 1) * 0.03 * (1 - wa)
    let raiseL = -(2.45 + Math.sin(gt * 5.5) * 0.12 * this.cheer)
    let raiseR = 2.45 + Math.sin(gt * 9) * 0.28 * this.wave + Math.sin(gt * 5.5 + 1) * 0.12 * this.cheer
    if (this.ptL > 0.5 && this.cheer < 0.5) raiseL = -POINT_ANGLE
    if (this.ptR > 0.5 && this.cheer < 0.5 && this.wave < 0.5) raiseR = POINT_ANGLE
    s.armZL = lerp(s.armZL, lerp(-0.07, raiseL, upL), ease(11)) // sideways raise (left is negative)
    s.armZR = lerp(s.armZR, lerp(0.07, raiseR, upR), ease(11))
    s.armXL = lerp(s.armXL, lerp(swayL, -0.5, upL), ease(12)) // forward/back; raised arms tilt forward, clear of the ears
    s.armXR = lerp(s.armXR, lerp(swayR, -0.5, upR), ease(12))

    // ---- head and eyes: look at the target while pointing, otherwise follow the mouse ----
    let lx = 0
    let ly = 0
    if (c.lookAt) {
      lx = clamp((c.lookAt[0] - c.x) / (260 * this.k), -1, 1)
      ly = clamp((c.lookAt[1] - (c.y - 100 * this.k)) / (300 * this.k), -1, 1)
    } else if (pointer) {
      lx = clamp((pointer[0] - c.x) / (420 * this.k), -1, 1)
      ly = clamp((pointer[1] - (c.y - 100 * this.k)) / (320 * this.k), -1, 1)
    }
    this.lookX = lerp(this.lookX, lx, ease(8))
    this.lookY = lerp(this.lookY, ly, ease(8))

    // ---- blinking ----
    let blink = 1
    if (gt > this.blinkAt && this.blinkT < 0) this.blinkT = 0
    if (this.blinkT >= 0) {
      this.blinkT += dt
      const b = this.blinkT / 0.16
      blink = b < 1 ? Math.max(0.08, 1 - Math.sin(b * Math.PI) * 0.92) : 1
      if (b >= 1) {
        this.blinkT = -1
        this.blinkAt = gt + 2.5 + Math.random() * 3
      }
    }

    this.cheek = lerp(this.cheek, c.happy || c.wave ? 0.75 : 0, ease(6))
    const pulse = Math.max(0, Math.sin(gt * 2.6))

    // ---- result ----
    o.x = c.x
    o.y = c.y
    o.face = this.face // turn of the whole body (rad)
    o.walkAmt = wa
    o.walkPhase = this.walkPhase
    o.sw = sw
    o.legL = s.legL // leg swing (rad)
    o.legR = s.legR
    o.legLiftL = Math.max(0, -sw) * 0.09 * wa // the foot that is in the air lifts a little (model units)
    o.legLiftR = Math.max(0, sw) * 0.09 * wa
    o.bob = s.bob // body height (model units)
    o.tiltZ = s.tiltZ
    o.tiltX = s.tiltX
    o.armZL = s.armZL
    o.armZR = s.armZR
    o.armXL = s.armXL
    o.armXR = s.armXR
    o.swingL = swayL * (1 - upL) // the walking swing that is left when the arm is not raised
    o.swingR = swayR * (1 - upR)
    o.headYaw = this.lookX * 0.45
    o.headPitch = this.lookY * 0.16 + Math.sin(gt * 1.6) * 0.01
    o.headRoll = Math.sin(gt * 0.9) * 0.045 + Math.sin(gt * 5.5) * 0.06 * this.cheer
    o.eyeX = this.lookX
    o.eyeY = this.lookY
    o.blink = blink // 1 = open, 0.08 = shut
    o.eyesOpen = moving || c.eyesOpen // wide-open eyes while busy, happy arcs while resting
    o.cheek = this.cheek
    o.antRoll = Math.sin(gt * 2.4 - 0.7) * 0.16 + Math.sin(this.walkPhase * 2 - 1) * 0.12 * wa
    o.antPitch = Math.sin(gt * 1.9) * 0.08
    o.pulse = pulse // chest light beat, 0..1
    o.happy = c.happy
    return o
  }
}
