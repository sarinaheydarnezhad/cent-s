import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Activity, Bot, CheckCircle2, CircleDollarSign, CloudCog, Database, Eye, EyeOff, Plus, ReceiptText, Save, ShieldCheck, WalletCards, Webhook, Zap } from 'lucide-react'
import { PageHeader, StatCard } from '../../components/UI'
import { useAppState } from '../../state/AppState'

type StoredValue = Record<string, string | boolean>

function useStoredForm(key: string, initial: StoredValue) {
  const [value, setValue] = useState<StoredValue>(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem(key) || '{}') } } catch { return initial }
  })
  const [saved, setSaved] = useState(false)
  function update(name: string, next: string | boolean) { setValue((current) => ({ ...current, [name]: next })); setSaved(false) }
  function save() { localStorage.setItem(key, JSON.stringify(value)); setSaved(true); window.setTimeout(() => setSaved(false), 2200) }
  return { value, update, save, saved }
}

function SecretInput({ value, onChange, placeholder }: { value: string, onChange: (value: string) => void, placeholder: string }) {
  const [visible, setVisible] = useState(false)
  return <div className="secret-field"><input dir="ltr" type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/><button type="button" onClick={() => setVisible((current) => !current)} aria-label="نمایش یا پنهان‌کردن">{visible ? <EyeOff/> : <Eye/>}</button></div>
}

function SaveBar({ onSave, saved, label = 'ذخیره تنظیمات' }: { onSave: () => void, saved: boolean, label?: string }) {
  return <div className="connection-save"><span><ShieldCheck/> اطلاعات در نسخه دمو فقط روی همین مرورگر ذخیره می‌شوند.</span><button className="button button-primary" onClick={onSave}>{saved ? <CheckCircle2/> : <Save/>}{saved ? 'ذخیره شد' : label}</button></div>
}

function ConnectionHero({ icon, title, description, connected = false }: { icon: ReactNode, title: string, description: string, connected?: boolean }) {
  return <section className="card connection-hero"><div className="connection-hero-icon">{icon}</div><div><span>مرکز اتصال</span><h2>{title}</h2><p>{description}</p></div><em className={connected ? 'ready' : ''}><i/>{connected ? 'پیکربندی شده' : 'آماده پیکربندی'}</em></section>
}

export function DatabaseAdminPage() {
  const form = useStoredForm('cents:database-settings', { engine: 'postgresql', host: '', port: '5432', database: '', username: '', password: '', ssl: true, poolSize: '10' })
  const configured = Boolean(form.value.host && form.value.database && form.value.username)
  return <><PageHeader eyebrow="زیرساخت داده" title="اتصال پایگاه داده" description="مشخصات پایگاه داده اصلی را آماده کن. این پنل هنوز اتصال واقعی برقرار نمی‌کند و برای مرحله استقرار آماده شده است."/>
    <ConnectionHero icon={<Database/>} title="پایگاه داده محصول" description="PostgreSQL، MySQL یا آدرس سازگار با سرویس ابری خودت را وارد کن." connected={configured}/>
    <section className="card connection-form"><div className="form-section-title"><CloudCog/><div><h2>مشخصات اتصال</h2><p>رمز عبور بعد از استقرار باید در secret manager سرور نگه‌داری شود.</p></div></div><div className="form-grid">
      <label>نوع پایگاه داده<select value={String(form.value.engine)} onChange={(e) => form.update('engine', e.target.value)}><option value="postgresql">PostgreSQL</option><option value="mysql">MySQL</option><option value="mongodb">MongoDB</option></select></label>
      <label>نام پایگاه داده<input dir="ltr" value={String(form.value.database)} onChange={(e) => form.update('database', e.target.value)} placeholder="cents_production"/></label>
      <label>Host<input dir="ltr" value={String(form.value.host)} onChange={(e) => form.update('host', e.target.value)} placeholder="db.example.com"/></label>
      <label>Port<input dir="ltr" inputMode="numeric" value={String(form.value.port)} onChange={(e) => form.update('port', e.target.value)} /></label>
      <label>نام کاربری<input dir="ltr" value={String(form.value.username)} onChange={(e) => form.update('username', e.target.value)} placeholder="cents_admin"/></label>
      <label>رمز عبور<SecretInput value={String(form.value.password)} onChange={(value) => form.update('password', value)} placeholder="••••••••••••"/></label>
      <label>حداکثر اتصال هم‌زمان<input dir="ltr" inputMode="numeric" value={String(form.value.poolSize)} onChange={(e) => form.update('poolSize', e.target.value)}/></label>
      <label className="switch-label"><span><b>اتصال امن SSL</b><small>برای محیط production پیشنهاد می‌شود</small></span><input type="checkbox" checked={Boolean(form.value.ssl)} onChange={(e) => form.update('ssl', e.target.checked)}/></label>
    </div><SaveBar onSave={form.save} saved={form.saved}/></section></>
}

export function N8nAdminPage() {
  const form = useStoredForm('cents:n8n-settings', { webhookUrl: '', secret: '', workflowId: '', enabled: false, timeout: '30' })
  const configured = Boolean(form.value.webhookUrl)
  return <><PageHeader eyebrow="اتوماسیون" title="اتصال n8n" description="وب‌هوک تولید سؤال و جریان‌های اتوماسیون را اینجا آماده کن. تا زمان اتصال، مولد محلی فعال می‌ماند."/>
    <ConnectionHero icon={<Webhook/>} title="n8n Question Workflow" description="لینک Production Webhook را وارد کن؛ هیچ درخواستی از این نسخه ارسال نمی‌شود." connected={configured}/>
    <section className="card connection-form"><div className="form-section-title"><Zap/><div><h2>تنظیمات Webhook</h2><p>برای امنیت بهتر یک Header Secret مشترک هم تعریف کن.</p></div></div><div className="form-grid">
      <label className="full">آدرس Production Webhook<input dir="ltr" value={String(form.value.webhookUrl)} onChange={(e) => form.update('webhookUrl', e.target.value)} placeholder="https://n8n.example.com/webhook/questions"/></label>
      <label>Workflow ID<input dir="ltr" value={String(form.value.workflowId)} onChange={(e) => form.update('workflowId', e.target.value)} placeholder="question-generator"/></label>
      <label>Timeout (ثانیه)<input dir="ltr" inputMode="numeric" value={String(form.value.timeout)} onChange={(e) => form.update('timeout', e.target.value)}/></label>
      <label className="full">Webhook Secret<SecretInput value={String(form.value.secret)} onChange={(value) => form.update('secret', value)} placeholder="n8n-secret"/></label>
      <label className="switch-label full"><span><b>فعال‌سازی پس از استقرار</b><small>اکنون صرفاً ذخیره می‌شود و اتصال برقرار نیست</small></span><input type="checkbox" checked={Boolean(form.value.enabled)} onChange={(e) => form.update('enabled', e.target.checked)}/></label>
    </div><SaveBar onSave={form.save} saved={form.saved}/></section></>
}

export function AIConnectionPanel() {
  const form = useStoredForm('cents:openrouter-settings', { apiKey: '', model: 'openai/gpt-4.1-mini', baseUrl: 'https://openrouter.ai/api/v1', temperature: '0.3', enabled: false })
  const configured = Boolean(form.value.apiKey)
  return <><ConnectionHero icon={<Bot/>} title="OpenRouter برای تحلیل تعیین سطح" description="مدل فقط نتیجه قطعی آزمون را تفسیر می‌کند و در محاسبه نمره دخالت ندارد." connected={configured}/>
    <section className="card connection-form"><div className="form-section-title"><Activity/><div><h2>پیکربندی مدل</h2><p>کلید API فعلاً در مرورگر دمو ذخیره می‌شود؛ اتصال واقعی باید از سمت سرور انجام شود.</p></div></div><div className="form-grid">
      <label className="full">OpenRouter API Key<SecretInput value={String(form.value.apiKey)} onChange={(value) => form.update('apiKey', value)} placeholder="sk-or-v1-..."/></label>
      <label>مدل<input dir="ltr" value={String(form.value.model)} onChange={(e) => form.update('model', e.target.value)} /></label>
      <label>Temperature<input dir="ltr" inputMode="decimal" value={String(form.value.temperature)} onChange={(e) => form.update('temperature', e.target.value)}/></label>
      <label className="full">Base URL<input dir="ltr" value={String(form.value.baseUrl)} onChange={(e) => form.update('baseUrl', e.target.value)}/></label>
      <label className="switch-label full"><span><b>فعال‌سازی تحلیل هوشمند</b><small>پس از پیاده‌سازی اتصال امن سرور قابل استفاده است</small></span><input type="checkbox" checked={Boolean(form.value.enabled)} onChange={(e) => form.update('enabled', e.target.checked)}/></label>
    </div><SaveBar onSave={form.save} saved={form.saved}/></section></>
}

const defaultExpenses = [
  { id: 1, title: 'زیرساخت و میزبانی', category: 'فنی', amount: 12800000, date: '۱۴۰۵/۰۶/۲۰' },
  { id: 2, title: 'تولید محتوای آموزشی', category: 'محتوا', amount: 8500000, date: '۱۴۰۵/۰۶/۱۸' },
]

export function FinanceAdminPage() {
  const { orders } = useAppState()
  const form = useStoredForm('cents:zarinpal-settings', { merchantId: '', callbackUrl: '', sandbox: true, enabled: false })
  const [expenses, setExpenses] = useState(() => { try { return JSON.parse(localStorage.getItem('cents:expenses') || '') } catch { return defaultExpenses } })
  const paidIncome = orders.filter((order) => order.status === 'PAID').reduce((sum, order) => sum + order.amount, 0) + 114500000
  const totalExpenses = expenses.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0)
  const net = paidIncome - totalExpenses
  useEffect(() => localStorage.setItem('cents:expenses', JSON.stringify(expenses)), [expenses])
  const currency = useMemo(() => new Intl.NumberFormat('fa-IR'), [])
  function addExpense() { setExpenses((current: typeof defaultExpenses) => [{ id: Date.now(), title: 'هزینه جدید', category: 'سایر', amount: 0, date: new Date().toLocaleDateString('fa-IR') }, ...current]) }
  return <><PageHeader eyebrow="مدیریت مالی" title="زرین‌پال، درآمد و هزینه‌ها" description="نمای یکپارچه جریان مالی محصول؛ اعداد فعلی نمایشی‌اند و اتصال زرین‌پال هنوز فعال نشده است." action={<button className="button button-secondary" onClick={addExpense}><Plus/> ثبت هزینه</button>}/>
    <div className="stats-grid three"><StatCard label="درآمد ناخالص" value={`${currency.format(paidIncome)} تومان`} note="پرداخت‌های موفق" icon={<CircleDollarSign/>}/><StatCard label="هزینه‌ها" value={`${currency.format(totalExpenses)} تومان`} note={`${expenses.length.toLocaleString('fa-IR')} ردیف هزینه`} icon={<ReceiptText/>}/><StatCard label="خالص جریان مالی" value={`${currency.format(net)} تومان`} note="درآمد منهای هزینه" icon={<WalletCards/>}/></div>
    <ConnectionHero icon={<WalletCards/>} title="درگاه پرداخت زرین‌پال" description="Merchant ID و Callback URL را برای اتصال آینده آماده کن." connected={Boolean(form.value.merchantId)}/>
    <section className="card connection-form compact"><div className="form-grid"><label>Merchant ID<SecretInput value={String(form.value.merchantId)} onChange={(value) => form.update('merchantId', value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/></label><label>Callback URL<input dir="ltr" value={String(form.value.callbackUrl)} onChange={(e) => form.update('callbackUrl', e.target.value)} placeholder="https://example.com/payment/verify"/></label><label className="switch-label"><span><b>حالت Sandbox</b><small>برای تست پرداخت</small></span><input type="checkbox" checked={Boolean(form.value.sandbox)} onChange={(e) => form.update('sandbox', e.target.checked)}/></label><label className="switch-label"><span><b>فعال‌سازی درگاه</b><small>پس از اتصال backend</small></span><input type="checkbox" checked={Boolean(form.value.enabled)} onChange={(e) => form.update('enabled', e.target.checked)}/></label></div><SaveBar onSave={form.save} saved={form.saved} label="ذخیره زرین‌پال"/></section>
    <section className="card finance-table"><div className="panel-title"><div><h2>دفتر هزینه‌ها</h2><p>برای ویرایش سریع، مقدار عنوان و مبلغ را مستقیم تغییر بده.</p></div></div><div className="table-card embedded"><table><thead><tr><th>شرح</th><th>دسته</th><th>مبلغ</th><th>تاریخ</th></tr></thead><tbody>{expenses.map((item: { id: number, title: string, category: string, amount: number, date: string }, index: number) => <tr key={item.id}><td><input value={item.title} onChange={(e) => setExpenses((current: typeof defaultExpenses) => current.map((row, rowIndex) => rowIndex === index ? { ...row, title: e.target.value } : row))}/></td><td>{item.category}</td><td><input className="money-input" dir="ltr" type="number" value={item.amount} onChange={(e) => setExpenses((current: typeof defaultExpenses) => current.map((row, rowIndex) => rowIndex === index ? { ...row, amount: Number(e.target.value) } : row))}/> تومان</td><td>{item.date}</td></tr>)}</tbody></table></div></section>
  </>
}
