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

import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Camera } from '@babylonjs/core/Cameras/camera'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { createRobotRig } from '../robot/createRobotRig.js'

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

  const rig = createRobotRig(scene)

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
    rig.root.position.set(o.x / stage.px, (stage.H - o.y) / stage.px, 0)
    rig.root.rotation.y = o.face

    rig.applyPose(o)

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
