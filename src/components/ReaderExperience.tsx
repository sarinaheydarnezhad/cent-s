import { PilotLesson } from './PilotLesson'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Check, Maximize2, MessageSquare, Minus, Plus, Save, Trash2, X } from 'lucide-react'
import type { SourceSection, StudyData, StudyNote } from '../services/cent'
import { LoadState } from './CentUI'
import { AppearanceControl } from './AppearanceControl'
import { Skeleton } from './UI'
import { NoteSaveFeedback, ReadingPosition } from './ReadingUI'

interface Props {
  reattaching?: boolean
  startReattach?: () => void
  draftAnchor?: string | null
  placeNote?: (anchor: string, y: number) => void
  id: string; remote: { data: StudyData | null; busy: boolean; error: string; reload: () => void }
  page: number; zoom: number; notes: StudyNote[]; editing: StudyNote | null; draft: string; anchorY: number
  saveState: string; saving: boolean; pageBusy: boolean; pageError: string; notesOpen: boolean; hidden: boolean
  sourceSections: SourceSection[]; userName?: string
  canvas: RefObject<HTMLCanvasElement | null>; pageStage: RefObject<HTMLDivElement | null>
  changePage: (page: number) => void; setZoom: (update: (value: number) => number) => void
  setNotesOpen: (value: boolean) => void; setAnchorY: (value: number) => void; updateDraft: (value: string) => void
  save: () => void; startNewNote: () => void; selectNote: (note: StudyNote) => void; remove: (note: StudyNote) => void; retry: () => void
}

export function ReaderExperience(props: Props) {
  const { id, remote, page, zoom, notes, editing, draft, anchorY, saveState, saving, pageBusy, pageError, notesOpen, hidden, sourceSections, userName, canvas, pageStage, changePage, setZoom, setNotesOpen, setAnchorY, updateDraft, save, startNewNote, selectNote, remove, retry } = props
  const notesPanel = useRef<HTMLElement>(null)
  const notesToggle = useRef<HTMLButtonElement>(null)
  const focusRequested = useRef(false)
  function focusNotes() {
    notesPanel.current?.focus({ preventScroll: true })
    notesPanel.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }
  function openNotes() {
    if (notesOpen) focusNotes()
    else { focusRequested.current = true; setNotesOpen(true) }
  }
  function closeNotes() { setNotesOpen(false); notesToggle.current?.focus({ preventScroll: true }) }
  useEffect(() => { if (notesOpen && focusRequested.current) { focusRequested.current = false; focusNotes() } }, [notesOpen])
  const data = remote.data
  const sourceId = data?.document.sourceId
  const pilot = sourceSections[page - 1]?.pilotHtml
  const currentNotes = useMemo(() => notes.filter(n => n.page === page).sort((a, b) => a.anchorY - b.anchorY), [notes, page])
  return <div className={`cent-reader reading-workspace ${notesOpen ? '' : 'notes-closed'} ${pilot ? 'reader-pilot-active' : ''}`}>
    <a className="reading-skip" href="#reading-document">رفتن به صفحه مطالعه</a>
    <header className="cent-reader-header"><Link to="/student/content" aria-label="کتابخانه من" title="کتابخانه من" className="reading-library-link"><ArrowRight size={18} aria-hidden="true"/><span>کتابخانه من</span></Link><div className="reading-title"><h1 dir="auto">{data?.document.title || 'فضای مطالعه'}</h1>{pilot && <small className="pilot-header-trace" dir="ltr">{sourceSections[page - 1].watermark || data?.watermark}</small>}</div><AppearanceControl/><button ref={notesToggle} className="button button-secondary button-small" aria-expanded={notesOpen} aria-controls="reading-notes-panel" onClick={() => notesOpen ? closeNotes() : openNotes()}><MessageSquare size={18} aria-hidden="true"/> یادداشت‌ها{data && <span className="reading-note-count">{currentNotes.length}</span>}</button></header>
    <div className="reading-load">{remote.busy ? <Skeleton label="در حال آماده‌سازی فضای مطالعه…" lines={4}/> : <LoadState {...remote} retry={remote.reload}/>}{remote.error && <Link className="button button-secondary" to="/package">خرید یا تمدید دسترسی</Link>}</div>
    {data && <><div className="cent-reader-toolbar" aria-label="ابزار مطالعه"><div className="cent-reader-pagination"><button title="صفحه قبل" aria-label="صفحه قبل" disabled={page <= 1 || saving} onClick={() => changePage(page - 1)}><ArrowRight size={18} aria-hidden="true"/></button><label>صفحه <select disabled={saving} aria-label="انتخاب صفحه" value={page} onChange={e => changePage(Number(e.target.value))}>{Array.from({ length: data.document.pageCount }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select><span>از {data.document.pageCount}</span></label><button title="صفحه بعد" aria-label="صفحه بعد" disabled={page >= data.document.pageCount || saving} onClick={() => changePage(page + 1)}><ArrowLeft size={18} aria-hidden="true"/></button></div><div className="cent-reader-zoom" role="group" aria-label="اندازه صفحه"><button title="کوچک‌نمایی" aria-label="کوچک‌نمایی" disabled={zoom <= 75} onClick={() => setZoom(z => z - 25)}><Minus size={18} aria-hidden="true"/></button><span aria-live="polite">{zoom}٪</span><button title="بزرگ‌نمایی" aria-label="بزرگ‌نمایی" disabled={zoom >= 200} onClick={() => setZoom(z => z + 25)}><Plus size={18} aria-hidden="true"/></button><button title="اندازه معمول" aria-label="اندازه معمول" onClick={() => setZoom(() => 100)}><Maximize2 size={18} aria-hidden="true"/></button></div></div>
      <div className="cent-reader-layout"><main className="cent-reading-area" ref={pageStage} id="reading-document" tabIndex={-1} aria-label="صفحه مطالعه"><div className="reading-page-pan"><div className="cent-page-shell" style={{ width: `${zoom}%`, ...(pilot ? { '--pilot-scale': zoom / 100 } : {}) }} onContextMenu={e => e.preventDefault()}><div className={`cent-page-content ${hidden || pageBusy || pageError ? 'concealed' : ''}`} onClick={e => {
        if (pilot) return
        const bounds = e.currentTarget.getBoundingClientRect(); setAnchorY(Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height))); openNotes()
      }}>{pilot && <PilotLesson documentId={id} assets={sourceSections[page - 1].assets} reattaching={props.reattaching} startReattach={saving ? undefined : props.startReattach} selectedId={editing?.id} draftAnchor={props.draftAnchor} revision={sourceSections[page - 1].contentRevision} html={pilot} sectionId={sourceSections[page - 1].id} notes={currentNotes} watermark={sourceSections[page - 1].watermark || data.watermark} selectNote={note => { selectNote(note); openNotes() }} placeNote={props.placeNote || (() => {})}/>} {pilot && sourceSections[page - 1]?.topicId && <Link className="button button-secondary" to={`/student/practice?topic=${sourceSections[page - 1].topicId}&returnTo=${encodeURIComponent(`/student/study/${id}?page=${page}`)}`}>{'\u062a\u0645\u0631\u06cc\u0646 \u0627\u06cc\u0646 \u0645\u0628\u062d\u062b'}</Link>} {sourceId && !pilot && <article className="cent-source-text"><small>{sourceSections[page - 1]?.watermark || data.watermark}</small><h2>{sourceSections[page - 1]?.heading}</h2><div>{sourceSections[page - 1]?.text}</div>{sourceSections[page - 1]?.topicId && <Link className="button button-secondary" to={`/student/practice?topic=${sourceSections[page - 1].topicId}&returnTo=${encodeURIComponent(`/student/study/${id}?page=${page}`)}`}>تمرین این مبحث</Link>}</article>}<canvas hidden={!!sourceId} ref={canvas} role="img" aria-label={`صفحه ${page} از ${data.document.title}`} draggable={false}/>{!pilot && currentNotes.map((note, i) => <button key={note.id} className={`cent-note-pin ${editing?.id === note.id ? 'selected' : ''}`} style={{ top: `${note.anchorY * 100}%` }} aria-label={`یادداشت ${i + 1}`} aria-pressed={editing?.id === note.id} onClick={e => { e.stopPropagation(); selectNote(note); openNotes() }}>{i + 1}</button>)}</div>{(pageBusy || pageError) && <div className="cent-page-overlay">{pageBusy ? <Skeleton label="در حال بارگذاری صفحه…" lines={3}/> : <LoadState busy={false} error={pageError} retry={retry}/>} {pageError && <Link to="/package">بررسی دسترسی</Link>}</div>}</div></div><div className="cent-page-footer"><span><BookOpen size={16} aria-hidden="true"/> صفحه {page} · برای ثبت نکته روی بخش موردنظر بزن</span><span>نمایش شخصی برای {userName}</span></div>{data.progress && <details className="reading-saved-position"><summary>محل مطالعه ثبت‌شده</summary><ReadingPosition progress={data.progress} pageCount={data.document.pageCount}/><p>این محل پیش از باز کردن این صفحه ثبت شده؛ جابه‌جایی‌هات مثل قبل ذخیره می‌شن.</p></details>}</main>
        <aside className="cent-reader-notes" id="reading-notes-panel" ref={notesPanel} tabIndex={-1} aria-labelledby="reading-notes-title"><div className="cent-reader-notes-title"><div><MessageSquare size={19} aria-hidden="true"/><h2 id="reading-notes-title">کنار این صفحه</h2><span>{currentNotes.length}</span></div><button className="icon-button" title="بستن یادداشت‌ها" aria-label="بستن یادداشت‌ها" onClick={closeNotes}><X size={18} aria-hidden="true"/></button></div>
          {data.sections.length > 0 && <label className="cent-section-select">فهرست درس<select disabled={saving} value={data.sections.filter(s => s.startPage <= page).at(-1)?.startPage || ''} onChange={e => changePage(Number(e.target.value))}><option value="" disabled>انتخاب بخش</option>{data.sections.map(s => <option key={`${s.startPage}:${s.title}`} value={s.startPage}>{s.title} · صفحه {s.startPage}</option>)}</select></label>}
          <div className="cent-note-editor"><label className="eyebrow" htmlFor="reading-note-body">{editing ? 'ویرایش یادداشت' : 'نکته تازه'} · صفحه {page}</label><textarea id="reading-note-body" disabled={saving} aria-label="متن یادداشت" placeholder="نکته یا سؤالت رو اینجا بنویس…" maxLength={4000} value={draft} onChange={e => updateDraft(e.target.value)}/>{!pilot && <label className="cent-anchor-label">محل یادداشت روی صفحه<input disabled={saving} type="range" min="0" max="100" value={Math.round(anchorY * 100)} onChange={e => setAnchorY(Number(e.target.value) / 100)}/></label>}<div className="cent-note-editor-actions"><button className="button button-primary button-small" disabled={!draft.trim() || saving} onClick={save}>{saveState === 'در حساب شما ذخیره شد' ? <Check size={16} aria-hidden="true"/> : <Save size={16} aria-hidden="true"/>}{saving ? 'در حال ثبت…' : 'ثبت یادداشت'}</button>{editing && <button className="button button-ghost button-small" disabled={saving} onClick={startNewNote}>یادداشت جدید</button>}</div><NoteSaveFeedback value={saveState}/></div>
          <div className="cent-page-notes">{currentNotes.length === 0 && <div className="cent-notes-empty"><p>یادداشت ثبت‌شده‌ای برای این صفحه نیست.</p></div>}{currentNotes.map((note, i) => <article key={note.id} className={editing?.id === note.id ? 'active' : ''}><button className="cent-note-text" aria-pressed={editing?.id === note.id} disabled={saving} onClick={() => selectNote(note)}><span>یادداشت {i + 1} · صفحه {note.page}{editing?.id === note.id && ' · در حال ویرایش'}</span><p dir="auto">{note.body}</p></button><button className="cent-note-delete" disabled={saving} title="حذف یادداشت" aria-label="حذف یادداشت" onClick={() => remove(note)}><Trash2 size={18} aria-hidden="true"/></button></article>)}</div><Link className="button button-secondary" to="/student/notes">همه یادداشت‌های من</Link>
        </aside></div>
    </>}
  </div>
}
