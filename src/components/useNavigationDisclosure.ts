import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Non-modal navigation disclosure. CSS visibility removes closed mobile content
// from keyboard navigation; desktop navigation remains visible at its breakpoint.
export function useNavigationDisclosure({ focusOnOpen = false }: { focusOnOpen?: boolean } = {}) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (open && focusOnOpen) {
      const target = panel.current?.querySelector<HTMLButtonElement>('button:not([disabled])')
        || panel.current?.querySelector<HTMLAnchorElement>('a[href]')
      target?.focus()
    }
  }, [open, focusOnOpen])
  useEffect(() => {
    if (!open) return
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false)
    }
    function focus(event: FocusEvent) {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', key)
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', focus)
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', focus) }
  }, [open])
  return { open, setOpen, trigger, panel, close: () => { setOpen(false); trigger.current?.focus() } }
}
