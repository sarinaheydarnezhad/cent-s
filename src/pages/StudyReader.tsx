import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { cent, type StudyNote, type SourceSection } from '../services/cent'
import { useAppState } from '../state/AppState'
import { useRemote } from '../components/CentUI'
import { ReaderExperience } from '../components/ReaderExperience'

export function StudyReader() {
  const { id = '' } = useParams()
  return <Reader key={id} id={id}/>
}
function Reader({ id }: { id: string }) {
  const fetcher = useCallback(() => cent.document(id), [id])
  const remote = useRemote(fetcher)
  const { user } = useAppState()
  const [params] = useSearchParams()
  const [sourceSections, setSourceSections] = useState<SourceSection[]>([])
  const [page, setPage] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [editing, setEditing] = useState<StudyNote | null>(null)
  const [draft, setDraft] = useState('')
  const [anchorY, setAnchorY] = useState(0.15)
  const [saveState, setSaveState] = useState('')
  const [saving, setSaving] = useState(false)
  const [pageBusy, setPageBusy] = useState(false)
  const [pageError, setPageError] = useState('')
  const [retryPage, setRetryPage] = useState(0)
  const [notesOpen, setNotesOpen] = useState(true)
  const [hidden, setHidden] = useState(document.hidden)
  const canvas = useRef<HTMLCanvasElement>(null)
  const newNoteId = useRef<string>(crypto.randomUUID())
  const pageStage = useRef<HTMLDivElement>(null)
  const draftKey = `cent:draft:${user?.id}:${id}:${page}`
  const dirty = draft.trim().length > 0 && draft !== editing?.body

  useEffect(() => {
    if (!remote.data) return
    const data = remote.data
    let active = true
    const requested = Number(params.get('page'))
    void Promise.resolve().then(() => { if (!active) return
      setPage(Number.isInteger(requested) && requested >= 1 && requested <= data.document.pageCount ? requested : data.progress?.lastPage || 1)
      setNotes(data.notes)
    })
    return () => { active = false }
  }, [remote.data, params])

  useEffect(() => {
    if (!page) return
    let active = true
    void Promise.resolve().then(() => { if (!active) return
      newNoteId.current = crypto.randomUUID()
      setEditing(null); setAnchorY(0.15); setSaveState('')
      try { setDraft(localStorage.getItem(draftKey) || '') } catch { setDraft('') }
    })
    return () => { active = false }
  }, [draftKey, page])

  useEffect(() => {
    const handle = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    const visibility = () => setHidden(document.hidden)
    window.addEventListener('beforeunload', handle); document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('beforeunload', handle); document.removeEventListener('visibilitychange', visibility) }
  }, [dirty])

  const watermark = remote.data?.watermark
  const sourceId = remote.data?.document.sourceId
  useEffect(() => {
    if (!sourceId) return
    let disposed = false
    void Promise.resolve().then(async () => {
      if (disposed) return
      setPageBusy(true); setPageError('')
      try { const rows = await cent.sourceSections(id); if (!disposed) setSourceSections(rows) }
      catch (e) { if (!disposed) setPageError(e instanceof Error ? e.message : 'درس بارگذاری نشد.') }
      finally { if (!disposed) setPageBusy(false) }
    })
    return () => { disposed = true }
  }, [id, sourceId, retryPage])
  useEffect(() => {
    if (!page || !watermark || sourceId) return
    const controller = new AbortController()
    let url: string | undefined
    let disposed = false
    void Promise.resolve().then(() => { if (!disposed) { setPageBusy(true); setPageError('') } })
    const surface = canvas.current
    if (surface) { const ctx = surface.getContext('2d'); ctx?.clearRect(0, 0, surface.width, surface.height) }
    cent.page(id, page, controller.signal).then(blob => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image(); url = URL.createObjectURL(blob)
      image.onload = () => resolve(image); image.onerror = () => reject(new Error('تصویر صفحه قابل نمایش نیست.')); image.src = url
    })).then(image => {
      if (disposed || !surface) return
      const ctx = surface.getContext('2d')!
      surface.width = image.naturalWidth; surface.height = image.naturalHeight
      ctx.drawImage(image, 0, 0)
      ctx.save(); ctx.globalAlpha = 0.17; ctx.fillStyle = '#294251'
      ctx.font = `${Math.max(15, surface.width / 48)}px sans-serif`; ctx.textAlign = 'center'
      for (let y = 120; y < surface.height; y += Math.max(240, surface.height / 4)) {
        for (let x = surface.width / 4; x < surface.width; x += surface.width / 2) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 8); ctx.fillText(watermark, 0, 0); ctx.restore()
        }
      }
      ctx.restore()
    }).catch(e => { if (!disposed && !controller.signal.aborted) setPageError(e instanceof Error ? e.message : 'صفحه بارگذاری نشد.') })
      .finally(() => { if (url) URL.revokeObjectURL(url); if (!disposed) setPageBusy(false) })
    return () => { disposed = true; controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [id, page, watermark, retryPage, sourceId])

  useEffect(() => {
    if (!page || pageBusy || pageError) return
    const timer = window.setTimeout(() => { void cent.progress(id, page).catch(() => setSaveState('محل مطالعه ذخیره نشد؛ اتصال را بررسی کنید.')) }, 1200)
    return () => window.clearTimeout(timer)
  }, [id, page, pageBusy, pageError])

  function updateDraft(value: string) {
    setDraft(value); setSaveState('پیش‌نویس روی این دستگاه')
    try { localStorage.setItem(draftKey, value) } catch { setSaveState('پیش‌نویس ذخیره نشد؛ پیش از خروج ثبت کنید.') }
  }
  function resetNoteEditor() {
    newNoteId.current = crypto.randomUUID()
    setEditing(null); setDraft(''); setAnchorY(0.15); setSaveState('')
    try { localStorage.removeItem(draftKey) } catch { /* The editor can still create a new note. */ }
  }
  function startNewNote() {
    if (saving) return
    if (dirty && !window.confirm('نوشته ثبت‌نشده با یادداشت جدید جایگزین شود؟')) return
    resetNoteEditor()
  }
  async function save() {
    if (!draft.trim() || saving) return
    setSaving(true); setSaveState('در حال ذخیره…')
    try {
      const note = await cent.saveNote({ id: editing?.id || newNoteId.current, documentId: id, page, anchorY, body: draft, revision: editing?.revision || 0 })
      setNotes(current => [...current.filter(n => n.id !== note.id), note]); setEditing(note); setDraft(note.body)
      localStorage.removeItem(draftKey); setSaveState('در حساب شما ذخیره شد')
    } catch (e) { setSaveState(e instanceof Error ? e.message : 'ذخیره انجام نشد؛ پیش‌نویس شما باقی مانده است.') }
    finally { setSaving(false) }
  }
  async function remove(note: StudyNote) {
    if (!window.confirm('این یادداشت حذف شود؟')) return
    try { await cent.deleteNote(note); setNotes(current => current.filter(n => n.id !== note.id)); if (editing?.id === note.id) resetNoteEditor(); setSaveState('یادداشت حذف شد') }
    catch (e) { setSaveState(e instanceof Error ? e.message : 'حذف انجام نشد.') }
  }
  function selectNote(note: StudyNote) {
    if (saving) return
    if (dirty && !window.confirm('نوشته ثبت‌نشده با این یادداشت جایگزین شود؟')) return
    setEditing(note); setDraft(note.body); setAnchorY(note.anchorY); setSaveState('')
  }
  function changePage(next: number) { if (saving) return; setPage(next); pageStage.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }) }
  return <ReaderExperience id={id} remote={remote} page={page} zoom={zoom} notes={notes} editing={editing} draft={draft} anchorY={anchorY} saveState={saveState} saving={saving} pageBusy={pageBusy} pageError={pageError} notesOpen={notesOpen} hidden={hidden} sourceSections={sourceSections} userName={user?.name} canvas={canvas} pageStage={pageStage} changePage={changePage} setZoom={setZoom} setNotesOpen={setNotesOpen} setAnchorY={setAnchorY} updateDraft={updateDraft} save={save} startNewNote={startNewNote} selectNote={selectNote} remove={remove} retry={() => setRetryPage(x => x + 1)}/>
}
