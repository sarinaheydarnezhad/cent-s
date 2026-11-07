import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, Maximize2, MessageSquare, Minus, Plus, Save, Trash2, X } from 'lucide-react'
import { cent, type StudyNote, type SourceSection } from '../services/cent'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'

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
    const requested = Number(params.get('page'))
    setPage(Number.isInteger(requested) && requested >= 1 && requested <= remote.data.document.pageCount ? requested : remote.data.progress?.lastPage || 1)
    setNotes(remote.data.notes)
  }, [remote.data, params])

  useEffect(() => {
    if (!page) return
    newNoteId.current = crypto.randomUUID()
    setEditing(null); setAnchorY(0.15); setSaveState('')
    try { setDraft(localStorage.getItem(draftKey) || '') } catch { setDraft('') }
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
    setPageBusy(true); setPageError('')
    cent.sourceSections(id).then(rows => { if (!disposed) setSourceSections(rows) }).catch(e => { if (!disposed) setPageError(e.message) }).finally(() => { if (!disposed) setPageBusy(false) })
    return () => { disposed = true }
  }, [id, sourceId, retryPage])
  useEffect(() => {
    if (!page || !watermark || sourceId) return
    const controller = new AbortController()
    let url: string | undefined
    let disposed = false
    setPageBusy(true); setPageError('')
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
  function changePage(next: number) { if (saving) return; setPage(next); pageStage.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const currentNotes = notes.filter(n => n.page === page).sort((a, b) => a.anchorY - b.anchorY)
  return <div className={`cent-reader ${notesOpen ? '' : 'notes-closed'}`}><header className="cent-reader-header"><Link to="/student/content"><ArrowRight size={18}/> کتابخانه من</Link><div><span>فضای مطالعه</span><h1>{remote.data?.document.title || 'آموزش'}</h1></div><button className="button button-secondary button-small" onClick={() => setNotesOpen(o => !o)}><MessageSquare size={16}/> یادداشت‌ها</button></header><LoadState {...remote} retry={remote.reload}/>{remote.error && <Link className="button button-primary" to="/package">خرید یا تمدید دسترسی</Link>}{remote.data && <><div className="cent-reader-toolbar"><div className="cent-reader-pagination"><button aria-label="صفحه قبل" disabled={page <= 1 || saving} onClick={() => changePage(page - 1)}><ArrowRight size={18}/></button><label>صفحه <select aria-label="انتخاب صفحه" value={page} onChange={e => changePage(Number(e.target.value))}>{Array.from({ length: remote.data.document.pageCount }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select> از {remote.data.document.pageCount}</label><button aria-label="صفحه بعد" disabled={page >= remote.data.document.pageCount || saving} onClick={() => changePage(page + 1)}><ArrowLeft size={18}/></button></div><div className="cent-reader-zoom"><button aria-label="کوچک‌نمایی" disabled={zoom <= 75} onClick={() => setZoom(z => z - 25)}><Minus size={16}/></button><span>{zoom}٪</span><button aria-label="بزرگ‌نمایی" disabled={zoom >= 200} onClick={() => setZoom(z => z + 25)}><Plus size={16}/></button><button aria-label="اندازه معمول" onClick={() => setZoom(100)}><Maximize2 size={16}/></button></div></div><div className="cent-reader-layout"><main className="cent-reading-area" ref={pageStage}><div className="cent-page-shell" style={{ width: `${zoom}%` }} onContextMenu={e => e.preventDefault()}><div className={`cent-page-content ${hidden || pageBusy || pageError ? 'concealed' : ''}`} onClick={e => {
    const bounds = e.currentTarget.getBoundingClientRect(); setAnchorY(Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height))); setNotesOpen(true)
  }}>{sourceId && <article className="cent-source-text"><small>{watermark}</small><h2>{sourceSections[page - 1]?.heading}</h2><div>{sourceSections[page - 1]?.text}</div>{sourceSections[page - 1]?.topicId && <Link className="button button-secondary" to={`/student/practice?topic=${sourceSections[page - 1].topicId}&returnTo=${encodeURIComponent(`/student/study/${id}?page=${page}`)}`}>تمرین این مبحث</Link>}</article>}<canvas hidden={!!sourceId} ref={canvas} role="img" aria-label={`صفحه ${page} از ${remote.data.document.title}`} draggable={false}/>{currentNotes.map((note, i) => <button key={note.id} className={`cent-note-pin ${editing?.id === note.id ? 'selected' : ''}`} style={{ top: `${note.anchorY * 100}%` }} aria-label={`یادداشت ${i + 1}`} onClick={e => { e.stopPropagation(); selectNote(note); setNotesOpen(true) }}>{i + 1}</button>)}</div>{(pageBusy || pageError) && <div className="cent-page-overlay"><LoadState busy={pageBusy} error={pageError} retry={() => setRetryPage(x => x + 1)}/>{pageError && <Link to="/package">بررسی دسترسی</Link>}</div>}</div><div className="cent-page-footer"><span><BookOpen size={14}/> صفحه {page} · برای ثبت نکته روی بخش موردنظر بزن</span><span>نمایش شخصی برای {user?.name}</span></div></main><aside className="cent-reader-notes"><div className="cent-reader-notes-title"><div><MessageSquare size={18}/><h2>کنار این صفحه</h2><span>{currentNotes.length}</span></div><button className="icon-button" aria-label="بستن یادداشت‌ها" onClick={() => setNotesOpen(false)}><X size={16}/></button></div>{remote.data.sections.length > 0 && <label className="cent-section-select">فهرست درس<select value={remote.data.sections.filter(s => s.startPage <= page).at(-1)?.startPage || ''} onChange={e => changePage(Number(e.target.value))}><option value="" disabled>انتخاب بخش</option>{remote.data.sections.map(s => <option key={`${s.startPage}:${s.title}`} value={s.startPage}>{s.title} · صفحه {s.startPage}</option>)}</select></label>}<div className="cent-note-editor"><span className="eyebrow">{editing ? 'ویرایش یادداشت' : 'نکته تازه'} · صفحه {page}</span><textarea disabled={saving} aria-label="متن یادداشت" placeholder="اینجا چه چیزی یاد گرفتی؟ سؤالت چیست؟" maxLength={4000} value={draft} onChange={e => updateDraft(e.target.value)}/><label className="cent-anchor-label">محل یادداشت روی صفحه<input disabled={saving} type="range" min="0" max="100" value={Math.round(anchorY * 100)} onChange={e => setAnchorY(Number(e.target.value) / 100)}/></label><div className="cent-note-editor-actions"><button className="button button-primary button-small" disabled={!draft.trim() || saving} onClick={save}>{saveState === 'در حساب شما ذخیره شد' ? <Check size={15}/> : <Save size={15}/>} {saving ? 'در حال ثبت…' : 'ثبت یادداشت'}</button>{editing && <button className="button button-ghost button-small" disabled={saving} onClick={startNewNote}>یادداشت جدید</button>}</div><small role="status" className="cent-save-status">{saveState || 'یادداشت‌ها فقط برای خودت قابل مشاهده‌اند.'}</small></div><div className="cent-page-notes">{currentNotes.length === 0 && <div className="cent-notes-empty"><MessageSquare/><p>اولین فکر کنار این صفحه را بنویس.</p></div>}{currentNotes.map((note, i) => <article key={note.id} className={editing?.id === note.id ? 'active' : ''}><button className="cent-note-text" onClick={() => selectNote(note)}><span>یادداشت {i + 1} <ChevronLeft size={14}/></span><p>{note.body}</p></button><button className="cent-note-delete" disabled={saving} aria-label="حذف یادداشت" onClick={() => remove(note)}><Trash2 size={14}/></button></article>)}</div><Link className="text-link" to="/student/notes">همه یادداشت‌های من <ArrowLeft size={15}/></Link></aside></div></>}</div>
}
