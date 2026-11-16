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
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder'
import { CreateTube } from '@babylonjs/core/Meshes/Builders/tubeBuilder'
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { createRobotRig } from '../robot/createRobotRig.js'

const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n))
const TAU = Math.PI * 2

// One decorative diorama per card. No textures/models are downloaded: even the
// screens and the robot are built here. Time only advances while a card is visible.
export function createCareerScene(canvas, kind) {
  const engine = new Engine(canvas, true, {
    alpha: true, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power',
  }, false)
  let scene
  let resizeObserver
  try {
    scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0)
    scene.skipPointerMovePicking = true
    const camera = new FreeCamera('career-camera', new Vector3(4, 4.4, -12), scene)
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA
    camera.minZ = 0.1
    camera.setTarget(new Vector3(0, kind === 'flagman' ? 1.9 : 1.45, 0))
    const hemi = new HemisphericLight('soft-fill', new Vector3(0, 1, -0.3), scene)
    hemi.intensity = 1.05
    hemi.groundColor = Color3.FromHexString('#B5C2BC')
    const key = new DirectionalLight('warm-key', new Vector3(0.7, -1.8, 0.8), scene)
    key.intensity = 1.3
    key.diffuse = Color3.FromHexString('#FFF6E8')
    const rim = new DirectionalLight('cool-rim', new Vector3(-1, -0.5, -1), scene)
    rim.intensity = 0.55
    rim.diffuse = Color3.FromHexString('#D6FFF8')

    const { update } = buildCareerDiorama(scene, kind)

    let active = false
    let reduced = false
    let raf = 0
    let previous = 0
    let time = 0
    let disposed = false
    function render() {
      update(time)
      engine.beginFrame()
      scene.render()
      engine.endFrame()
    }
    function frame(now) {
      raf = 0
      if (!active || reduced || disposed) return
      if (!previous || now - previous >= 1000 / 30) {
        time += previous ? Math.min((now - previous) / 1000, 0.1) : 1 / 30
        previous = now
        render()
      }
      raf = requestAnimationFrame(frame)
    }
    function schedule() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      previous = 0
      if (active && !disposed) {
        if (reduced) render()
        else raf = requestAnimationFrame(frame)
      }
    }
    function resize() {
      if (disposed) return
      engine.setHardwareScalingLevel(1 / Math.min(1.5, window.devicePixelRatio || 1))
      engine.resize()
      const aspect = Math.max(0.5, canvas.clientWidth / Math.max(1, canvas.clientHeight))
      const halfWidth = kind === 'flagman' ? 3.7 : 3.1
      const halfHeight = Math.max(kind === 'flagman' ? 2.30 : 1.90, halfWidth / aspect)
      camera.orthoTop = halfHeight
      camera.orthoBottom = -halfHeight
      camera.orthoLeft = -halfHeight * aspect
      camera.orthoRight = halfHeight * aspect
      render()
    }
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()
    return {
      setActive(value) { active = value; schedule() },
      setReducedMotion(value) { reduced = value; schedule() },
      dispose() {
        disposed = true
        active = false
        if (raf) cancelAnimationFrame(raf)
        resizeObserver.disconnect()
        scene.dispose()
        engine.dispose()
      },
    }
  } catch (error) {
    resizeObserver?.disconnect()
    scene?.dispose()
    engine.dispose()
    throw error
  }
}

// Kept independent of the browser lifecycle so the real Babylon geometry can
// also be validated with NullEngine, without requiring a GPU.
export function buildCareerDiorama(scene, kind) {
  const palette = {}
  function material(name, hex, roughness = 0.42) {
    const m = new PBRMaterial(name, scene)
    m.albedoColor = Color3.FromHexString(hex)
    m.roughness = roughness
    m.metallic = 0
    m.emissiveColor = m.albedoColor.scale(0.08)
    palette[name] = m
    return m
  }
  material('ivory', '#F8FAF8')
  material('teal', '#277C73')
  material('dark', '#243A3B')
  material('metal', '#BBCBC7', 0.3)
  material('belt', '#344A49')
  material('gold', '#E7B44C')
  material('orange', '#CE8463')
  material('violet', '#8D80AA')
  material('wood', '#C19D74')
  material('red', '#BD514B')

  function node(name, parent = null, x = 0, y = 0, z = 0) {
    const n = new TransformNode(name, scene)
    n.parent = parent
    n.position.set(x, y, z)
    return n
  }
  function place(mesh, parent, x, y, z, mat = 'ivory') {
    mesh.parent = parent
    mesh.position.set(x, y, z)
    mesh.material = typeof mat === 'string' ? palette[mat] : mat
    mesh.isPickable = false
    return mesh
  }
  const box = (name, w, h, d, x, y, z, mat = 'ivory', parent = null) =>
    place(CreateBox(name, { width: w, height: h, depth: d }, scene), parent, x, y, z, mat)
  const cylinder = (name, radius, height, x, y, z, mat = 'metal', parent = null) =>
    place(CreateCylinder(name, { diameter: radius * 2, height, tessellation: 20 }, scene), parent, x, y, z, mat)
  const ball = (name, size, x, y, z, mat, parent = null) =>
    place(CreateSphere(name, { diameter: size, segments: 16 }, scene), parent, x, y, z, mat)

  function alignRod(mesh, a, b) {
    const d = b.subtract(a)
    const len = d.length()
    mesh.position.copyFrom(a).addInPlace(b).scaleInPlace(0.5)
    mesh.scaling.y = len
    const direction = d.scale(1 / (len || 1))
    let axis = Vector3.Cross(Vector3.Up(), direction)
    if (axis.lengthSquared() < 0.000001) axis = Vector3.Right()
    mesh.rotationQuaternion = Quaternion.RotationAxis(axis.normalize(), Math.acos(clamp(direction.y, -1, 1)))
  }
  function rod(name, a, b, radius = 0.025, mat = 'metal', parent = null) {
    const mesh = cylinder(name, radius, 1, 0, 0, 0, mat, parent)
    alignRod(mesh, new Vector3(...a), new Vector3(...b))
    return mesh
  }
  function textureMaterial(name, width, height, draw) {
    const texture = new DynamicTexture(name, { width, height }, scene, false)
    const m = new StandardMaterial(name + '-material', scene)
    m.diffuseTexture = texture
    m.emissiveColor = Color3.White()
    m.disableLighting = true
    m.specularColor = Color3.Black()
    if (draw) {
      draw(texture.getContext())
      texture.update()
    }
    return { texture, material: m }
  }
  function display(name, width, height, x, y, z, mat, parent = null) {
    return place(CreatePlane(name, { width, height }, scene), parent, x, y, z, mat)
  }

  // A translucent contact shadow grounds each scene without an expensive shadow map.
  const shadow = textureMaterial('contact-shadow', 128, 128, (g) => {
    const fade = g.createRadialGradient(64, 64, 4, 64, 64, 64)
    fade.addColorStop(0, 'rgba(31,67,57,.20)')
    fade.addColorStop(1, 'rgba(31,67,57,0)')
    g.fillStyle = fade
    g.fillRect(0, 0, 128, 128)
  })
  shadow.texture.hasAlpha = true
  shadow.material.useAlphaFromDiffuseTexture = true
  shadow.material.disableDepthWrite = true
  const floor = display('ground-shadow', 6.4, 3.0, 0, 0.015, 0, shadow.material)
  floor.rotation.x = Math.PI / 2

  function robot(x, z, scale = 0.63, facing = -0.12) {
    const r = createRobotRig(scene, { detail: 0.55 })
    r.root.position.set(x, 0, z)
    r.root.scaling.setAll(scale)
    r.root.rotation.y = facing
    return r
  }
  function pose(r, t, extra = {}) {
    const blinkPhase = (t + 1.1) % 4.6
    const blink = blinkPhase < 0.16 ? 1 - Math.sin(blinkPhase / 0.16 * Math.PI) * 0.92 : 1
    r.applyPose({
      legL: 0, legR: 0, legLiftL: 0, legLiftR: 0,
      bob: Math.sin(t * 2) * 0.018, tiltZ: 0, tiltX: 0,
      armZL: -0.08, armZR: 0.08, armXL: 0, armXR: 0,
      headYaw: Math.sin(t * 0.8) * 0.07, headPitch: 0, headRoll: Math.sin(t) * 0.025,
      eyeX: 0, eyeY: 0, blink, eyesOpen: true, cheek: 0.35,
      antRoll: Math.sin(t * 2) * 0.1, antPitch: 0,
      pulse: Math.max(0, Math.sin(t * 2.4)), happy: false,
      ...extra,
    })
  }
  function chair(x, z, scale = 1, facing = 0) {
    const p = node('chair', null, x, 0, z)
    p.scaling.setAll(scale)
    p.rotation.y = facing
    box('seat', 0.95, 0.12, 0.95, 0, 0.62, 0, 'teal', p)
    box('chair-back', 0.95, 0.82, 0.12, 0, 1.09, 0.42, 'teal', p)
    cylinder('chair-stem', 0.07, 0.52, 0, 0.30, 0, 'metal', p)
    box('chair-base', 0.85, 0.08, 0.12, 0, 0.08, 0, 'dark', p)
    box('chair-base-cross', 0.12, 0.08, 0.85, 0, 0.08, 0, 'dark', p)
  }
  function desk(x = 0, z = -0.25, width = 3.25) {
    box('desktop', width, 0.13, 1.35, x, 0.99, z, 'ivory')
    box('desk-edge', width, 0.035, 1.36, x, 0.94, z, 'metal')
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cylinder('desk-leg', 0.045, 0.9, x + sx * (width / 2 - 0.15), 0.46, z + sz * 0.51)
    }
  }
  function monitor(x, z, mode) {
    const p = node('monitor', null, x, 1.63, z)
    p.rotation.y = -0.3
    box('monitor-frame', 1.45, 0.96, 0.1, 0, 0, 0, 'dark', p)
    box('monitor-neck', 0.12, 0.22, 0.09, 0, -0.57, 0.04, 'metal', p)
    box('monitor-foot', 0.65, 0.04, 0.35, 0, -0.67, -0.02, 'metal', p)
    const screen = textureMaterial('screen-' + mode, 512, 320)
    display('monitor-glass', 1.32, 0.82, 0, 0, -0.056, screen.material, p)
    let previous = -1
    return (t) => {
      // Only redraw screen textures at 8 Hz; mesh animation stays at 30 fps.
      const tick = Math.floor(t * 8)
      if (tick === previous) return
      previous = tick
      const g = screen.texture.getContext()
      g.fillStyle = '#173333'
      g.fillRect(0, 0, 512, 320)
      g.fillStyle = '#224744'
      g.fillRect(0, 0, 512, 35)
      for (let i = 0; i < 3; i++) {
        g.fillStyle = ['#D9977F', '#E6C677', '#81CBB5'][i]
        g.beginPath(); g.arc(23 + i * 19, 18, 5, 0, TAU); g.fill()
      }
      if (mode === 'support') {
        g.fillStyle = '#C3EFE4'; g.font = 'bold 23px sans-serif'; g.fillText('SUPPORT', 32, 77)
        g.fillStyle = '#7EBBAA'; g.font = '16px sans-serif'; g.fillText('Connected', 52, 108)
        g.fillStyle = '#8EE7C7'; g.beginPath(); g.arc(37, 103, 5, 0, TAU); g.fill()
        for (let i = 0; i < 22; i++) {
          const h = 12 + Math.abs(Math.sin(t * 3.2 + i * 0.65)) * 64
          g.fillStyle = i % 3 ? '#7DC7B4' : '#C5F0DE'
          g.fillRect(32 + i * 20, 195 - h / 2, 8, h)
        }
        g.fillStyle = '#39675E'; g.fillRect(32, 265, 300, 6); g.fillRect(32, 282, 190, 6)
      } else {
        const lines = ['const project = {', '  name: "next-idea",', '  status: "building"', '};', '', 'await project.run();']
        const count = Math.floor((t * 13) % 110)
        let used = 0
        g.font = '21px monospace'
        lines.forEach((line, i) => {
          const shown = line.slice(0, Math.max(0, count - used))
          g.fillStyle = ['#A9D5F2', '#ACDDC0', '#E9CA91', '#A9D5F2', '#7E9E98', '#C7ABDF'][i]
          g.fillText(shown, 30, 83 + i * 35)
          if (count >= used && count <= used + line.length) {
            g.fillStyle = '#D1F1E4'; g.fillRect(30 + g.measureText(shown).width, 65 + i * 35, 3, 23)
          }
          used += line.length + 1
        })
      }
      screen.texture.update()
    }
  }
  function keyboard(x, z) {
    box('keyboard', 0.98, 0.05, 0.36, x, 1.08, z, 'dark')
    for (let row = 0; row < 3; row++) for (let col = 0; col < 9; col++) {
      box('key', 0.065, 0.015, 0.065, x - 0.38 + col * 0.095, 1.112, z - 0.1 + row * 0.1, 'metal')
    }
  }
  function headset(r) {
    const points = Array.from({ length: 25 }, (_, i) => {
      const a = i / 24 * Math.PI
      return new Vector3(Math.cos(a) * 1.09, 0.72 + Math.sin(a) * 0.88, 0.08)
    })
    place(CreateTube('headset-band', { path: points, radius: 0.065, tessellation: 10 }, scene), r.head, 0, 0, 0, 'dark')
    for (const side of [-1, 1]) {
      const cup = cylinder('headset-earcup', 0.27, 0.18, side * 1.08, 0.68, 0.02, 'dark', r.head)
      cup.rotation.z = Math.PI / 2
    }
    const boom = [new Vector3(-1.13, 0.56, 0), new Vector3(-1.15, 0.27, -0.5), new Vector3(-0.55, 0.28, -0.94)]
    place(CreateTube('microphone-boom', { path: boom, radius: 0.037, tessellation: 8 }, scene), r.head, 0, 0, 0, 'dark')
    ball('microphone', 0.16, -0.55, 0.28, -0.94, 'dark', r.head)
  }

  let update
  if (kind === 'support' || kind === 'coding') {
    desk()
    chair(0.60, 0.48)
    const r = robot(0.60, 0.48)
    const drawScreen = monitor(-0.69, -0.36, kind)
    keyboard(0.45, -0.62)
    const mug = cylinder('cup', 0.12, 0.25, 1.27, 1.19, -0.32, 'teal')
    mug.rotation.z = -0.04
    if (kind === 'support') {
      headset(r)
      box('phone-base', 0.35, 0.06, 0.30, -1.24, 1.09, -0.64, 'dark')
      box('phone-handset', 0.38, 0.07, 0.09, -1.24, 1.15, -0.61, 'teal')
    }
    update = (t) => {
      pose(r, t, {
        legL: 1.27, legR: 1.27,
        armXL: -1.4 + Math.sin(t * 7) * 0.06,
        armXR: kind === 'support' ? -0.35 : -1.4 + Math.sin(t * 7 + Math.PI) * 0.06,
        armZR: kind === 'support' ? 2.58 + Math.sin(t) * 0.035 : 0.12,
        headYaw: -0.14 + Math.sin(t * 0.9) * 0.08,
        headPitch: 0.04 + Math.sin(t * (kind === 'support' ? 3 : 1.2)) * 0.035,
        eyeX: -0.35, happy: kind === 'support',
      })
      drawScreen(t)
    }
  } else if (kind === 'baggage') {
    const r = robot(0.05, 0.85, 0.61)
    box('conveyor-frame', 5.0, 0.18, 1.10, 0, 0.79, -0.28, 'metal')
    box('conveyor-belt', 4.85, 0.10, 0.95, 0, 0.91, -0.28, 'belt')
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cylinder('conveyor-leg', 0.07, 0.70, sx * 2.05, 0.38, -0.28 + sz * 0.42)
    }
    const treads = Array.from({ length: 17 }, () => box('belt-tread', 0.024, 0.014, 0.90, 0, 0.969, -0.28, 'metal'))
    const cases = ['teal', 'orange', 'violet'].map((mat, i) => {
      const p = node('suitcase-' + i)
      const h = [0.70, 0.57, 0.81][i]
      box('suitcase', 0.58, h, 0.36, 0, h / 2 + 0.10, 0, mat, p)
      box('case-band', 0.07, h + 0.01, 0.37, 0.12, h / 2 + 0.10, 0, 'metal', p)
      rod('handle-left', [-0.13, h + 0.10, 0], [-0.13, h + 0.25, 0], 0.022, 'dark', p)
      rod('handle-right', [0.13, h + 0.10, 0], [0.13, h + 0.25, 0], 0.022, 'dark', p)
      rod('handle', [-0.13, h + 0.25, 0], [0.13, h + 0.25, 0], 0.026, 'dark', p)
      box('luggage-tag', 0.10, 0.19, 0.015, -0.12, h * 0.65, -0.19, 'ivory', p)
      for (const side of [-1, 1]) ball('wheel', 0.12, side * 0.20, 0.08, 0, 'dark', p)
      return p
    })
    update = (t) => {
      pose(r, t, { armXL: -0.6, armXR: -0.8, armZR: 0.35 + Math.sin(t * 1.5) * 0.17, headYaw: Math.sin(t * 0.7) * 0.22, eyeX: Math.sin(t * 0.7) * 0.5 })
      treads.forEach((mesh, i) => { mesh.position.x = ((i * 0.29 + t * 0.58) % 4.85) - 2.425 })
      cases.forEach((p, i) => {
        const x = ((t * 0.58 + i * 1.73 + 0.45) % 5.2) - 2.6
        p.position.set(x, 0.98, -0.28)
        p.scaling.setAll(clamp((2.6 - Math.abs(x)) / 0.32))
        p.rotation.y = Math.sin(t * 0.7 + i) * 0.035
      })
    }
  } else if (kind === 'flagman') {
    const flagman = robot(0.12, -0.44, 0.54)
    // Vest and hard hat sit on the same animated body/head pivots as the intro model.
    box('safety-vest', 1.02, 0.54, 0.07, 0, 1.55, -0.46, 'gold', flagman.upper)
    for (const side of [-1, 1]) box('reflective-stripe', 0.10, 0.56, 0.012, side * 0.29, 1.55, -0.505, 'ivory', flagman.upper)
    cylinder('hardhat-brim', 1.04, 0.09, 0, 1.32, 0, 'gold', flagman.head)
    const hat = ball('hardhat', 1.82, 0, 1.28, 0, 'gold', flagman.head)
    hat.scaling.y = 0.36
    const sign = node('stop-paddle')
    cylinder('paddle-stick', 0.025, 0.48, 0, -0.28, 0, 'wood', sign)
    const octagon = place(CreateCylinder('stop-octagon', { diameter: 0.50, height: 0.045, tessellation: 8 }, scene), sign, 0, 0, 0, 'red')
    octagon.rotation.x = Math.PI / 2
    const stop = textureMaterial('stop-text', 128, 128, (g) => {
      g.fillStyle = '#BD514B'; g.fillRect(0, 0, 128, 128)
      g.strokeStyle = '#FFF9EF'; g.lineWidth = 4; g.strokeRect(7, 7, 114, 114)
      g.fillStyle = '#FFF9EF'; g.font = 'bold 36px sans-serif'; g.textAlign = 'center'; g.fillText('STOP', 64, 78)
    })
    display('stop-label', 0.36, 0.27, 0, 0, -0.025, stop.material, sign)

    const crane = node('crane', null, -1.65, 0, 0.75)
    box('crane-base', 0.95, 0.15, 0.80, 0, 0.075, 0, 'metal', crane)
    for (const x of [-0.18, 0.18]) for (const z of [-0.18, 0.18]) {
      rod('tower-post', [x, 0.15, z], [x, 3.45, z], 0.035, 'gold', crane)
    }
    for (let i = 0; i < 6; i++) {
      const y = 0.15 + i * 0.55
      for (const z of [-0.18, 0.18]) {
        rod('tower-brace', [-0.18, y, z], [0.18, y + 0.55, z], 0.018, 'gold', crane)
        rod('tower-rung', [-0.18, y, z], [0.18, y, z], 0.018, 'gold', crane)
      }
    }
    const jib = node('crane-jib', crane, 0, 3.48, 0)
    box('jib-beam', 3.70, 0.13, 0.26, 0.75, 0, 0, 'gold', jib)
    for (let i = 0; i < 10; i++) rod('jib-brace', [-1.05 + i * 0.37, 0.07, 0], [-0.68 + i * 0.37, 0.32, 0], 0.018, 'gold', jib)
    rod('jib-top', [-1.05, 0.32, 0], [2.6, 0.32, 0], 0.025, 'gold', jib)
    box('counterweight', 0.45, 0.40, 0.42, -0.84, -0.2, 0, 'metal', jib)
    box('operator-cabin', 0.48, 0.43, 0.48, 0.08, -0.28, -0.04, 'teal', jib)
    box('cabin-window', 0.34, 0.23, 0.015, 0.08, -0.25, -0.29, 'dark', jib)
    const rope = rod('lifting-cable', [0, 0, 0], [0, 1, 0], 0.015, 'dark')
    const load = box('suspended-load', 0.58, 0.50, 0.53, -0.1, 0.60, 0.75, 'wood')
    const hook = ball('crane-hook', 0.13, 0, 0, 0, 'dark')
    for (const z of [-0.82, 0.15]) {
      const cone = place(CreateCylinder('safety-cone', { diameterBottom: 0.23, diameterTop: 0.045, height: 0.38, tessellation: 16 }, scene), null, 1.22, 0.19, z, 'orange')
      box('cone-foot', 0.30, 0.035, 0.30, cone.position.x, 0.025, z, 'dark')
    }
    const workers = [robot(2.04, 0.10, 0.42, 0.75), robot(2.74, 0.58, 0.39, 0.75)]
    update = (t) => {
      const lift = (1 - Math.cos(t * 0.65)) * 0.38
      pose(flagman, t, { armZR: 2.0, armXR: -0.08, headYaw: -0.22, eyesOpen: true })
      flagman.handR.computeWorldMatrix(true)
      const hand = flagman.handR.getAbsolutePosition()
      sign.position.set(hand.x, hand.y + 0.32, hand.z - 0.10)
      load.position.y = 0.66 + lift
      hook.position.set(-0.1, load.position.y + 0.40, 0.75)
      alignRod(rope, new Vector3(-0.1, 3.48, 0.75), hook.position)
      workers.forEach((r, i) => {
        const phase = (t + i * 0.65) % 10
        const approach = phase < 2 ? Math.cos(phase / 2 * Math.PI) * 0.5 + 0.5 : phase > 8 ? (1 - Math.cos((phase - 8) / 2 * Math.PI)) * 0.5 : 0
        r.root.position.x = 2.04 + i * 0.70 + approach * 0.36
        const stride = (phase < 2 || phase > 8) ? Math.sin(t * 7) * 0.22 : 0
        pose(r, t + i, { legL: stride, legR: -stride, headYaw: 0.15, armXL: -stride, armXR: stride })
      })
    }
  } else if (kind === 'classroom') {
    const board = textureMaterial('blackboard', 768, 448, (g) => {
      g.fillStyle = '#254B43'; g.fillRect(0, 0, 768, 448)
      g.fillStyle = '#E5F1DD'; g.font = '32px sans-serif'; g.fillText('Matematik', 38, 60)
      g.font = '26px monospace'; g.fillText('f(x) = x²', 40, 120)
      g.strokeStyle = '#A7C8B7'; g.lineWidth = 2
      g.beginPath(); g.moveTo(245, 355); g.lineTo(700, 355); g.moveTo(445, 390); g.lineTo(445, 155); g.stroke()
      g.strokeStyle = '#E8CE89'; g.lineWidth = 4; g.beginPath()
      for (let i = -1; i <= 1.001; i += 0.025) {
        const x = 445 + i * 195, y = 355 - i * i * 170
        if (i === -1) g.moveTo(x, y); else g.lineTo(x, y)
      }
      g.stroke()
      g.fillStyle = '#A7C8B7'; g.font = '19px sans-serif'; g.fillText('x', 702, 382); g.fillText('y', 420, 164)
    })
    box('board-frame', 3.62, 2.10, 0.14, -0.24, 2.36, 0.99, 'wood')
    display('board', 3.43, 1.91, -0.24, 2.36, 0.91, board.material)
    box('chalk-tray', 3.62, 0.07, 0.21, -0.24, 1.29, 0.88, 'wood')
    for (const x of [-1.52, 1.03]) cylinder('board-stand', 0.035, 1.30, x, 0.65, 1.0, 'metal')
    const teacher = robot(2.05, 0.24, 0.56)
    const student = robot(-1.32, -0.92, 0.49, -2.60)
    chair(-1.32, -0.92, 0.78, -2.60)
    const studentDesk = node('student-desk', null, -1.12, 0, -0.25)
    box('school-desktop', 1.30, 0.11, 0.72, 0, 0.86, 0, 'ivory', studentDesk)
    for (const x of [-0.51, 0.51]) for (const z of [-0.23, 0.23]) cylinder('school-desk-leg', 0.035, 0.80, x, 0.42, z, 'metal', studentDesk)
    box('notebook', 0.44, 0.025, 0.40, 0, 0.93, -0.03, 'teal', studentDesk)
    const pointer = rod('teaching-pointer', [0, 0, 0], [0, 1, 0], 0.021, 'wood')
    update = (t) => {
      pose(teacher, t, { armZL: -2.08 + Math.sin(t * 0.7) * 0.06, armXL: -0.20, headYaw: Math.sin(t * 0.65) * 0.16, happy: true })
      pose(student, t + 0.5, { legL: 1.28, legR: 1.28, armXL: -1.2, armXR: -1.2, headPitch: -0.10 + Math.sin(t * 0.8) * 0.04 })
      teacher.handL.computeWorldMatrix(true)
      alignRod(pointer, teacher.handL.getAbsolutePosition(), new Vector3(0.35 + Math.sin(t * 0.65) * 0.45, 2.35 + Math.sin(t * 0.8) * 0.17, 0.84))
    }
  } else {
    throw new Error('Unknown career scene: ' + kind)
  }

  return { update }
}
