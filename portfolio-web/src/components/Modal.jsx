import { useEffect } from "react"
import "./Modal.css"

// Et pop up-vindue ovenpå siden. Indholdet sendes ind som children.
function Modal({ label, onClose, children }) {
  // Lukker vinduet med Escape og låser siden bagved, så længe vinduet er åbent
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  )
}

export default Modal
