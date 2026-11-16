import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function InvoicePreview({ invoice, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialogRef}
      className="invoice-preview"
      aria-labelledby="invoice-preview-title"
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="invoice-preview-content">
        <header className="invoice-preview-header">
          <div>
            <h2 id="invoice-preview-title">Invoice {invoice.id}</h2>
            <p>Fictional invoice made by AI</p>
          </div>
          <button type="button" className="invoice-preview-close" onClick={onClose} autoFocus>Close ×</button>
        </header>
        <div className="invoice-preview-paper">
          <img src={invoice.image} alt={`Enlarged rendering of ${invoice.file}`} width="640" height={invoice.id === '005' ? 693 : 476} />
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
