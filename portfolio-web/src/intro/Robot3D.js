// The 3D robot (Babylon.js). This file is loaded lazily (dynamic import) by GuideIntro, so the ~1.5 MB
// of Babylon is only downloaded when the browser can actually show 3D.
//
//   const robot = createRobot3D(canvas)
//   robot.setStage(1280, 800, 50)      // stage size in px and pixels per model unit
//   robot.setResolution(1)             // render scale (1 = one canvas pixel per CSS pixel of the unscaled stage)
//   robot.render(pose)                 // pose comes from PoseState.step()
//   robot.dispose()
//
// The camera is orthographic and looks straight at the stage, so one model unit is exactly `px` stage pixels
// and the robot lines up with the page elements (logos, screen, cursor). The canvas has a transparent
// background and sits on top of the page.

import '@babylonjs/core/Engines/Extensions/engine.dynamicTexture'
import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Camera } from '@babylonjs/core/Cameras/camera'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import { CreateCapsule } from '@babylonjs/core/Meshes/Builders/capsuleBuilder'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder'
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'

export function createRobot3D(canvas) {
  const engine = new Engine(canvas, true, { alpha: true, stencil: false, antialias: true, premultipliedAlpha: true }, false)
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0, 0, 0, 0) // transparent: the page shows through
  scene.skipPointerMovePicking = true

  // ---------- camera: orthographic and straight on ----------
  const camera = new FreeCamera('camera', new Vector3(0, 0, -60), scene)
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA
  camera.minZ = 1
  camera.maxZ = 200
  let stage = { W: 1280, H: 800, px: 50 }

  // ---------- lights: warm key from the upper left, cool fill, back rim ----------
  const hemi = new HemisphericLight('hemi', new Vector3(0, 1, -0.25), scene)
  hemi.intensity = 0.8
  hemi.diffuse = new Color3(1, 0.99, 0.97)
  hemi.groundColor = new Color3(0.74, 0.72, 0.68)
  hemi.specular = Color3.Black()
  const key = new DirectionalLight('key', new Vector3(0.4, -1.6, 0.6), scene)
  key.intensity = 1.15
  key.diffuse = new Color3(1, 0.97, 0.92)
  const fill = new DirectionalLight('fill', new Vector3(-0.8, -0.35, 0.7), scene)
  fill.intensity = 0.42
  fill.diffuse = new Color3(0.84, 0.93, 1)
  const rim = new DirectionalLight('rim', new Vector3(-0.35, -0.3, -1), scene)
  rim.intensity = 0.55
  rim.diffuse = new Color3(0.9, 1, 0.98)

  // ---------- materials: glossy plastic ----------
  function plastic(name, hex, { rough = 0.34, glow = 0.1, coat = 0.55 } = {}) {
    const m = new PBRMaterial(name, scene)
    const c = Color3.FromHexString(hex)
    m.albedoColor = c
    m.metallic = 0
    m.roughness = rough
    m.environmentIntensity = 0 // no environment map: only the three lights above
    m.emissiveColor = c.scale(glow)
    m.clearCoat.isEnabled = true
    m.clearCoat.intensity = coat
    m.clearCoat.roughness = 0.12
    return m
  }
  const white = plastic('white', '#F6F8F7', { rough: 0.3, glow: 0.16 })
  const teal = plastic('teal', '#139E8D', { rough: 0.28, glow: 0.12 })
  const tealDeep = plastic('tealDeep', '#0C5F58', { rough: 0.3, glow: 0.1 })
  const screenMat = plastic('screen', '#05080A', { rough: 0.22, coat: 0.35, glow: 0 })
  const grey = plastic('grey', '#C5CAC7', { rough: 0.3, glow: 0.12 })
  const glowMat = new StandardMaterial('glowMat', scene) // the two lights (chest dot, antenna ball)
  glowMat.diffuseColor = Color3.Black()
  glowMat.specularColor = Color3.Black()
  glowMat.emissiveColor = Color3.FromHexString('#0E8C7E')

  // A flat, unlit material that shows a texture with transparency (eyes, cheeks, glow).
  function decal(name, texture, extra = {}) {
    const m = new StandardMaterial(name, scene)
    m.diffuseTexture = texture
    m.useAlphaFromDiffuseTexture = true
    m.emissiveColor = Color3.White()
    m.disableLighting = true
    m.specularColor = Color3.Black()
    m.backFaceCulling = false
    Object.assign(m, extra)
    return m
  }
  function paintTexture(name, size, draw) {
    const t = new DynamicTexture(name, size, scene, true)
    draw(t.getContext())
    t.hasAlpha = true
    t.update()
    return t
  }

  // ---------- geometry helpers ----------
  // A "squircle": a sphere pushed towards a rounded box (n = 2 is a plain ellipsoid, higher = boxier).
  // The normals are computed from the formula so the shading stays smooth.
  function squircle(name, rx, ry, rz, n, seg = 64) {
    const m = CreateSphere(name, { diameter: 2, segments: seg, updatable: true }, scene)
    const p = m.getVerticesData(VertexBuffer.PositionKind)
    const nm = new Array(p.length)
    const e = 2 / n
    for (let i = 0; i < p.length; i += 3) {
      const sx = Math.sign(p[i]) * Math.abs(p[i]) ** e
      const sy = Math.sign(p[i + 1]) * Math.abs(p[i + 1]) ** e
      const sz = Math.sign(p[i + 2]) * Math.abs(p[i + 2]) ** e
      p[i] = sx * rx
      p[i + 1] = sy * ry
      p[i + 2] = sz * rz
      const gx = (Math.sign(sx) * Math.abs(sx) ** (n - 1)) / rx
      const gy = (Math.sign(sy) * Math.abs(sy) ** (n - 1)) / ry
      const gz = (Math.sign(sz) * Math.abs(sz) ** (n - 1)) / rz
      const l = Math.hypot(gx, gy, gz) || 1
      nm[i] = gx / l
      nm[i + 1] = gy / l
      nm[i + 2] = gz / l
    }
    m.setVerticesData(VertexBuffer.PositionKind, p, true)
    m.setVerticesData(VertexBuffer.NormalKind, nm, true)
    return m
  }
  function node(name, parent, x = 0, y = 0, z = 0) {
    const t = new TransformNode(name, scene)
    if (parent) t.parent = parent
    t.position.set(x, y, z)
    return t
  }
  function put(mesh, parent, x, y, z, mat) {
    mesh.parent = parent
    mesh.position.set(x, y, z)
    if (mat) mesh.material = mat
    mesh.isPickable = false
    return mesh
  }

  // ---------- the robot: faces -z (towards the camera), feet at y = 0 ----------
  const root = node('robot', null)
  const upper = node('upper', root) // torso, head and arms bob together
  put(squircle('torso', 0.56, 0.5, 0.47, 2.7), upper, 0, 1.56, 0, white)
  const ring = CreateTorus('ring', { diameter: 0.4, thickness: 0.075, tessellation: 48 }, scene)
  ring.rotation.x = Math.PI / 2
  put(ring, upper, 0, 1.56, -0.455, teal)
  const dot = CreateSphere('dot', { diameter: 0.15, segments: 20 }, scene)
  put(dot, upper, 0, 1.56, -0.47, glowMat)
  put(CreateCylinder('neck', { height: 0.22, diameter: 0.42, tessellation: 32 }, scene), upper, 0, 2.08, 0, tealDeep)

  const head = node('head', upper, 0, 2.12, 0)
  const HY = 0.72 // head centre above the neck
  put(squircle('headShell', 0.96, 0.74, 0.76, 3.1, 72), head, 0, HY, 0, white)
  put(squircle('faceplate', 0.78, 0.5, 0.14, 3.2, 56), head, 0, HY - 0.01, -0.66, screenMat)
  for (const s of [-1, 1]) {
    put(CreateCapsule('ear' + s, { radius: 0.17, height: 0.64, tessellation: 28, capSubdivisions: 8 }, scene), head, s * 1.0, HY - 0.04, 0.02, teal)
  }

  // eyes: one plane with two textures, happy arcs (resting) and open eyes (busy)
  const eyeTexture = (kind) =>
    paintTexture('eyes-' + kind, { width: 512, height: 256 }, (g) => {
      g.strokeStyle = '#8CF0E2'
      g.fillStyle = '#8CF0E2'
      g.lineCap = 'round'
      for (const cx of [140, 372]) {
        if (kind === 'happy') {
          g.lineWidth = 34
          g.beginPath()
          g.moveTo(cx - 54, 150)
          g.quadraticCurveTo(cx, 40, cx + 54, 150)
          g.stroke()
        } else {
          g.beginPath()
          g.ellipse(cx, 128, 38, 52, 0, 0, Math.PI * 2)
          g.fill()
          g.fillStyle = '#FFFFFF'
          g.beginPath()
          g.arc(cx + 12, 104, 12, 0, Math.PI * 2)
          g.fill()
          g.fillStyle = '#8CF0E2'
        }
      }
    })
  const texHappy = eyeTexture('happy')
  const texOpen = eyeTexture('open')
  const eyeMat = decal('eyeMat', texHappy)
  const eyes = CreatePlane('eyes', { width: 1.34, height: 0.67 }, scene)
  eyes.parent = head
  eyes.position.set(0, HY + 0.03, -0.815)
  eyes.material = eyeMat
  eyes.isPickable = false
  const eyeBase = eyes.position.clone()
  let eyesAreOpen = false

  // cheeks that glow when the robot is happy
  const cheekTex = paintTexture('cheek', { width: 128, height: 128 }, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    gr.addColorStop(0, 'rgba(140,240,226,0.95)')
    gr.addColorStop(1, 'rgba(140,240,226,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, 128, 128)
  })
  const cheekMat = decal('cheekMat', cheekTex, { alpha: 0 })
  for (const s of [-1, 1]) {
    const c = CreatePlane('cheek' + s, { width: 0.4, height: 0.24 }, scene)
    c.parent = head
    c.position.set(s * 0.6, HY - 0.2, -0.812)
    c.material = cheekMat
    c.isPickable = false
  }

  // antenna (on its own pivot so it can sway)
  const antenna = node('antenna', head, 0, HY + 0.7, 0)
  put(CreateCylinder('antRod', { height: 0.4, diameter: 0.07, tessellation: 16 }, scene), antenna, 0, 0.2, 0, grey)
  const antBall = CreateSphere('antBall', { diameter: 0.28, segments: 24 }, scene)
  put(antBall, antenna, 0, 0.45, 0, glowMat)

  // arms hang from shoulder pivots, legs from hip pivots
  function makeArm(side) {
    const piv = node('arm' + side, upper, side * 0.6, 1.84, 0)
    put(CreateCapsule('armCap' + side, { radius: 0.12, height: 0.86, tessellation: 24, capSubdivisions: 8 }, scene), piv, 0, -0.36, 0, white)
    put(CreateSphere('hand' + side, { diameter: 0.34, segments: 24 }, scene), piv, 0, -0.82, 0, teal)
    return piv
  }
  const armL = makeArm(-1)
  const armR = makeArm(1)
  function makeLeg(side) {
    const piv = node('leg' + side, root, side * 0.25, 1.0, 0)
    put(CreateCapsule('legCap' + side, { radius: 0.135, height: 0.9, tessellation: 24, capSubdivisions: 8 }, scene), piv, 0, -0.4, 0, white)
    put(squircle('foot' + side, 0.3, 0.18, 0.44, 2.5, 40), piv, 0, -0.82, -0.1, teal)
    return piv
  }
  const legL = makeLeg(-1)
  const legR = makeLeg(1)

  // soft glows behind the two lights (the page is light, so a translucent teal halo reads better than additive light)
  const haloTex = paintTexture('halo', { width: 128, height: 128 }, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    gr.addColorStop(0, 'rgba(20,184,166,0.60)')
    gr.addColorStop(0.4, 'rgba(20,184,166,0.20)')
    gr.addColorStop(1, 'rgba(20,184,166,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, 128, 128)
  })
  const haloMat = decal('haloMat', haloTex, { disableDepthWrite: true })
  const makeHalo = (size) => {
    const h = CreatePlane('halo', { size }, scene)
    h.material = haloMat
    h.isPickable = false
    return h
  }
  const haloAnt = makeHalo(1.0)
  const haloDot = makeHalo(0.6)
  const tmp = new Vector3()

  // ---------- public API ----------
  function setStage(W, H, px) {
    stage = { W, H, px }
    const hw = W / px / 2
    const hh = H / px / 2
    camera.position.set(hw, hh, -60)
    camera.setTarget(new Vector3(hw, hh, 0))
    camera.orthoLeft = -hw
    camera.orthoRight = hw
    camera.orthoTop = hh
    camera.orthoBottom = -hh
  }

  function setResolution(ratio) {
    engine.setHardwareScalingLevel(1 / ratio)
  }

  function render(o) {
    // placement and turn
    root.position.set(o.x / stage.px, (stage.H - o.y) / stage.px, 0)
    root.rotation.y = o.face

    // legs
    legL.rotation.x = o.legL
    legR.rotation.x = o.legR
    legL.position.y = 1.0 + o.legLiftL
    legR.position.y = 1.0 + o.legLiftR

    // body
    upper.position.y = o.bob
    upper.rotation.z = o.tiltZ
    upper.rotation.x = o.tiltX

    // arms
    armL.rotation.z = o.armZL
    armR.rotation.z = o.armZR
    armL.rotation.x = o.armXL
    armR.rotation.x = o.armXR

    // head, eyes, antenna
    head.rotation.y = o.headYaw
    head.rotation.x = o.headPitch
    head.rotation.z = o.headRoll
    eyes.position.x = eyeBase.x + o.eyeX * 0.09
    eyes.position.y = eyeBase.y - o.eyeY * 0.05
    eyes.scaling.y = o.blink
    if (o.eyesOpen !== eyesAreOpen) {
      eyesAreOpen = o.eyesOpen
      eyeMat.diffuseTexture = eyesAreOpen ? texOpen : texHappy
    }
    cheekMat.alpha = o.cheek
    antenna.rotation.z = o.antRoll
    antenna.rotation.x = o.antPitch

    // the chest light beats; the halos follow the two lights
    dot.scaling.setAll((1 + o.pulse * o.pulse * 0.25) * (o.happy ? 1.3 : 1))
    ring.scaling.setAll(1 + o.pulse * 0.04)
    antBall.computeWorldMatrix(true)
    dot.computeWorldMatrix(true)
    tmp.copyFrom(antBall.getAbsolutePosition())
    haloAnt.position.set(tmp.x, tmp.y, tmp.z + 0.25)
    haloAnt.scaling.setAll(1 + o.pulse * 0.25)
    tmp.copyFrom(dot.getAbsolutePosition())
    haloDot.position.set(tmp.x, tmp.y, tmp.z - 0.12)
    haloDot.scaling.setAll(0.9 + o.pulse * 0.4)

    engine.beginFrame()
    scene.render()
    engine.endFrame()
  }

  function dispose() {
    scene.dispose()
    engine.dispose()
  }

  setStage(1280, 800, 50)
  return { setStage, setResolution, render, dispose }
}
