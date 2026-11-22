import { useState, type FormEvent } from 'react'
import { FileUp, Save } from 'lucide-react'
import { centRequest, toman, type StoreProduct, type StudyDocument, type Training } from '../../services/cent'
import { uploadTrainingPdf } from '../../services/pdf-upload'
import { LoadState, useRemote } from '../../components/CentUI'
import { PageHeader } from '../../components/UI'

const fetchContent = () => centRequest<{ trainings: Training[]; documents: StudyDocument[] }>('/admin/trainings')
const fetchProductOptions = () => centRequest<{ trainings: Training[]; products: StoreProduct[] }>('/admin/product-options')
export function CentContentAdmin() {
  const remote = useRemote(fetchContent)
  const [id, setId] = useState<string>(() => crypto.randomUUID())
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [included, setIncluded] = useState(true)
  const [published, setPublished] = useState(false)
  const [trainingId, setTrainingId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function save(event: FormEvent) {
    event.preventDefault()
    const existing = remote.data?.trainings.find(t => t.id === id)
    if ((published || existing?.published) && !window.confirm('تغییر وضعیت یا اطلاعات آموزش منتشرشده ثبت شود؟ خریدها و سوابق قبلی حفظ می‌شوند.')) return
    setBusy(true); setMessage('')
    try { await centRequest(`/admin/trainings/${id}`, { method: 'PUT', body: JSON.stringify({ title, description, includedInSubscription: included, published }) }); setMessage('آموزش ذخیره شد.'); setTrainingId(id); remote.reload() }
    catch (e) { setMessage(e instanceof Error ? e.message : 'ذخیره انجام نشد.') } finally { setBusy(false) }
  }
  async function upload(event: FormEvent) {
    event.preventDefault(); if (!file || !trainingId) return; setBusy(true)
    try { await uploadTrainingPdf(file, trainingId, lessonTitle, remote.data?.documents.filter(d => d.trainingId === trainingId).length || 0, setMessage); setMessage('درس با موفقیت منتشر شد.'); setFile(null); setLessonTitle(''); remote.reload() }
    catch (e) { setMessage((e instanceof Error ? e.message : 'بارگذاری انجام نشد.') + ' در صورت قطع اتصال، همین فایل را دوباره انتخاب کنید تا بارگذاری ادامه یابد.') }
    finally { setBusy(false) }
  }
  return <><PageHeader eyebrow="کتابخانه آموزشی" title="آموزش‌ها و درس‌ها" description="آموزش، مجموعه‌ای از درس‌های PDF است. فایل اصلی به دانشجو ارائه نمی‌شود."/><LoadState {...remote} retry={remote.reload}/><div className="cent-admin-columns"><form className="card cent-admin-panel cent-form" onSubmit={save}><div className="cent-section-head"><h2>مشخصات آموزش</h2><button type="button" className="button button-ghost button-small" disabled={busy} onClick={() => { setId(crypto.randomUUID()); setTitle(''); setDescription(''); setPublished(false); setIncluded(true) }}>آموزش جدید</button></div><label>عنوان<input value={title} maxLength={200} onChange={e => setTitle(e.target.value)} required/></label><label>توضیح<textarea value={description} maxLength={8000} onChange={e => setDescription(e.target.value)}/></label><label className="cent-checkbox"><input type="checkbox" checked={included} onChange={e => setIncluded(e.target.checked)}/> داخل اشتراک مطالعه باشد</label><label className="cent-checkbox"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}/> در فروشگاه و کتابخانه منتشر شود</label><button className="button button-primary" disabled={busy}><Save size={16}/> ذخیره آموزش</button></form><form className="card cent-admin-panel cent-form" onSubmit={upload}><h2><FileUp size={20}/> افزودن درس PDF</h2><label>آموزش<select value={trainingId} onChange={e => setTrainingId(e.target.value)} required><option value="">انتخاب آموزش</option>{remote.data?.trainings.map(t => <option value={t.id} key={t.id}>{t.title}</option>)}</select></label><label>عنوان درس<input value={lessonTitle} maxLength={200} onChange={e => setLessonTitle(e.target.value)} required/></label><label className="cent-file-drop">فایل PDF<input type="file" accept="application/pdf,.pdf" onChange={e => { setFile(e.target.files?.[0] || null); if (!lessonTitle) setLessonTitle(e.target.files?.[0]?.name.replace(/\.pdf$/i, '') || '') }} required/><small>حداکثر ۴۰ مگابایت و ۲۰۰ صفحه برای هر درس</small></label><p className="muted-text">صفحات به تصاویر بهینه تبدیل می‌شوند. فهرست داخلی PDF هم به محیط مطالعه منتقل می‌شود. تا پایان بارگذاری این صفحه را باز نگه دارید.</p><button className="button button-primary" disabled={busy || !trainingId || !file}><FileUp size={16}/>{busy ? 'در حال آماده‌سازی…' : 'بارگذاری و انتشار درس'}</button></form></div>{message && <p className="notice" role="status">{message}</p>}<div className="cent-admin-training-list">{remote.data?.trainings.map(training => <section key={training.id} className="card cent-admin-panel"><div className="cent-section-head"><div><span className="cent-tag">{training.published ? 'منتشرشده' : 'پیش‌نویس'}</span><h2>{training.title}</h2></div><button className="button button-secondary button-small" disabled={busy} onClick={() => { setId(training.id); setTitle(training.title); setDescription(training.description); setIncluded(training.includedInSubscription); setPublished(training.published); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>ویرایش</button></div><p>{training.description}</p>{remote.data?.documents.filter(d => d.trainingId === training.id).map(doc => <div className="cent-admin-document" key={doc.id}><span>{doc.title} · {doc.pageCount} صفحه</span><span className="cent-tag">{doc.published ? 'منتشرشده' : 'بارگذاری ناتمام'}</span>{!doc.published && <button className="button button-ghost button-small" disabled={busy} onClick={async () => { if (!window.confirm('این پیش‌نویس و صفحات آن حذف شوند؟')) return; try { await centRequest(`/admin/documents/${doc.id}`, { method: 'DELETE' }); remote.reload() } catch (e) { setMessage(e instanceof Error ? e.message : 'حذف نشد.') } }}>حذف پیش‌نویس</button>}</div>)}</section>)}</div></>
}

export function CentProductsAdmin() {
  const remote = useRemote(fetchProductOptions)
  const [product, setProduct] = useState<StoreProduct>({ id: crypto.randomUUID(), title: '', kind: 'TRAINING', trainingId: null, priceRial: 100000, durationDays: null, active: false })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!window.confirm('قیمت و وضعیت فروش محصول ثبت شود؟ مبلغ سفارش‌های قبلی تغییر نمی‌کند.')) return
    setBusy(true); setMessage('')
    try { await centRequest(`/admin/products/${product.id}`, { method: 'PUT', body: JSON.stringify(product) }); remote.reload(); setMessage('محصول ذخیره شد.') }
    catch (e) { setMessage(e instanceof Error ? e.message : 'ذخیره انجام نشد.') } finally { setBusy(false) }
  }
  return <><PageHeader title="محصولات و اشتراک" description="قیمت‌ها در پایگاه داده به ریال ذخیره می‌شوند؛ نمایش فروشگاه به تومان است."/><LoadState {...remote} retry={remote.reload}/><form className="card cent-admin-panel cent-form" onSubmit={save}><div className="cent-section-head"><h2>تعریف دسترسی</h2><button type="button" className="button button-secondary button-small" onClick={() => setProduct({ id: crypto.randomUUID(), title: '', kind: 'SUBSCRIPTION', trainingId: null, priceRial: 100000, durationDays: 30, active: false })}>محصول جدید</button></div><div className="form-grid"><label>عنوان<input value={product.title} required maxLength={200} onChange={e => setProduct({ ...product, title: e.target.value })}/></label><label>نوع<select value={product.kind} onChange={e => setProduct({ ...product, kind: e.target.value as StoreProduct['kind'], trainingId: null, durationDays: e.target.value === 'SUBSCRIPTION' ? 30 : null })}><option value="TRAINING">خرید دائمی آموزش</option><option value="SUBSCRIPTION">اشتراک مطالعه</option></select></label>{product.kind === 'TRAINING' ? <label>آموزش<select value={product.trainingId || ''} required onChange={e => setProduct({ ...product, trainingId: e.target.value })}><option value="">انتخاب آموزش</option>{remote.data?.trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label> : <label>مدت (روز)<input type="number" min={1} max={366} value={product.durationDays || 30} onChange={e => setProduct({ ...product, durationDays: Number(e.target.value) })} required/></label>}<label>قیمت (ریال)<input type="number" min={1} step={1} max={1000000000000} value={product.priceRial} onChange={e => setProduct({ ...product, priceRial: Number(e.target.value) })} required/><small>{toman(product.priceRial)}</small></label></div><label className="cent-checkbox"><input type="checkbox" checked={product.active} onChange={e => setProduct({ ...product, active: e.target.checked })}/> فروش این محصول فعال باشد</label><button className="button button-primary" disabled={busy}><Save size={16}/> ذخیره محصول</button>{message && <p role="status">{message}</p>}</form><div className="table-card"><table><thead><tr><th>محصول</th><th>دسترسی</th><th>قیمت</th><th>وضعیت</th><th></th></tr></thead><tbody>{remote.data?.products.filter(p => ['TRAINING', 'SUBSCRIPTION'].includes(p.kind)).map(p => <tr key={p.id}><td>{p.title}</td><td>{p.kind === 'TRAINING' ? 'دائمی' : `${p.durationDays} روز`}</td><td>{toman(p.priceRial)}</td><td>{p.active ? 'فعال' : 'غیرفعال'}</td><td><button className="button button-ghost button-small" onClick={() => { setProduct(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>ویرایش</button></td></tr>)}</tbody></table></div></>
}
