import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Check, CheckCircle2, Clock3, CreditCard, FileText, LockKeyhole, MessageSquare, Sparkles } from 'lucide-react'
import { cent, dateFa, toman } from '../services/cent'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import { EmptyState, PageHeader } from '../components/UI'
import { CourseCatalog } from './CourseCatalog'

export function CatalogPage() {
  const remote = useRemote(cent.catalog)
  const { library } = useAppState()
  const [kind, setKind] = useState<'TRAINING' | 'SUBSCRIPTION'>('TRAINING')
  const products = remote.data?.products.filter(p => p.kind === kind) || []
  return <div className="cent-store"><section className="cent-store-hero"><div className="container"><span className="pill light"><Sparkles size={16}/> برای هر شیوه یادگیری</span><h1>یاد بگیر.<br/><em>به روش خودت.</em></h1><p>یک آموزش را برای همیشه به کتابخانه‌ات اضافه کن، یا با اشتراک به آموزش‌های منتخب و فضای تمرین دسترسی داشته باش.</p><div className="cent-access-promises"><span><Check/> یادداشت‌های شخصی کنار هر صفحه</span><span><Check/> ادامه از آخرین جای مطالعه</span><span><Check/> مطالعه آنلاین در حساب خودت</span></div></div></section><div className="container cent-store-body"><div className="cent-section-head"><div><span className="eyebrow">مسیر بعدی تو</span><h2>انتخاب کن، شروع کن</h2></div><div className="section-tabs"><button className={kind === 'TRAINING' ? 'active' : ''} onClick={() => setKind('TRAINING')}>آموزش‌های تکی</button><button className={kind === 'SUBSCRIPTION' ? 'active' : ''} onClick={() => setKind('SUBSCRIPTION')}>اشتراک مطالعه</button></div></div><p className="muted-text">{kind === 'TRAINING' ? 'خرید تکی: دسترسی دائمی به آموزش خریداری‌شده در سایت.' : 'اشتراک: دسترسی در مدت اعتبار به آموزش‌های دارای نشان «داخل اشتراک» و آزمون‌های شبیه‌ساز. تمدید به انتهای اعتبار قبلی اضافه می‌شود.'}</p><LoadState {...remote} retry={remote.reload}/>{kind === 'SUBSCRIPTION' && !remote.busy && !remote.error && products.length === 0 && <EmptyState title="آموزش‌های تازه در راه‌اند" description="پس از انتشار اولین آموزش‌ها یا طرح اشتراک، اینجا می‌توانی آن‌ها را انتخاب کنی."/>}{kind === 'TRAINING' && <CourseCatalog/>}<div className="cent-product-grid">{(kind === 'SUBSCRIPTION' ? products : []).map((product, index) => {
    const training = remote.data?.trainings.find(t => t.id === product.trainingId)
    const owned = library?.entitlements.some(e => e.kind === 'TRAINING' && e.trainingId === product.trainingId && !e.revokedAt)
    return <article className={`card cent-product ${kind === 'SUBSCRIPTION' ? 'subscription' : ''}`} key={product.id}><div className="cent-product-art"><span>{String(index + 1).padStart(2, '0')}</span>{kind === 'TRAINING' ? <BookOpen/> : <Sparkles/>}<small>{kind === 'TRAINING' ? 'TRAINING / CENT' : 'STUDY MEMBERSHIP'}</small></div><div className="cent-product-body"><div className="cent-tag-row"><span className="cent-tag">{kind === 'TRAINING' ? 'خرید دائمی' : `${product.durationDays} روز دسترسی`}</span>{training?.includedInSubscription && <span className="cent-tag soft">داخل اشتراک</span>}</div><h3>{product.title}</h3><p>{training?.description || 'آموزش‌های منتخب، فضای مطالعه و تمرین‌های شبیه‌ساز، در مدت اعتبار اشتراک.'}</p><div className="cent-price">{toman(product.priceRial)}</div><Link className="button button-primary button-block" to={owned ? '/student/content' : `/checkout?product=${product.id}`}>{owned ? 'در کتابخانه من' : kind === 'TRAINING' ? 'خرید آموزش' : 'انتخاب اشتراک'}<ArrowLeft size={17}/></Link></div></article>
  })}</div><section className="cent-study-benefits"><div><MessageSquare/><h3>فکرهایت را همان‌جا بنویس</h3><p>برای هر صفحه و بخش یادداشت بگذار؛ هر بار با همان آموزش برمی‌گردند.</p></div><div><FileText/><h3>فضای متمرکز مطالعه</h3><p>صفحه‌به‌صفحه، با اندازه دلخواه و فهرست درس‌ها بخوان.</p></div><div><LockKeyhole/><h3>مطالعه داخل سایت</h3><p>آموزش‌ها برای مشاهده آنلاین‌اند و فایل PDF برای دانلود ارائه نمی‌شود.</p></div></section></div></div>
}

export function CentCheckoutPage() {
  const [params] = useSearchParams()
  const id = params.get('product')
  const remote = useRemote(cent.catalog)
  const status = useRemote(cent.status)
  const { user, loading } = useAppState()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(crypto.randomUUID())
  if (loading) return <LoadState busy error="" retry={() => {}}/>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }}/>
  const product = remote.data?.products.find(p => p.id === id)
  async function pay() {
    if (!product) return
    setBusy(true); setError('')
    try { const result = await cent.checkout(product.id, requestId.current); window.location.assign(result.redirectUrl) }
    catch (e) { setError(e instanceof Error ? e.message : 'پرداخت انجام نشد.'); setBusy(false) }
  }
  return <div className="container cent-checkout"><Link className="back-link" to="/package">بازگشت به آموزش‌ها</Link><h1>یک قدم تا شروع مطالعه</h1><LoadState {...remote} retry={remote.reload}/>{!remote.busy && !remote.error && !product && <EmptyState title="محصول را انتخاب کن" description="برای خرید، ابتدا آموزش یا اشتراک موردنظرت را انتخاب کن." action={<Link className="button button-primary" to="/package">دیدن آموزش‌ها</Link>}/>} {product && <div className="cent-checkout-grid"><section className="card cent-checkout-details"><h2><CreditCard/> اطلاعات خرید</h2><dl><dt>خریدار</dt><dd>{user.name}</dd><dt>ایمیل</dt><dd dir="ltr">{user.email}</dd><dt>نوع دسترسی</dt><dd>{product.kind === 'TRAINING' ? 'خرید تکی، دسترسی دائمی داخل سایت' : `${product.durationDays} روز اشتراک`}</dd></dl><p>یادداشت‌ها به حساب شما متصل‌اند و پس از پایان اشتراک نیز حفظ می‌شوند.</p><p>اشتراک به صورت خودکار تمدید یا از حساب بانکی کسر نمی‌شود.</p>{status.data?.payments !== 'LIVE' && <div className="notice">{status.data?.payments === 'NOT_CONFIGURED' ? 'درگاه هنوز فعال نشده است؛ پرداخت فعلاً امکان‌پذیر نیست.' : 'درگاه در حالت آزمایشی است؛ پرداخت واقعی انجام نمی‌شود.'}</div>}{error && <p className="inline-error" role="alert">{error}</p>}<button className="button button-primary button-block" disabled={busy || !status.data || status.data.payments === 'NOT_CONFIGURED'} onClick={pay}>{busy ? 'در حال اتصال به درگاه…' : 'ادامه و پرداخت'}<ArrowLeft size={18}/></button></section><aside className="card cent-checkout-details"><span className="eyebrow">خلاصه سفارش</span><h2>{product.title}</h2><div className="cent-price">{toman(product.priceRial)}</div><small>قیمت از سرور دریافت شده و مبلغ نهایی در درگاه نمایش داده می‌شود.</small></aside></div>}</div>
}

export function CentCheckoutResult() {
  const [params] = useSearchParams()
  const id = params.get('order') || ''
  const { user, loading, refresh } = useAppState()
  const fetcher = useCallback(async () => { if (!id) throw new Error('شناسه سفارش موجود نیست.'); return cent.verify(id) }, [id])
  const remote = useRemote(fetcher)
  useEffect(() => { if (remote.data?.paid) void refresh() }, [remote.data, refresh])
  if (loading) return <LoadState busy error="" retry={remote.reload}/>
  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout/success?order=' + id }}/>
  return <div className="container success-page"><LoadState {...remote} retry={remote.reload}/>{remote.data && <><div className="success-check">{remote.data.paid ? <CheckCircle2/> : <Clock3/>}</div><h1>{remote.data.paid ? 'خریدت تأیید شد؛ وقت یادگیری است.' : 'پرداخت هنوز تأیید نشده است.'}</h1><p>{remote.data.paid ? 'دسترسی در حساب شما ثبت شد و از کتابخانه قابل استفاده است.' : 'اگر مبلغی کسر شده، دوباره وضعیت را بررسی کن. دسترسی فقط پس از تأیید درگاه فعال می‌شود.'}</p><div className="success-actions"><Link className="button button-primary" to="/student/content">کتابخانه من <ArrowLeft/></Link>{!remote.data.paid && <button className="button button-secondary" onClick={remote.reload}>بررسی دوباره</button>}<Link className="button button-secondary" to="/student/profile">سوابق خرید</Link></div></>}</div>
}

export function LibraryPage() {
  const remote = useRemote(cent.library)
  return <><PageHeader eyebrow="فضای یادگیری تو" title="کتابخانه من" description="آموزش‌های خریداری‌شده و مطالعه‌های ناتمام، همه در یک جا." action={<Link className="button button-primary" to="/package">کشف آموزش‌ها <ArrowLeft/></Link>}/><LoadState {...remote} retry={remote.reload}/>{remote.data && <><div className={`cent-membership ${remote.data.hasSubscription ? 'active' : ''}`}><Sparkles/><div><b>{remote.data.hasSubscription ? 'اشتراک مطالعه فعال است' : 'یک آموزش برای همیشه، یا اشتراک برای کشف بیشتر'}</b><p>{remote.data.hasSubscription ? 'آموزش‌های داخل اشتراک و شبیه‌سازها در دسترس‌اند.' : 'خریدهای تکی شما به اشتراک وابسته نیستند. یادداشت‌های قبلی همیشه در بخش یادداشت‌های من باقی می‌مانند.'}</p></div><Link to="/package">{remote.data.hasSubscription ? 'تمدید اشتراک' : 'دیدن طرح‌ها'} <ArrowLeft size={16}/></Link></div>{remote.data.trainings.length === 0 && <EmptyState title="اولین صفحه مسیرت را انتخاب کن" description="با خرید آموزش یا اشتراک، کتابخانه شخصی تو شکل می‌گیرد." action={<Link className="button button-primary" to="/package">انتخاب آموزش</Link>}/>}<div className="cent-library-grid">{remote.data.trainings.map(training => {
    const docs = remote.data!.documents.filter(d => d.trainingId === training.id)
    const readable = remote.data!.readableTrainingIds.includes(training.id)
    const permanent = remote.data!.entitlements.some(e => e.kind === 'TRAINING' && e.trainingId === training.id && !e.revokedAt)
    return <section className="card cent-library-book" key={training.id}><div className="cent-library-book-head"><BookOpen/><span className="cent-tag">{permanent ? 'خرید دائمی' : readable ? 'داخل اشتراک' : 'نیازمند تمدید'}</span></div><h2>{training.title}</h2><p>{training.description}</p><div className="cent-document-list">{docs.map(doc => {
      const progress = remote.data!.progress.find(p => p.documentId === doc.id)
      const count = remote.data!.notes.find(n => n.documentId === doc.id)?.count || 0
      return <div key={doc.id}><FileText/><div><b>{doc.title}</b><small>{doc.pageCount} صفحه · {count} یادداشت {progress && `· ادامه از صفحه ${progress.lastPage}`}</small></div>{readable ? <Link className="button button-secondary button-small" to={`/student/study/${doc.id}`}>{progress ? 'ادامه' : 'شروع'}<ArrowLeft size={15}/></Link> : <LockKeyhole size={18}/>}</div>
    })}{docs.length === 0 && <p className="muted-text">درس‌های این آموزش به‌زودی اضافه می‌شوند.</p>}</div>{!readable && <Link className="text-link" to="/package">فعال‌سازی دسترسی <ArrowLeft size={15}/></Link>}</section>
  })}</div></>}</>
}

export function NotesPage() {
  const remote = useRemote(cent.notes)
  const [search, setSearch] = useState('')
  const notes = remote.data?.filter(n => `${n.body} ${n.documentTitle}`.includes(search)) || []
  return <><PageHeader eyebrow="حاشیه‌های ماندگار" title="یادداشت‌های من" description="حتی پس از پایان اشتراک، نوشته‌های خودت را اینجا می‌بینی."/><input className="cent-search" aria-label="جست‌وجو در یادداشت‌ها" placeholder="در نوشته‌هایت جست‌وجو کن…" value={search} onChange={e => setSearch(e.target.value)}/><LoadState {...remote} retry={remote.reload}/>{!remote.busy && !remote.error && notes.length === 0 && <EmptyState title="هنوز یادداشتی اینجا نیست" description="در محیط مطالعه، روی بخشی از صفحه بزن و اولین نکته را ثبت کن."/>}<div className="cent-notes-grid">{notes.map(note => <article className="card cent-saved-note" key={note.id}><span>{note.documentTitle} · صفحه {note.page}</span><p>{note.body}</p><footer><small>{dateFa(note.updatedAt)}</small><Link to={`/student/study/${note.documentId}?page=${note.page}&note=${note.id}`}>رفتن به صفحه <ArrowLeft size={15}/></Link></footer></article>)}</div></>
}

export function AccountPage() {
  const { user } = useAppState()
  const remote = useRemote(cent.orders)
  const library = useRemote(cent.library)
  const subscriptionEnd = library.data?.entitlements.filter(e => e.kind === 'SUBSCRIPTION' && !e.revokedAt && e.expiresAt).map(e => e.expiresAt!).sort().at(-1)
  return <><PageHeader eyebrow="حساب Cent" title="پروفایل و خریدهای من"/><section className="card cent-account"><div className="cent-account-avatar">{user?.name.slice(0, 1)}</div><div><h2>{user?.name}</h2><p dir="ltr">{user?.email}</p></div><Link className="button button-secondary" to="/student/content">کتابخانه من</Link></section><section className="cent-membership"><Sparkles/><div><b>{library.data?.hasSubscription ? 'اشتراک فعال' : 'اشتراک فعالی ندارید'}</b><p>{subscriptionEnd ? `اعتبار ثبت‌شده تا ${dateFa(subscriptionEnd)}` : 'خریدهای تکی به صورت دائمی در کتابخانه باقی می‌مانند.'}</p></div><Link to="/package">طرح‌های اشتراک</Link></section><h2>سوابق خرید</h2><LoadState {...remote} retry={remote.reload}/>{remote.data?.length === 0 && <EmptyState title="هنوز خریدی ثبت نشده است" description="آموزش یا اشتراکت را از فروشگاه انتخاب کن."/>}<div className="table-card"><table><thead><tr><th>محصول</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th>پیگیری</th></tr></thead><tbody>{remote.data?.map(order => <tr key={order.id}><td>{order.title}<small className="table-sub">{order.kind === 'TRAINING' ? 'خرید تکی' : 'اشتراک'}{order.provider === 'MOCK' ? ' · آزمایشی' : ''}</small></td><td>{toman(order.amountRial)}</td><td>{order.status === 'PAID' ? 'پرداخت‌شده' : 'در انتظار تأیید'}</td><td>{dateFa(order.createdAt)}</td><td>{order.reference || <Link to={`/checkout/success?order=${order.id}`}>بررسی پرداخت</Link>}</td></tr>)}</tbody></table></div></>
}
