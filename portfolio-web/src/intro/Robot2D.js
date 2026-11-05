// The flat (SVG) version of the robot. It is only used when the browser cannot show WebGL, so the
// intro still works everywhere. It is driven by the same pose as the 3D robot (see pose.js).
//
//   const robot = createRobot2D(parentElement, px)   // the parent is moved to the robot's feet by GuideIntro
//   robot.render(pose)
//   robot.dispose()

const RAD = 180 / Math.PI

const SVG = `
<defs>
  <linearGradient id="gi-bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4E7E5"/></linearGradient>
  <linearGradient id="gi-bt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B9A89"/><stop offset="1" stop-color="#0C5F58"/></linearGradient>
</defs>
<g data-p="legL" style="transform-origin:48px 124px"><rect x="41" y="120" width="14" height="30" rx="7" fill="url(#gi-bw)" stroke="#CDD2CF"/><rect x="35" y="146" width="27" height="14" rx="7" fill="url(#gi-bt)"/></g>
<g data-p="legR" style="transform-origin:72px 124px"><rect x="65" y="120" width="14" height="30" rx="7" fill="url(#gi-bw)" stroke="#CDD2CF"/><rect x="58" y="146" width="27" height="14" rx="7" fill="url(#gi-bt)"/></g>
<g data-p="body">
  <g data-p="armL" style="transform-origin:36px 96px"><rect x="25" y="91" width="13" height="36" rx="6.5" fill="url(#gi-bw)" stroke="#CDD2CF"/><circle cx="31.5" cy="130" r="7.5" fill="url(#gi-bt)"/></g>
  <g data-p="armR" style="transform-origin:84px 96px"><rect x="82" y="91" width="13" height="36" rx="6.5" fill="url(#gi-bw)" stroke="#CDD2CF"/><circle cx="88.5" cy="130" r="7.5" fill="url(#gi-bt)"/></g>
  <rect x="32" y="82" width="56" height="48" rx="22" fill="url(#gi-bw)" stroke="#CDD2CF"/>
  <circle cx="60" cy="106" r="8" fill="#FFFFFF" stroke="#0F766E" stroke-width="3"/>
  <circle data-p="dot" cx="60" cy="106" r="2.6" fill="#0F766E" style="transform-origin:60px 106px"/>
  <g data-p="head" style="transform-origin:60px 78px">
    <rect x="9" y="36" width="14" height="27" rx="7" fill="url(#gi-bt)"/><rect x="97" y="36" width="14" height="27" rx="7" fill="url(#gi-bt)"/>
    <rect x="20" y="14" width="80" height="64" rx="29" fill="url(#gi-bw)" stroke="#CDD2CF"/>
    <rect x="29" y="26" width="62" height="40" rx="19" fill="#12171A"/>
    <g data-p="eyes" style="transform-origin:60px 47px">
      <g data-p="eyeHappy"><path d="M41 49 q6.5 -10 13 0" stroke="#8CF0E2" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M66 49 q6.5 -10 13 0" stroke="#8CF0E2" stroke-width="4.2" fill="none" stroke-linecap="round"/></g>
      <g data-p="eyeOpen" style="display:none"><ellipse cx="47.5" cy="47" rx="4.2" ry="6" fill="#8CF0E2"/><ellipse cx="72.5" cy="47" rx="4.2" ry="6" fill="#8CF0E2"/><circle cx="49" cy="44.5" r="1.4" fill="#FFFFFF"/><circle cx="74" cy="44.5" r="1.4" fill="#FFFFFF"/></g>
    </g>
    <g data-p="cheeks" style="opacity:0"><ellipse cx="38" cy="58" rx="5" ry="3" fill="#8CF0E2" opacity=".55"/><ellipse cx="82" cy="58" rx="5" ry="3" fill="#8CF0E2" opacity=".55"/></g>
    <g data-p="ant" style="transform-origin:60px 14px"><rect x="58" y="3" width="4" height="13" rx="2" fill="#C5CAC7"/><circle cx="60" cy="4" r="4.5" fill="#0F766E"/></g>
  </g>
</g>`

export function createRobot2D(parent, px) {
  const q = px / 50 // the SVG is drawn for the desktop size and scaled for the phone layout
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 120 170')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.style.cssText = `position:absolute;left:${-75 * q}px;top:${-200 * q}px;width:${150 * q}px;height:${212.5 * q}px;overflow:visible;pointer-events:none`
  svg.innerHTML = SVG
  parent.insertBefore(svg, parent.firstChild)
  const P = {}
  svg.querySelectorAll('[data-p]').forEach((n) => {
    P[n.dataset.p] = n
  })
  let eyesAreOpen = false

  function render(o) {
    P.legL.style.transform = `rotate(${(o.legL * RAD * 0.6).toFixed(1)}deg)`
    P.legR.style.transform = `rotate(${(o.legR * RAD * 0.6).toFixed(1)}deg)`
    P.body.style.transform = `translateY(${(-o.bob * 40).toFixed(1)}px)`
    P.armL.style.transform = `rotate(${(-o.armZL * RAD + o.swingL * 40).toFixed(1)}deg)`
    P.armR.style.transform = `rotate(${(-o.armZR * RAD + o.swingR * 40).toFixed(1)}deg)`
    P.head.style.transform = `translateX(${(o.headYaw * 6).toFixed(1)}px) rotate(${(o.headRoll * RAD).toFixed(1)}deg)`
    P.eyes.style.transform = `translate(${(o.eyeX * 2).toFixed(1)}px,${(o.eyeY * 1).toFixed(1)}px) scaleY(${o.blink.toFixed(2)})`
    if (o.eyesOpen !== eyesAreOpen) {
      eyesAreOpen = o.eyesOpen
      P.eyeHappy.style.display = eyesAreOpen ? 'none' : ''
      P.eyeOpen.style.display = eyesAreOpen ? '' : 'none'
    }
    P.cheeks.style.opacity = o.cheek.toFixed(2)
    P.ant.style.transform = `rotate(${(o.antRoll * RAD).toFixed(1)}deg)`
    P.dot.style.transform = `scale(${((1 + o.pulse * o.pulse * 0.25) * (o.happy ? 1.3 : 1)).toFixed(2)})`
  }

  return { render, dispose: () => svg.remove() }
}
