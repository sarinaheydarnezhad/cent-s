import { useState } from 'react'
import { centRequest, dateFa } from '../../services/cent'
import { LoadState, useRemote } from '../../components/CentUI'
import { ConfirmationDialog } from '../../components/Dialog'
import { Notice } from '../../components/UI'

interface Offer { subjectId: string; title: string; contentReleaseId: string; available: boolean; reviewedAt: string | null }
const loadOffers = () => centRequest<Offer[]>('/admin/subject-offers')
export function SubjectOffersAdmin() {
  const remote = useRemote(loadOffers), [selected, setSelected] = useState<Offer | null>(null), [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  async function submit() {
    if (!selected) return
    setBusy(true); setMessage('')
    try { await centRequest(`/admin/subject-offers/${selected.subjectId}`, { method: 'PUT', body: JSON.stringify({ contentReleaseId: selected.contentReleaseId, available: !selected.available, confirmReviewedContent: !selected.available }) }); setSelected(null); setMessage('وضعیت فروش درس ثبت شد.'); remote.reload() }
    catch { setSelected(null); setMessage('تغییر ثبت نشد؛ نسخه محتوا و مجوز را دوباره بررسی کنید.') }
    finally { setBusy(false) }
  }
  return <section className="admin-panel"><h2>فروش درس‌های دوازده‌ماهه</h2><p>قیمت و تخفیف پلکانی از قرارداد فعلی سرور پیروی می‌کند. تأیید فروش به‌معنای تأیید بازبینی محتوای همین نسخه است.</p><LoadState {...remote} retry={remote.reload}/>{remote.data && (remote.data.length ? <div className="admin-table-scroll"><table><thead><tr><th>درس</th><th>نسخه محتوا</th><th>فروش</th><th>بازبینی</th><th>اقدام</th></tr></thead><tbody>{remote.data.map(o => <tr key={o.subjectId}><td>{o.title}</td><td><bdi>{o.contentReleaseId}</bdi></td><td>{o.available ? 'فعال' : 'بسته'}</td><td>{o.reviewedAt ? dateFa(o.reviewedAt) : 'تأیید نشده'}</td><td><button className="button button-secondary button-small" disabled={busy} onClick={() => setSelected(o)}>{o.available ? 'توقف فروش' : 'تأیید و فعال‌سازی'}</button></td></tr>)}</tbody></table></div> : <Notice>پیشنهاد درسی آماده نشده است؛ آماده‌سازی از فرایند ورود محتوای سرور انجام می‌شود.</Notice>)}{message && <p role="status">{message}</p>}<ConfirmationDialog open={!!selected} title={selected?.available ? 'توقف فروش درس' : 'تأیید بازبینی و فروش درس'} description={selected?.available ? 'فروش جدید متوقف می‌شود. سفارش‌ها و دسترسی‌های قبلی حفظ می‌شوند.' : 'با تأیید، مسئولیت بازبینی محتوای همین نسخه و مناسب‌بودن آن برای فروش را می‌پذیرید. این اقدام با هویت مدیریتی شما ثبت می‌شود.'} confirmLabel="تأیید و ثبت" busy={busy} onClose={() => setSelected(null)} onConfirm={() => void submit()}/></section>
}
