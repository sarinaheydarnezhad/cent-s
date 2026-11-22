import { StrictMode, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { ArrowLeft, BookOpen, Check, Search, Trash2 } from 'lucide-react'
import { AppearanceControl } from '../components/AppearanceControl'
import { ActionCard, Badge, Button, Card, EmptyState, FilterGroup, IconButton, LoadingState, Notice, PageHeader, ProgressBar, Skeleton, StatCard, StatusMessage } from '../components/UI'
import { CheckField, InputField, SelectField, TextareaField } from '../components/Fields'
import { ConfirmationDialog, Dialog } from '../components/Dialog'
import { JourneyNav } from '../components/JourneyNav'
import { LoadState } from '../components/CentUI'
import '../foundations.css'
import '../styles.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/vazirmatn/700.css'
import '@fontsource/vazirmatn/800.css'
import '../cent.css'
import '../foundation-ui.css'
import './reference.css'

export function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="reference-section"><header dir="ltr" lang="en"><span>{id.toUpperCase()}</span><h2>{title}</h2><p>{description}</p></header>{children}</section>
}
export function Reference() {
  const [filter, setFilter] = useState('all')
  const [radio, setRadio] = useState('review')
  const [invalid, setInvalid] = useState(false)
  const [dialog, setDialog] = useState<'none' | 'info' | 'confirm' | 'locked'>('none')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [recovered, setRecovered] = useState(false)
  const [cardSelected, setCardSelected] = useState(false)
  return <div className="reference-shell">
    <header className="reference-header"><div dir="ltr" lang="en"><b>Itatest</b><span>Shared component reference · Phase 2</span></div><AppearanceControl/></header>
    <main className="reference-main">
      <div className="reference-intro" dir="ltr" lang="en"><span className="reference-kicker">CALM INTELLIGENCE / LOCAL DEVELOPMENT</span><h1>A shared language for the next step.</h1><p>Actual React components, native interactions, approved Slate &amp; Sage tokens. All values and messages on this page are illustrative preview data, including injected error and confirmation examples. No account, scoring, payment or persistence operations occur.</p><nav aria-label="Reference sections">{['buttons','surfaces','fields','selection','feedback','overlays','learning','states','guidance'].map(id=><a key={id} href={`#${id}`}>{id}</a>)}</nav></div>
      <Section id="buttons" title="Action hierarchy" description="Primary for the main next step. Secondary for alternatives. Ghost and text for supporting actions. Destructive only for a consequential removal.">
        <div className="reference-row" data-example="button-variants"><Button onClick={()=>setMessage('ادامه می‌دیم')}>ادامه بده <ArrowLeft aria-hidden="true"/></Button><Button variant="secondary">دیدن جزئیات</Button><Button variant="tertiary">بعداً انجام می‌دم</Button><Button variant="ghost">انصراف</Button><Button variant="destructive" onClick={()=>setDialog('confirm')}><Trash2 aria-hidden="true"/> حذف یادداشت</Button><IconButton variant="secondary" label="جست‌وجو"><Search aria-hidden="true"/></IconButton></div>
        <div className="reference-row" data-example="button-sizes"><Button size="small">کوچک · ۴۴</Button><Button>معمولی · ۴۸</Button><Button size="large">بزرگ · ۵۶</Button><Button disabled>غیرفعال</Button><Button loading loadingLabel="در حال ذخیره…">ذخیره</Button><Button variant="secondary" loading={loading} loadingLabel="در حال آماده‌سازی…" onClick={()=>setLoading(true)}>آزمایش بارگذاری</Button><Button variant="ghost" onClick={()=>setLoading(false)}>پایان آزمایش</Button></div>
        <div className="reference-narrow"><Button fullWidth>شروع ارزیابی</Button></div><p dir="ltr" lang="en" className="reference-note">Hover, press and Tab through live controls. Busy buttons use native disabled behavior and aria-busy. Submit buttons require type="submit".</p>
      </Section>
      <Section id="surfaces" title="Surfaces with a purpose" description="16px radius. Standard surfaces stay flat; recommendations and learning guidance carry intentional Sage. Interactive cards contain no nested controls.">
        <div className="reference-grid"><Card><h3>مطالعه، قدم‌به‌قدم</h3><p>یادداشت‌هات کنار محتوای هر درس می‌مونن.</p><footer><Badge>محتوا</Badge><Button variant="tertiary">دیدن درس</Button></footer></Card><Card variant="outlined"><h3>جزئیات درس</h3><p>وقتی مرزبندی یک بخش به خوانایی کمک می‌کنه.</p></Card><Card variant="elevated"><h3>سطح برجسته</h3><p>برای بخش محدودی که به جداسازی بیشتری نیاز داره.</p></Card><Card variant="recommendation"><Badge tone="recommendation">پیشنهاد مطالعه</Badge><h3>قدم بعدی تو</h3><p>یک مبحث رو انتخاب کن و با مرور کوتاه ادامه بده.</p><Button>ادامه مطالعه <ArrowLeft aria-hidden="true"/></Button></Card><Card variant="learning"><h3>مسیر یادگیری</h3><p>این نمونه فقط ظاهر راهنمای آموزشی رو نشون می‌ده.</p><Badge tone="learning">مرور مبحث</Badge></Card><Card variant="selected"><h3><Check size={18} aria-hidden="true"/> انتخاب‌شده</h3><p>انتخاب معمولی با Slate و نشانه متنی مشخص می‌شه.</p></Card><ActionCard aria-pressed={cardSelected} onClick={()=>setCardSelected(!cardSelected)}><h3>{cardSelected ? 'انتخاب شد ✓' : 'انتخاب یک درس'}</h3><p>با Enter یا Space انتخاب کن.</p></ActionCard></div>
      </Section>
      <Section id="fields" title="Native fields, clear associations" description="Labels stay visible. Hints and validation attach to their field. LTR email and scientific notation retain their direction. This form validates preview data only.">
        <form className="reference-grid" onSubmit={event=>{event.preventDefault();setInvalid(true)}} noValidate>
          <InputField label="نام" required placeholder="نامت رو بنویس" error={invalid ? 'نامت رو بنویس تا ادامه بدیم.' : undefined}/>
          <InputField label="ایمیل نمونه" type="email" dir="ltr" defaultValue="student@example.test" hint="برای نمونه: student@example.test" error={invalid ? 'ایمیل رو با قالب درست بنویس؛ مثل name@example.test.' : undefined}/>
          <InputField label="رمز عبور نمونه" type="password" dir="ltr" hint="حداقل ۱۰ نویسه" autoComplete="new-password"/>
          <InputField label="جست‌وجوی مبحث" type="search" placeholder="نام درس یا مبحث"/>
          <SelectField label="درس"><option value="math">ریاضی · Math</option><option value="physics">فیزیک · Physics</option></SelectField>
          <InputField label="فقط خواندنی" readOnly value="CEnT-S · x² + 2x" dir="ltr"/>
          <InputField label="نمونه غیرفعال" disabled value="فعلاً در دسترس نیست"/>
          <TextareaField label="یادداشت نمونه" hint="Persian text and x² + 2x can coexist." dir="auto"/>
          <CheckField label="این مبحث رو برای مرور انتخاب می‌کنم" hint="کنترل بومی checkbox"/>
          <CheckField label="انتخاب غیرفعال" disabled/>
          <fieldset><legend>روش مطالعه نمونه</legend><CheckField type="radio" name="study-example" label="مرور" value="review" checked={radio==='review'} onChange={()=>setRadio('review')}/><CheckField type="radio" name="study-example" label="تمرین" value="practice" checked={radio==='practice'} onChange={()=>setRadio('practice')}/></fieldset>
          <div className="reference-row"><Button type="submit" variant="secondary">نمایش خطای نمونه</Button><Button variant="ghost" onClick={()=>setInvalid(false)}>پاک‌کردن خطای نمونه</Button></div>
        </form>
      </Section>
      <Section id="selection" title="Selection, labels and navigation" description="Filters are pressed buttons, not simulated tabs. Badges are labels, not controls. Native links retain route/current semantics in the application.">
        <FilterGroup label="فیلتر درس نمونه" value={filter} options={[{value:'all',label:'همه'},{value:'math',label:'ریاضی'},{value:'physics',label:'فیزیک'}]} onChange={setFilter}/>
        <p role="status">{filter==='all' ? 'همه درس‌ها' : filter==='math' ? 'درس ریاضی' : 'درس فیزیک'}</p>
        <div className="reference-row">{(['neutral','learning','recommendation','success','warning','error','info'] as const).map((tone,i)=><Badge key={tone} tone={tone}>{['برچسب','در حال یادگیری','پیشنهاد مرور','ذخیره شد','نیاز به بررسی','ذخیره نشد','اطلاعات درس'][i]}</Badge>)}</div>
        <MemoryRouter initialEntries={['/diagnostic/intro']}><JourneyNav/></MemoryRouter>
      </Section>
      <Section id="feedback" title="Feedback that stays in context" description="Inline for field validation. Contextual notices for recoverable failures. Polite status for low-risk acknowledgments. Confirmation for consequential decisions.">
        <div className="reference-grid"><Notice tone="info" title="قبل از شروع">می‌تونی بعداً از همین‌جا ادامه بدی.</Notice><Notice tone="success" title="ذخیره شد">یادداشتت آماده‌ست.</Notice><Notice tone="warning" title="نیاز به بررسی">قبل از ادامه، جزئیات رو بررسی کن.</Notice><Notice tone="error" title="خطای نمونه" action={<Button variant="secondary" onClick={()=>setMessage('دوباره تلاش می‌کنیم')}>دوباره تلاش کن</Button>}>نتونستیم اطلاعات رو بارگذاری کنیم.</Notice></div>
        <Button variant="secondary" onClick={()=>setMessage('ذخیره شد')}>نمایش تأیید نمونه</Button><StatusMessage>{message}</StatusMessage>
      </Section>
      <Section id="overlays" title="Dialogs and focus" description="Native modal dialog: named heading, contained focus, safe initial focus, Escape dismissal, scroll lock and focus restoration. Backdrop clicks do not confirm or dismiss.">
        <div className="reference-row"><Button variant="secondary" onClick={()=>setDialog('info')}>بازکردن گفت‌وگو</Button><Button variant="destructive" onClick={()=>setDialog('confirm')}>تأیید حذف نمونه</Button><Button variant="ghost" onClick={()=>setDialog('locked')}>گفت‌وگوی بدون خروج با Escape</Button></div>
        <Dialog open={dialog==='info'} title="جزئیات نمونه" description="این گفت‌وگو داده‌ای رو تغییر نمی‌ده." onClose={()=>setDialog('none')}><InputField label="عنوان نمونه"/></Dialog>
        <ConfirmationDialog open={dialog==='confirm'} title="یادداشت نمونه حذف بشه؟" description="این فقط یک نمونه‌ست؛ هیچ یادداشتی حذف نمی‌شه." confirmLabel="حذف نمونه" destructive onClose={()=>setDialog('none')} onConfirm={()=>{setDialog('none');setMessage('تأیید نمونه انجام شد')}}/>
        <Dialog open={dialog==='locked'} title="نمونه تصمیم ضروری" description="Escape این نمونه رو نمی‌بنده. دکمه زیر برای خروج در دسترسه." dismissible={false} onClose={()=>setDialog('none')}/>
      </Section>
      <Section id="learning" title="Sage means learning and support" description="Sage is not a generic success flag. Progress exposes its actual clamped value and text equivalent. These percentages are illustrative, never learner records.">
        <div className="reference-grid"><Card variant="learning"><h3>مرور ریاضی · نمونه</h3><p>۴۵٪ از مسیر نمونه</p><ProgressBar value={45} label="پیشرفت نمونه ریاضی"/><footer><Badge tone="learning">در حال یادگیری</Badge></footer></Card><Card variant="recommendation"><h3>پیشنهاد مرور · نمونه</h3><p>یک قدم کوچک برای ادامه مسیرت انتخاب کن.</p><Button>ادامه بده</Button></Card><Card><h3>داده‌های ارزیابی · نمونه</h3><p>هنوز سنجیده نشده</p><ProgressBar value={0} label="تسلط نمونه" valueText="هنوز سنجیده نشده"/><p>۳ پاسخ از ۱۰ سؤال · نمونه</p><ProgressBar value={30} tone="action" label="پاسخ‌های نمونه"/></Card><StatCard label="مباحث نمونه" value="۳ از ۱۰" note="داده نمایشی، بدون محاسبه آموزشی" icon={<BookOpen aria-hidden="true"/>}/></div>
      </Section>
      <Section id="states" title="Loading, empty and recovery" description="Stable reserved loading space. No-data, search, unavailable, permission and retrieval errors remain distinct. Retry controls only appear with a real handler.">
        <div className="reference-grid"><Card><LoadingState/></Card><Card><Skeleton/></Card><Card><EmptyState title="هنوز چیزی اینجا نیست" description="بعد از اضافه‌شدن محتوا، اینجا می‌بینیش."/></Card><Card><EmptyState kind="search" title="چیزی پیدا نشد" description="عبارت جست‌وجو رو تغییر بده."/></Card><Card><EmptyState kind="unavailable" title="محتوا در دسترس نیست" description="برای دیدن درس‌های موجود به فهرست برگرد."/></Card><Card><EmptyState kind="restricted" title="دسترسی به این محتوا محدوده" description="جزئیات دسترسی این درس رو بررسی کن."/></Card></div>
        {recovered ? <StatusMessage>نمونه بازیابی شد</StatusMessage> : <LoadState busy={false} error="نتونستیم اطلاعات رو بارگذاری کنیم. این خطا برای پیش‌نمایش ایجاد شده." retry={()=>setRecovered(true)}/>}
      </Section>
      <Section id="guidance" title="Use and misuse" description="The component guide records contracts and current consumers. These examples explain intent without rendering inaccessible combinations.">
        <div dir="ltr" lang="en" className="reference-grid"><Card><h3>Use</h3><ul><li>One clear primary action per decision.</li><li>Sage for a genuine educational recommendation.</li><li>Persistent error with a relevant recovery action.</li><li>Visible text alongside progress and status color.</li></ul></Card><Card><h3>Avoid</h3><ul><li>Pale Sage text on white or white text on pale Sage.</li><li>Using success green for every selected filter.</li><li>Buttons nested inside a whole-card button/link.</li><li>Critical errors only in disappearing notifications.</li><li>Fake retry controls or fabricated achievements.</li></ul></Card></div>
      </Section>
      <PageHeader title="سردرگم نمون، هدفمند بخون." description="این صفحه فقط مرجع محلی اجزای رابط کاربری است."/>
    </main>
  </div>
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<StrictMode><Reference/></StrictMode>)
