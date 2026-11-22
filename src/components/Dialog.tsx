import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'
import { Button } from './UI'

export function Dialog({ open, title, description, children, actions, onClose, dismissible = true, initialFocusRef }: { open: boolean; title: string; description?: string; children?: ReactNode; actions?: ReactNode; onClose: () => void; dismissible?: boolean; initialFocusRef?: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId(), descriptionId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    ;(initialFocusRef?.current || dialog.querySelector<HTMLElement>('[data-dialog-initial]') || dialog).focus()
    const bodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = bodyOverflow
      if (previous?.isConnected) previous.focus()
    }
  }, [open, initialFocusRef])
  return <dialog ref={ref} className="ui-dialog" tabIndex={-1} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} onCancel={event => { event.preventDefault(); if (dismissible) onClose() }} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const dialog = ref.current
    if (!dialog) return
    const controls = [...dialog.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]')].filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden')
    const first = controls[0], last = controls[controls.length - 1]
    if (!first) { event.preventDefault(); dialog.focus(); return }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus() }
  }}>
    <header><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</header>
    {children && <div className="ui-dialog-body">{children}</div>}
    <footer className="ui-dialog-actions">{actions || <Button variant="secondary" onClick={onClose} data-dialog-initial>بستن</Button>}</footer>
  </dialog>
}

export function ConfirmationDialog({ open, title, description, confirmLabel, onConfirm, onClose, busy = false, destructive = false }: { open: boolean; title: string; description: string; confirmLabel: string; onConfirm: () => void; onClose: () => void; busy?: boolean; destructive?: boolean }) {
  return <Dialog open={open} title={title} description={description} onClose={onClose} dismissible={!busy} actions={<><Button variant="secondary" disabled={busy} onClick={onClose} data-dialog-initial>انصراف</Button><Button variant={destructive ? 'destructive' : 'primary'} loading={busy} onClick={onConfirm}>{confirmLabel}</Button></>}/>
}
