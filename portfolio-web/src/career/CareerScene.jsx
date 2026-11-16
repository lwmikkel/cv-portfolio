import { useEffect, useRef, useState } from 'react'
import './CareerScene.css'
import CareerFallback from './CareerFallback.jsx'

export default function CareerScene({ variant }) {
  const host = useRef(null)
  const canvas = useRef(null)
  const [ready, setReady] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    let controller = null
    let loading = false
    let cancelled = false
    let visible = false
    let failed = false
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setActive(visible && !document.hidden)
      controller?.setReducedMotion(motion.matches)
      controller?.setActive(visible && !document.hidden)
    }
    const load = async () => {
      if (loading || controller || cancelled || failed) return
      loading = true
      try {
        const { createCareerScene } = await import('./createCareerScene.js')
        if (cancelled) return
        controller = createCareerScene(canvas.current, variant)
        sync()
        setReady(true)
      } catch (error) {
        if (!cancelled) {
          failed = true
          setFallback(true)
          console.info('Using the SVG career illustration because WebGL is unavailable.', error.message)
        }
      } finally {
        loading = false
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) load()
      sync()
    }, { rootMargin: '80px', threshold: 0 })
    observer.observe(host.current)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    return () => {
      cancelled = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
      controller?.dispose()
    }
  }, [variant])

  return (
    <div ref={host} className={'career-scene' + (ready ? ' is-ready' : '') + (active ? ' is-active' : '')} data-scene={variant} aria-hidden="true">
      {fallback ? <CareerFallback variant={variant} /> : <canvas ref={canvas} tabIndex={-1} />}
    </div>
  )
}
