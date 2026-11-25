import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cent } from '../../services/cent'
import { LoadState, useRemote } from '../../components/CentUI'
import { PilotLesson } from '../../components/PilotLesson'
import './content-preview.css'

export function ContentPreview() {
  const { id = '' } = useParams()
  const [selected, setSelected] = useState('')
  const metadata = useRemote(useCallback(() => cent.contentPreview(id), [id]))
  const section = selected || metadata.data?.sections[0]?.id || ''
  const content = useRemote(useCallback(() => section ? cent.previewSection(id, section) : Promise.resolve(null), [id, section]))
  return <main className="cent-reader reader-pilot-active cent-content-preview" dir="rtl">
    <header className="cent-reader-header"><Link to="/admin/resources">بازگشت به منابع</Link><div><h1>{metadata.data?.document.title || 'پیش‌نمایش محتوا'}</h1><p>پیش‌نمایش برای بازبینی؛ تأیید علمی و انتشار باید جداگانه انجام شود.</p></div></header>
    <LoadState {...metadata} retry={metadata.reload}/>
    {metadata.data && <label className="preview-section-picker">انتخاب بخش <select value={section} onChange={event => setSelected(event.target.value)}>{metadata.data.sections.map(row => <option key={row.id} value={row.id}>{row.heading}</option>)}</select></label>}
    <LoadState {...content} retry={content.reload}/>
    {content.data?.pilotHtml && <div className="cent-reading-area"><PilotLesson html={content.data.pilotHtml} sectionId={section} revision={content.data.contentRevision} assets={content.data.assets} documentId={id} previewAssets watermark={content.data.watermark || ''} notes={[]} placeNote={() => {}} selectNote={() => {}}/></div>}
  </main>
}
