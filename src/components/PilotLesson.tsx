import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { StudyNote } from '../services/cent'
import './pilot-lesson.css'
import { prepareLesson, type LessonAsset } from './lesson-content'
import { cent } from '../services/cent'
import { EducationalImageDialog } from './EducationalImageDialog'

type Anchor = { kind: 'html'; block: string; quote: string; x: number; y: number; revision?: string }
function parseAnchor(value?: string | null): Anchor | null { try { const a = JSON.parse(value || 'null'); return a?.kind === 'html' && typeof a.block === 'string' && Number.isFinite(a.y) ? a : null } catch { return null } }
function resolveBlock(article: HTMLElement, a: Anchor | null) {
  const blocks = [...article.querySelectorAll<HTMLElement>('[data-block]')]
  return a && (blocks.find(b => b.dataset.block === a.block && (!a.quote || b.dataset.anchorQuote === a.quote)) || (a.quote && blocks.filter(b => b.dataset.anchorQuote === a.quote).length === 1 ? blocks.find(b => b.dataset.anchorQuote === a.quote) : null))
}
const emptyAssets: LessonAsset[] = []

type Position = { id: string; top: number; fallback: boolean }
export function PilotLesson({ html, sectionId, revision, notes, watermark, placeNote, selectNote, selectedId, draftAnchor, assets = emptyAssets, documentId, reattaching, startReattach }: { assets?: LessonAsset[]; documentId?: string; reattaching?: boolean; startReattach?: () => void; selectedId?: string; draftAnchor?: string | null; revision?: string; html: string; sectionId: string; notes: StudyNote[]; watermark: string; placeNote: (value: string, y: number) => void; selectNote: (note: StudyNote) => void }) {
  const content = useMemo(() => prepareLesson(html, sectionId, assets), [html, sectionId, assets])
  const root = useRef<HTMLElement>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [assetError, setAssetError] = useState('')
  const [assetRetry, setAssetRetry] = useState(0)
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  useEffect(() => {
    if (!documentId || !assets.length) return
    const controller = new AbortController(), urls: string[] = [], queued = new Set<Element>(), queue: HTMLImageElement[] = []
    let active = 0
    const pump = () => {
      while (!controller.signal.aborted && active < 3 && queue.length) {
        const image = queue.shift()!; active++
        cent.asset(documentId, sectionId, image.dataset.asset!, controller.signal).then(blob => {
          if (controller.signal.aborted) return
          const expected = assets.find(a => a.id === image.dataset.asset)?.mime
          if (blob.type !== expected) throw new Error('Educational image media type mismatch.')
          const url = URL.createObjectURL(blob); urls.push(url); image.src = url
        }).catch(error => { if (!controller.signal.aborted) setAssetError(error instanceof Error ? error.message : 'Educational image unavailable.') })
          .finally(() => { active--; pump() })
      }
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting && !queued.has(entry.target)) { queued.add(entry.target); queue.push(entry.target as HTMLImageElement) }
      pump()
    }, { rootMargin: '600px' })
    root.current!.querySelectorAll<HTMLImageElement>('img[data-asset]').forEach(image => observer.observe(image))
    return () => { controller.abort(); observer.disconnect(); urls.forEach(url => URL.revokeObjectURL(url)) }
  }, [documentId, sectionId, assets, content, assetRetry])
  const selected = notes.find(n => n.id === selectedId)
  const selectedAnchor = parseAnchor(draftAnchor ?? selected?.anchorJson)
  const unresolved = !!selected && positions.some(p => p.id === selected.id && p.fallback)
  const revisionChanged = !!selectedAnchor?.revision && selectedAnchor.revision !== revision
  useLayoutEffect(() => {
    const article = root.current!
    const a = parseAnchor(draftAnchor ?? notes.find(n => n.id === selectedId)?.anchorJson)
    const block = resolveBlock(article, a)
    article.querySelectorAll('.pilot-anchor-selected').forEach(b => b.classList.remove('pilot-anchor-selected'))
    block?.classList.add('pilot-anchor-selected')
    for (let p = block?.parentElement; p && p !== article; p = p.parentElement) if (p instanceof HTMLDetailsElement) p.open = true
    if (selectedId) block?.scrollIntoView({ block: window.matchMedia('(max-width:760px)').matches ? 'start' : 'center', behavior: 'instant' })
  }, [selectedId, notes, content, draftAnchor])
  useLayoutEffect(() => {
    const article = root.current!
    let active = true
    const update = () => {
      if (!active) return
      const bounds = article.getBoundingClientRect()
      setPositions(notes.map(note => {
        const a = parseAnchor(note.anchorJson)
        const block = resolveBlock(article, a)
        let visible = block
        for (let parent = block?.parentElement; parent && parent !== article; parent = parent.parentElement) {
          if (parent instanceof HTMLDetailsElement && !parent.open) visible = parent.querySelector<HTMLElement>('summary') || visible
        }
        const rect = visible?.getBoundingClientRect()
        return { id: note.id, top: rect && a ? rect.top - bounds.top + rect.height * Math.max(0, Math.min(1, a.y)) : bounds.height * note.anchorY, fallback: !block }
      }))
    }
    const observer = new ResizeObserver(update); observer.observe(article)
    article.addEventListener('toggle', update, true); update()
    document.fonts.ready.then(update)
    return () => { active = false; observer.disconnect(); article.removeEventListener('toggle', update, true) }
  }, [notes, content])
  // Nearby anchors share a margin control; the selected anchor controls its exact vertical position.
  const groups: Position[][] = []
  for (const item of [...positions].sort((a,b) => a.top - b.top)) {
    const last = groups.at(-1)
    if (last && item.top - last.at(-1)!.top < 48) last.push(item)
    else groups.push([item])
  }
  return <article ref={root} className="pilot-lesson" dir="rtl" lang="fa" onKeyDown={event => {
    if (!reattaching && (event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLImageElement && event.target.dataset.asset && event.target.src.startsWith('blob:')) {
      event.preventDefault(); setEnlarged({ src: event.target.src, alt: event.target.alt })
    }
  }} onClick={event => {
    if (!reattaching && event.target instanceof HTMLImageElement && event.target.dataset.asset && event.target.src.startsWith('blob:')) {
      setEnlarged({ src: event.target.src, alt: event.target.alt }); return
    }
    if ((event.target as Element).closest('button,summary,a') || window.getSelection()?.toString()) return
    const block = (event.target as Element).closest<HTMLElement>('[data-block]')
    if (!block) return
    const rect = block.getBoundingClientRect(); const bounds = event.currentTarget.getBoundingClientRect()
    const a: Anchor = { kind: 'html', block: block.dataset.block!, quote: block.dataset.anchorQuote || '', revision, x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) }
    placeNote(JSON.stringify(a), Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)))
  }}>
    <div className="pilot-imprint"><span>{'\u0645\u0637\u0627\u0644\u0639\u0647 \u0648 \u062a\u0645\u0631\u06cc\u0646'}</span><small>{watermark}</small></div>
    {reattaching && <p className="pilot-anchor-status" role="status">{'\u0645\u062d\u0644 \u062a\u0627\u0632\u0647 \u0631\u0627 \u0631\u0648\u06cc \u0645\u062a\u0646 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f.'}</p>}
    {unresolved && <p className="pilot-anchor-status" role="status">{'\u0645\u062d\u0644 \u062a\u0642\u0631\u06cc\u0628\u06cc \u06cc\u0627\u062f\u062f\u0627\u0634\u062a \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f.'}</p>}
    {selected && !reattaching && startReattach && <button className="button button-secondary button-small" onClick={event => { event.stopPropagation(); startReattach() }}>{'\u0627\u062a\u0635\u0627\u0644 \u062f\u0648\u0628\u0627\u0631\u0647 \u0628\u0647 \u0645\u062a\u0646'}</button>}
    {revisionChanged && <p className="pilot-anchor-status" role="status">{'\u0646\u0633\u062e\u0647 \u062f\u0631\u0633 \u062a\u063a\u06cc\u06cc\u0631 \u06a9\u0631\u062f\u0647 \u0627\u0633\u062a\u061b \u0645\u062d\u0644 \u06cc\u0627\u062f\u062f\u0627\u0634\u062a \u0631\u0627 \u0628\u0631\u0631\u0633\u06cc \u06a9\u0646\u06cc\u062f.'}</p>}
    <div className="pilot-content" dangerouslySetInnerHTML={{ __html: content }}/>
    {enlarged && <EducationalImageDialog image={enlarged} watermark={watermark} close={() => setEnlarged(null)}/>}
    {assetError && <div className="pilot-anchor-status" role="alert">{assetError} <button className="button button-secondary button-small" onClick={event => { event.stopPropagation(); setAssetError(''); setAssetRetry(n => n + 1) }}>{'\u062a\u0644\u0627\u0634 \u062f\u0648\u0628\u0627\u0631\u0647'}</button></div>}
    {groups.map(group => {
      const item = group.find(p => p.id === selectedId) || group[0]
      const note = notes.find(n => n.id === item.id)!
      const number = notes.indexOf(note) + 1
      return <button key={group[0].id} data-note-id={item.id} data-anchor-top={item.top} data-fallback={item.fallback} className="pilot-pin" style={{ top: item.top }} aria-pressed={selectedId === item.id} aria-label={`${'\u06cc\u0627\u062f\u062f\u0627\u0634\u062a'} ${number}${group.length > 1 ? ` (+${group.length - 1})` : ''}`} title={item.fallback ? 'Approximate location: original anchor unavailable' : group.length > 1 ? 'Nearby notes: select from the notes panel' : 'Open note'} onClick={event => { event.stopPropagation();
        const block = resolveBlock(root.current!, parseAnchor(note.anchorJson))
        for (let parent = block?.parentElement; parent && parent !== root.current; parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true
        selectNote(note) }}>{number}{group.length > 1 && <sup>+{group.length - 1}</sup>}</button>
    })}
  </article>
}

