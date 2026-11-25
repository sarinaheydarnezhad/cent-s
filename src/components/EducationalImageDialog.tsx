import { useEffect, useRef, useState } from 'react'

export function EducationalImageDialog({ image, watermark, close }: { image: { src: string; alt: string }; watermark: string; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    const previous = document.activeElement
    dialog.current?.showModal()
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus() }
  }, [])
  return <dialog ref={dialog} className="lesson-image-dialog" aria-label="نمای بزرگ تصویر آموزشی" onCancel={close} onClick={e => e.stopPropagation()}>
    <div className="lesson-image-toolbar">
      <button autoFocus className="button button-secondary" onClick={close}>بستن تصویر</button>
      <button className="button button-secondary" aria-label="کوچک کردن تصویر" disabled={zoom <= 1} onClick={() => setZoom(v => Math.max(1, v - .5))}>−</button>
      <output aria-live="polite">{Math.round(zoom * 100)}%</output>
      <button className="button button-secondary" aria-label="بزرگ کردن تصویر" disabled={zoom >= 5} onClick={() => setZoom(v => Math.min(5, v + .5))}>+</button>
      <button className="button button-secondary" onClick={() => setZoom(1)}>اندازهٔ اصلی</button>
    </div>
    <div className="lesson-image-viewport"><img src={image.src} alt={image.alt} draggable={false} style={{ width: `${zoom * 100}%`, maxWidth: 'none' }}/></div>
    <p>{image.alt}</p><small dir="ltr">{watermark}</small>
  </dialog>
}
