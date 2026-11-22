import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { NoteSaveFeedback, ReadingPosition, ResourceCover } from './ReadingUI'
import { ReaderExperience } from './ReaderExperience'
import type { StudyNote } from '../services/cent'

vi.mock('./AppearanceControl', () => ({ AppearanceControl: () => <button>theme</button> }))
const noop = () => {}
const note: StudyNote = { id: 'note', documentId: 'document', page: 2, anchorY: .3, body: 'x² = 4\nیادداشت من', revision: 3, updatedAt: '2026-11-19' }
const document = { id: 'document', trainingId: 'training', title: 'جبر', pageCount: 4, sortOrder: 0 }
function reader({ saving = false, hidden = false, pageError = '', notesOpen = true } = {}) {
  return renderToStaticMarkup(<MemoryRouter><ReaderExperience id="document" remote={{ data: { document, sections: [{ title: 'بخش دوم', startPage: 2 }], notes: [note], progress: null, watermark: 'personal watermark' }, busy: false, error: '', reload: noop }} page={2} zoom={150} notes={[note]} editing={note} draft={note.body} anchorY={.3} saveState="" saving={saving} pageBusy={false} pageError={pageError} notesOpen={notesOpen} hidden={hidden} sourceSections={[]} canvas={{ current: null }} pageStage={{ current: null }} changePage={noop} setZoom={noop} setNotesOpen={noop} setAnchorY={noop} updateDraft={noop} save={noop} startNewNote={noop} selectNote={noop} remove={noop} retry={noop}/></MemoryRouter>)
}
describe('reading presentation and feedback', () => {
  it('shows an unstarted resource without fabricating progress', () => {
    const html = renderToStaticMarkup(<ReadingPosition pageCount={10}/>)
    expect(html).toContain('هنوز شروع نکردی')
    expect(html).not.toContain('<meter')
  })
  it.each([0, 4, 10])('presents supplied positions directly, without a completion or mastery claim (%i)', furthestPage => {
    const html = renderToStaticMarkup(<ReadingPosition pageCount={10} progress={{ documentId: 'document', lastPage: 2, furthestPage, updatedAt: '2026-11-19' }}/>)
    expect(html).toContain(`value="${furthestPage}"`)
    expect(html).toContain('صفحه 2')
    expect(html).toContain('این مقدار نشان‌دهنده تسلط نیست')
    expect(html).not.toContain('تکمیل شد')
    expect(html).not.toContain('درصد')
  })
  it.each(['در حال ذخیره…', 'پیش‌نویس روی این دستگاه'])('does not signal saved success for %s', value => {
    const html = renderToStaticMarkup(<NoteSaveFeedback value={value}/>)
    expect(html).toContain('role="status"')
    expect(html).not.toContain('reading-save-success')
  })
  it('keeps actual server errors actionable beside the editor', () => {
    const html = renderToStaticMarkup(<NoteSaveFeedback value="نسخه یادداشت تغییر کرده؛ دوباره بارگذاری کن."/>)
    expect(html).toContain('role="alert"')
    expect(html).toContain('نسخه یادداشت تغییر کرده')
    expect(html).not.toContain('در حساب شما ذخیره شد')
  })
  it('acknowledges actual successful persistence', () => {
    expect(renderToStaticMarkup(<NoteSaveFeedback value="در حساب شما ذخیره شد"/>)).toContain('reading-save-success')
  })
  it('uses a safe decorative fallback with no protected image request', () => {
    const html = renderToStaticMarkup(<ResourceCover title={'<img src="private">'} subject="ریاضی"/>)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('&lt;img')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('url(')
  })
  it('labels the note page and selected pin beyond color', () => {
    const html = reader()
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('صفحه 2')
    expect(html).toContain('در حال ویرایش')
    expect(html).toContain('aria-controls="reading-notes-panel"')
    expect(html).toContain('width:150%')
  })
  it('preserves native disabled editing and page controls during save', () => {
    const html = reader({ saving: true })
    expect(html).toContain('<textarea id="reading-note-body" disabled=""')
    expect(html).toContain('<select disabled="" aria-label="انتخاب صفحه"')
    expect(html).toContain('aria-label="حذف یادداشت"')
    expect(html).toContain('disabled="" title="حذف یادداشت"')
  })
  it.each([{ hidden: true }, { pageError: 'Access unavailable' }])('retains content concealment for %j', state => {
    const html = reader(state)
    expect(html).toContain('cent-page-content concealed')
    expect(html).not.toContain('download=')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('<embed')
  })
})
