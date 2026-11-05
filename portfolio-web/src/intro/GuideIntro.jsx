// <GuideIntro /> - the intro: a small AI robot walks around in front of a screen that shows your website.
// Click a topic or a logo and it is "typed" to the AI, the robot walks there, points, clicks and answers.
// "Open the website" (or a click on the screen) zooms into the site and calls onEnter().
//
//   <GuideIntro onEnter={() => setShowSite(true)} />
//
// Props (all optional)
//   contact     overrides for DEFAULT_CONTACT in config.js, e.g. { email: '...' }
//   screenSrc   image of your site shown on the little screen (default: assets/site-preview.webp)
//   screen      a React node to show on the screen instead of the image (e.g. your real <App/>, rendered at 1280x800)
//   onEnter     called when the zoom into the site has finished (unmount the intro here)
//   robot       'auto' (3D when WebGL works, flat otherwise), '3d' or '2d'
//
// How it fits together
//   timeline.js  the script: where the robot is and what it does at any moment (plain functions of time)
//   pose.js      turns that into a smooth body pose
//   Robot3D.js   draws the pose with Babylon.js (loaded lazily)   Robot2D.js  draws it with SVG (fallback)
//   This file    the page elements, and the Web Animations that play the typing, bubbles, cursor and zoom

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import css from './GuideIntro.css?inline' // the styles live inside a shadow root, see <GuideIntro> at the bottom
import { CHIP_ORDER, COMMANDS, COPY, DEFAULT_CONTACT, TILE_LABEL, TILE_ORDER, makeLayout } from './config.js'
import { PoseState } from './pose.js'
import { Timeline, handOffset } from './timeline.js'
import { createRobot2D } from './Robot2D.js'
import defaultScreen from './assets/site-preview.webp'
import logoEmail from './assets/logo-mail.png'
import logoPhone from './assets/logo-phone.png'
import logoLinkedin from './assets/logo-linkedin.png'
import logoGithub from './assets/logo-github.png'

const LOGOS = { email: logoEmail, phone: logoPhone, linkedin: logoLinkedin, github: logoGithub }
const TILE_DELAY = { email: 0, phone: 0.9, linkedin: 1.7, github: 0.4 } // so the logos do not float in step

// One clock for everything (seconds). Tests can freeze it through window.__GI_TEST__.
let frozenAt = null
const clock = () => (frozenAt != null ? frozenAt : performance.now() / 1000)

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

// What the answer card shows for each command.
function cardFor(key, contact, mobile) {
  const c = COMMANDS[key]
  if (key === 'site') return { title: c.title, val: c.val, href: null, copy: null, action: '' }
  if (key === 'email') return { title: c.title, val: contact.email, href: null, copy: contact.email, action: c.action }
  if (key === 'phone') return { title: c.title, val: contact.phone.text, href: null, copy: contact.phone.text, action: c.action }
  const item = contact[key]
  return { title: c.title, val: mobile && item.short ? item.short : item.text, href: item.href, copy: null, action: c.action }
}

// Puts text on the clipboard. The first way needs a secure page (https or localhost); the second is the old way.
function fallbackCopy(text) {
  const t = document.createElement('textarea')
  t.value = text
  t.setAttribute('readonly', '')
  t.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
  document.body.appendChild(t)
  t.select()
  let ok
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  t.remove()
  return ok
}

// How wide the typed word is after 0, 1, 2 ... letters, in the font of the bar. The typing animation uses these
// widths, so every letter appears whole, in any font.
let measureCtx = null
function prefixWidths(el, text) {
  measureCtx = measureCtx || document.createElement('canvas').getContext('2d')
  const cs = getComputedStyle(el)
  measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const out = []
  for (let i = 0; i <= text.length; i++) out.push(i === 0 ? 0 : Math.ceil(measureCtx.measureText(text.slice(0, i)).width) + 1)
  return out
}

function GuideIntroInner({ contact: contactProp, screenSrc = defaultScreen, screen = null, onEnter, robot = 'auto' }) {
  const contact = useMemo(() => ({ ...DEFAULT_CONTACT, ...contactProp }), [contactProp])
  const reduceMotion = useMemo(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // ---------- size: pick the layout and scale the stage to fit ----------
  const fitRef = useRef(null)
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useLayoutEffect(() => {
    const el = fitRef.current
    const measure = () => setView((v) => (v.w === el.clientWidth && v.h === el.clientHeight ? v : { w: el.clientWidth, h: el.clientHeight }))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const kind = view.w / view.h < 0.8 ? 'mobile' : 'desktop'
  const L = useMemo(() => makeLayout(kind), [kind])
  const S = Math.max(0.1, Math.min(view.w / L.W, view.h / L.H))
  const scaleRef = useRef(S)
  useLayoutEffect(() => {
    scaleRef.current = S
  }, [S])

  const tl = useMemo(() => new Timeline(L, { reduceMotion }), [L, reduceMotion])

  // ---------- state and handles ----------
  const [E] = useState(() => ({ tiles: {} })) // DOM elements by name (one object that lives as long as the component)
  const robotRef = useRef(null) // the active robot (3D or 2D)
  const pointerRef = useRef(null) // mouse position in stage pixels
  const animsRef = useRef([]) // running Web Animations, so they can be cancelled
  const timersRef = useRef([])
  const idRef = useRef(0)
  const onEnterRef = useRef(onEnter)
  useEffect(() => {
    onEnterRef.current = onEnter
  })
  const [pickedRun, setRun] = useState(null) // the command the visitor picked
  const [copiedId, setCopiedId] = useState(0) // id of the run whose Copy button was pressed (0 = none)
  const run = pickedRun && pickedRun.L === L ? pickedRun : null // a command from another layout is forgotten
  const [mode, setMode] = useState(() => (robot === '2d' ? '2d' : robot === '3d' || hasWebGL() ? '3d' : '2d'))
  const robotKey = mode + L.key
  const [readyFor, setReadyFor] = useState('') // which 3D robot has finished loading
  const ready = mode === '2d' || readyFor === robotKey // the robot is on screen

  const animate = (el, keyframes, options) => {
    const a = el.animate(keyframes, { fill: 'both', ...options })
    animsRef.current.push(a)
    return a
  }
  const cancelAll = () => {
    animsRef.current.forEach((a) => a.cancel())
    animsRef.current = []
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // ---------- the robot ----------
  useEffect(() => {
    let cancelled = false
    let ctl = null
    if (mode === '2d') {
      ctl = createRobot2D(E.botPos, L.px)
      robotRef.current = ctl
    } else {
      // The 3D code is a separate download, only fetched when it is needed.
      import('./Robot3D.js')
        .then(({ createRobot3D }) => {
          if (cancelled) return
          const r = createRobot3D(E.canvas)
          r.setStage(L.W, L.H, L.px)
          ctl = r
          robotRef.current = r
          setReadyFor(robotKey)
        })
        .catch((err) => {
          if (cancelled) return
          console.warn('3D robot could not start, using the flat one instead.', err)
          setMode('2d')
        })
    }
    return () => {
      cancelled = true
      robotRef.current = null
      ctl?.dispose()
    }
  }, [mode, L, E, robotKey])

  // keep the 3D picture sharp without drawing more pixels than needed
  useEffect(() => {
    if (mode === '3d' && ready) robotRef.current?.setResolution?.(Math.min(S * Math.min(2, window.devicePixelRatio || 1), 1.25))
  }, [S, ready, mode])

  // ---------- the frame loop: timeline -> pose -> robot ----------
  useEffect(() => {
    const pose = new PoseState(L.px)
    let raf = 0
    let last = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const t = clock()
      const dt = last ? Math.min(0.05, Math.max(0.001, t - last)) : 0.016
      last = t
      const o = pose.step(tl.cues(t), dt, pointerRef.current)
      robotRef.current?.render(o)
      const move = `translate(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px)`
      E.botPos.style.transform = move // speech bubbles (and the flat robot)
      E.shPos.style.transform = move // shadow under the feet
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [tl, L, E])

  // the robot looks at the mouse
  useEffect(() => {
    const onMove = (e) => {
      const r = E.stage.getBoundingClientRect()
      pointerRef.current = [(e.clientX - r.left) / scaleRef.current, (e.clientY - r.top) / scaleRef.current]
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [E])

  // the page behind should not scroll while the intro is open
  useEffect(() => {
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = old
    }
  }, [])

  // ---------- greeting: starts when the robot appears ----------
  useEffect(() => {
    if (!ready) return
    tl.reset(clock())
    const a = animate(
      E.sayG,
      [
        { opacity: 0, transform: 'translate(-50%,6px) scale(.92)', offset: 0 },
        { opacity: 1, transform: 'translate(-50%,0) scale(1)', offset: 0.06 },
        { opacity: 1, transform: 'translate(-50%,0) scale(1)', offset: 0.92 },
        { opacity: 0, transform: 'translate(-50%,0) scale(1)', offset: 1 },
      ],
      { duration: 9000, delay: 600, easing: 'ease' },
    )
    return () => a.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tl])

  // ---------- a command: type it, send it, walk, point, click, answer ----------
  const start = useCallback(
    (key) => {
      const r = tl.start(key, clock())
      if (r) setRun({ ...r, id: ++idRef.current, L })
    },
    [tl, L],
  )

  useLayoutEffect(() => {
    if (!run) return
    const { P, key, L: RL } = run
    const ms = (s) => Math.max(0, Math.round(s * 1000))
    const at = (p, s = 1) => `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) scale(${s})`
    cancelAll()

    // 1) the word is typed into the (read-only) bar and sent
    const widths = prefixWidths(E.ty, COMMANDS[key].text)
    animate(
      E.ty,
      widths.map((w, i) => ({ width: w + 'px', offset: i / (widths.length - 1), easing: 'steps(1, end)' })),
      { duration: ms(P.ty), easing: 'linear' },
    )
    animate(
      E.ty,
      [
        { visibility: 'visible', opacity: 1, offset: 0 },
        { visibility: 'visible', opacity: 1, offset: P.send / (P.send + 0.15) },
        { visibility: 'hidden', opacity: 0, offset: 1 },
      ],
      { duration: ms(P.send + 0.15) },
    )
    animate(E.ph, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: ms(P.send + 0.2), easing: 'ease' }) // after the typed word is gone
    animate(E.snd, [{ transform: 'scale(1)' }, { transform: 'scale(.82)', background: '#0F766E', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 500, delay: ms(P.send), easing: 'ease' })
    animate(E.um, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 350, delay: ms(P.send), easing: 'ease' })

    // 2) what the robot says, before and after
    const say = (el, duration, delay) =>
      animate(
        el,
        [
          { opacity: 0, transform: 'translate(-50%,6px) scale(.92)', offset: 0 },
          { opacity: 1, transform: 'translate(-50%,0) scale(1)', offset: 0.1 },
          { opacity: 1, transform: 'translate(-50%,0) scale(1)', offset: 0.9 },
          { opacity: 0, transform: 'translate(-50%,0) scale(1)', offset: 1 },
        ],
        { duration: ms(duration), delay: ms(delay), easing: 'ease' },
      )
    say(E.say1, P.arr + 0.4 - (P.send + 0.1), P.send + 0.1)
    say(E.say2, 3.6, P.click + 0.2)

    // 3) the cursor leaves the robot's hand, glides to the target and clicks
    const c = RL.cmd[key]
    const hand = handOffset(run.side, RL.px)
    const h0 = [c.stand[0] + hand[0], c.stand[1] + hand[1]]
    const pt = c.point
    animate(
      E.cur,
      [
        { opacity: 0, transform: at(h0), offset: 0, easing: 'ease-in-out' },
        { opacity: 1, transform: at(h0), offset: 0.1, easing: 'ease-in-out' },
        { opacity: 1, transform: at(pt), offset: 0.38 },
        { opacity: 1, transform: at(pt, 0.8), offset: 0.44 },
        { opacity: 1, transform: at(pt), offset: 0.52 },
        { opacity: 1, transform: at(pt), offset: 0.78 },
        { opacity: 0, transform: at(pt), offset: 1 },
      ],
      { duration: 1300, delay: ms(P.arr + 0.15) },
    )
    animate(E.rip, [{ opacity: 0.7, transform: at(pt, 0.3) }, { opacity: 0, transform: at(pt, 2.6) }], { duration: 750, delay: ms(P.click), easing: 'ease-out' })

    // 4) the topic buttons are locked while the robot works
    animate(
      E.chips,
      [
        { opacity: 0.45, pointerEvents: 'none', offset: 0 },
        { opacity: 0.45, pointerEvents: 'none', offset: 0.999 },
        { opacity: 1, pointerEvents: 'auto', offset: 1 },
      ],
      { duration: ms(P.total), easing: 'linear' },
    )
    animate(E.am, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 350, delay: ms(P.click + 0.1), easing: 'ease' })

    if (key === 'site') {
      // 5a) the stage fades out while the screen grows to fill the window
      for (const layer of [E.restL, E.botL, E.chatL]) {
        animate(layer, [{ opacity: 1, visibility: 'visible' }, { opacity: 0, visibility: 'hidden' }], { duration: 500, delay: ms(P.click + 0.45), easing: 'ease' })
      }
      const sc = RL.screen
      const end = RL.siteEnd
      animate(
        E.site,
        [
          { transform: `translate(${sc.x}px,${sc.y}px) scale(${sc.s})`, borderRadius: '0 0 12px 12px' },
          { transform: `translate(${end.x}px,${end.y}px) scale(${end.s})`, borderRadius: '0px' },
        ],
        { duration: 1300, delay: ms(P.click + 0.5), easing: 'cubic-bezier(.6,0,.2,1)' },
      )
      timersRef.current.push(setTimeout(() => onEnterRef.current?.(), ms(P.total)))
    } else {
      // 5b) the link in the answer card becomes clickable when it has appeared, and the logo lights up
      animate(E.rb, [{ pointerEvents: 'none', offset: 0 }, { pointerEvents: 'none', offset: 0.999 }, { pointerEvents: 'auto', offset: 1 }], { duration: 10, delay: ms(P.click + 0.45), easing: 'linear' })
      animate(
        E.tiles[key],
        [
          { color: '#111111', borderColor: '#E0DED7', boxShadow: '0 12px 26px rgba(60,50,35,.10)', transform: 'translateY(0)' },
          { color: '#0F766E', borderColor: '#0F766E', boxShadow: '0 0 0 4px rgba(15,118,110,.18),0 16px 30px rgba(15,118,110,.22)', transform: 'translateY(-5px)' },
        ],
        { duration: 300, delay: ms(P.click), easing: 'ease' },
      )
    }
    return () => cancelAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  // A tiny hook so automated tests can freeze the clock and look at exact moments. Does nothing unless
  // window.__GI_TEST__ exists, so it is safe to leave in.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.__GI_TEST__) return
    window.__GI_TEST__.api = {
      seek(t) {
        frozenAt = (tl.run ? tl.run.t0 : tl.t0) + t
        animsRef.current.forEach((a) => {
          a.pause()
          a.currentTime = t * 1000
        })
      },
      live() {
        frozenAt = null
        animsRef.current.forEach((a) => a.play())
      },
      info: () => ({ S: scaleRef.current, kind: L.key, mode, ready, run: tl.run && { key: tl.run.key, P: tl.run.P }, pos: tl.pos(clock()) }),
    }
  }, [tl, L, mode, ready])

  // ---------- what gets drawn ----------
  const cmd = run ? COMMANDS[run.key] : null
  const card = run ? cardFor(run.key, contact, L.mobile) : null
  const q = L.px / 50
  const fr = L.frame
  const sc = L.screen
  const tile = L.tile
  const midX = fr.x + fr.w / 2
  const cardLink = card && card.href
  const copied = !!run && copiedId === run.id
  const copyNow = () => {
    const text = card && card.copy
    if (!text || !run) return
    const id = run.id
    const done = () => {
      setCopiedId(id)
      timersRef.current.push(setTimeout(() => setCopiedId(0), 1800))
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text) && done())
    } else if (fallbackCopy(text)) {
      done()
    }
  }
  const reg = (name) => (n) => {
    E[name] = n
  }

  return (
    <div className="gi-root" role="region" aria-label="Introduction">
      <div className="gi-fit" ref={fitRef}>
        <div className="gi-stage" ref={reg('stage')} style={{ width: L.W, height: L.H, transform: `translate(-50%,-50%) scale(${S.toFixed(4)})` }}>
          {/* ---- the backdrop: name, floor, monitor and the four logos ---- */}
          <div className="gi-layer" ref={reg('restL')}>
            <div className="gi-abs" style={{ left: L.head.x, top: L.head.y }}>
              <div className="gi-name" style={{ fontSize: L.head.title }}>{contact.name}</div>
              <div className="gi-tag" style={{ fontSize: L.head.tag }}>{contact.tagline}</div>
            </div>
            <div className="gi-abs gi-glow" style={{ left: 0, top: L.floor.glow[0], width: L.W, height: L.floor.glow[1] }} />
            <div className="gi-abs gi-dots" style={{ left: 0, top: L.floor.dots[0], width: L.W, height: L.floor.dots[1] }} />
            <div className="gi-frame" style={{ left: fr.x, top: fr.y, width: fr.w, height: fr.h, borderRadius: fr.radius }}>
              <div className="gi-bar" style={{ height: fr.bar }}>
                <i />
                <i />
                <i />
                <span />
              </div>
            </div>
            {L.stand && (
              <>
                <div className="gi-abs gi-neck" style={{ left: midX - 17, top: fr.y + fr.h, width: 34, height: 30 }} />
                <div className="gi-abs gi-base" style={{ left: midX - 65, top: fr.y + fr.h + 28, width: 130, height: 10 }} />
                <div className="gi-abs gi-soft" style={{ left: midX - 80, top: fr.y + fr.h + 34, width: 160, height: 14 }} />
              </>
            )}
            {TILE_ORDER.map((k) => (
              <div key={k}>
                <div className="gi-abs gi-soft" style={{ left: tile.cx[k] - tile.shadowW / 2, top: tile.shadowY, width: tile.shadowW, height: 12, opacity: 0.9 }} />
                <div className="gi-tilebox" style={{ left: tile.cx[k] - tile.size / 2, top: tile.y, width: tile.size, height: tile.size, animationDelay: TILE_DELAY[k] + 's' }}>
                  <div className="gi-tl" ref={(n) => {
                      E.tiles[k] = n
                    }} style={{ borderRadius: tile.radius }}>
                    <img src={LOGOS[k]} width={tile.img} height={tile.img} alt="" draggable={false} />
                    <div className="gi-tlab" style={{ fontSize: tile.label }}>{TILE_LABEL[k]}</div>
                  </div>
                  <button type="button" className="gi-tbtn" data-cmd={k} aria-label={TILE_LABEL[k]} style={{ borderRadius: tile.radius + 2 }} onClick={() => start(k)} />
                </div>
              </div>
            ))}
          </div>

          {/* ---- the screen that shows the website ---- */}
          <div className="gi-site" ref={reg('site')} style={{ transform: `translate(${sc.x}px,${sc.y}px) scale(${sc.s})`, borderRadius: '0 0 12px 12px' }}>
            {screen ?? <img className="gi-siteimg" src={screenSrc} alt="Preview of the website" draggable={false} />}
          </div>
          <button type="button" className="gi-sitehit" data-cmd="site" aria-label="Open the website" style={{ left: sc.x, top: sc.y, width: sc.w, height: sc.h }} onClick={() => start('site')} />

          {/* ---- the robot, its shadow, its speech bubbles and the cursor ---- */}
          <div className="gi-layer gi-none" ref={reg('botL')} style={{ zIndex: 3 }}>
            <div className="gi-pos" ref={reg('shPos')}>
              <div className="gi-bsh" style={{ left: -46 * q, top: -8 * q, width: 92 * q, height: 16 * q }} />
            </div>
            {mode === '3d' && <canvas key={L.key} ref={reg('canvas')} className={'gi-canvas' + (ready ? ' gi-on' : '')} style={{ width: L.W, height: L.H }} aria-hidden="true" />}
            <div className="gi-pos" ref={reg('botPos')} style={{ zIndex: 2 }}>
              {[
                ['sayG', COPY.greeting],
                ['say1', cmd ? cmd.say1 : ''],
                ['say2', cmd ? cmd.say2 : ''],
              ].map(([name, text]) => (
                <div key={name} className={'gi-say' + (L.say.wrap ? ' gi-wrap' : '')} ref={reg(name)} style={{ bottom: L.bubbleBottom, fontSize: L.say.fs, width: L.say.wrap || undefined }}>
                  {text}
                </div>
              ))}
            </div>
            <svg className="gi-cur" ref={reg('cur')} viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d="M4 2l15 9-6.4 1.6L9.6 19z" fill="#111111" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <div className="gi-rip" ref={reg('rip')} />
          </div>

          {/* ---- the chat: a read-only bar, the answer, and the topic buttons ---- */}
          <div className="gi-layer gi-none" ref={reg('chatL')} style={{ zIndex: 4 }}>
            <div className={'gi-chat' + (L.chat.row ? ' gi-row' : '')} style={{ left: L.chat.x, top: L.chat.row ? L.chat.top + L.chat.am : L.chat.top, width: L.chat.w }}>
              <div className="gi-um" ref={reg('um')} style={{ fontSize: L.user.fs }}>{cmd ? cmd.text : ''}</div>
              <div className="gi-am" ref={reg('am')} aria-live="polite" style={{ fontSize: L.card.fs, top: L.chat.row ? undefined : L.chat.am }}>
                <span className="gi-av" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: L.card.title, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5F6368' }}>{card ? card.title : ''}</div>
                  <div style={{ fontWeight: 600, color: '#111111', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card ? card.val : ''}</div>
                </div>
                {card && card.copy ? (
                  <button type="button" className="gi-rb gi-copy" ref={reg('rb')} onClick={copyNow} style={{ fontSize: L.card.btn }}>
                    {copied ? COPY.copied : card.action}
                  </button>
                ) : (
                  <a
                    className="gi-rb"
                    ref={reg('rb')}
                    href={cardLink || undefined}
                    target={cardLink && cardLink.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{ display: cardLink ? undefined : 'none', fontSize: L.card.btn }}
                  >
                    {card ? card.action : ''}
                  </a>
                )}
              </div>
            </div>
            <div className="gi-chips" ref={reg('chips')} style={{ left: L.chat.x, width: L.chat.w, top: L.chips.top, fontSize: L.chips.fs }}>
              {L.chips.label && <span className="gi-chiplabel">{COPY.choose}</span>}
              {CHIP_ORDER.map((k) => (
                <button key={k} type="button" className={'gi-chip' + (k === 'site' ? ' gi-primary' : '')} data-cmd={k} onClick={() => start(k)}>
                  {COMMANDS[k].text}
                </button>
              ))}
            </div>
            <div className="gi-input" aria-hidden="true" style={{ left: L.input.x, top: L.input.top, width: L.input.w, height: L.input.h }}>
              <svg viewBox="0 0 24 24" width="20" height="20" style={{ position: 'absolute', left: 18, top: (L.input.h - 20) / 2 }} fill="none" stroke="#0F766E" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
              </svg>
              <span className="gi-ph" ref={reg('ph')} style={{ left: L.input.left, height: L.input.h - 2, fontSize: L.input.fs }}>
                {L.mobile ? COPY.placeholderMobile : COPY.placeholder}
              </span>
              <span className="gi-ty" ref={reg('ty')} style={{ left: L.input.left, top: (L.input.h - 2 - 24) / 2, height: 24, lineHeight: '24px', fontSize: L.input.fs }}>
                {cmd ? cmd.text : ''}
              </span>
              <span className="gi-snd" ref={reg('snd')} style={{ top: (L.input.h - 2 - 34) / 2 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// The intro lives in a shadow root: your site's CSS (a global `text-align: center`, `p { ... }`, `button { ... }`)
// cannot reach in, and the intro's CSS cannot leak out. It still looks the same in any project.
export default function GuideIntro(props) {
  const [shadow, setShadow] = useState(null)
  const hostRef = useCallback((host) => {
    setShadow(host ? host.shadowRoot || host.attachShadow({ mode: 'open' }) : null)
  }, [])
  return (
    <div data-guide-intro="" ref={hostRef} style={{ all: 'initial', display: 'block' }}>
      {shadow &&
        createPortal(
          <>
            <style>{css}</style>
            <GuideIntroInner {...props} />
          </>,
          shadow,
        )}
    </div>
  )
}
