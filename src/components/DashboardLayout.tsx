import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, BrainCircuit, ChevronLeft, CircleUserRound, ClipboardCheck, Database, Gauge, Layers3, LayoutDashboard, LogOut, Menu, Package, Sparkles, Users, WalletCards, Webhook, X } from 'lucide-react'
import { Brand } from './Brand'
import { useAppState } from '../state/AppState'

const studentItems = [
  ['/student', 'داشبورد', LayoutDashboard],
  ['/student/preparation', 'آمادگی من', BookOpen],
  ['/student/results', 'نتایج من', BarChart3],
  ['/student/analysis', 'تحلیل شخصی', BrainCircuit],
  ['/student/content', 'محتوای پکیج', Layers3],
  ['/student/simulators', 'آزمون‌های شبیه‌ساز', ClipboardCheck],
  ['/student/profile', 'پروفایل', CircleUserRound],
] as const

const adminItems = [
  ['/admin', 'داشبورد', Gauge], ['/admin/users', 'کاربران', Users], ['/admin/diagnostics', 'تعیین سطح و سؤال‌ها', ClipboardCheck],
  ['/admin/simulators', 'آزمون‌های شبیه‌ساز', Layers3], ['/admin/packages', 'پکیج‌ها', Package],
  ['/admin/content', 'محتوا و مباحث', BookOpen], ['/admin/ai', 'هوش مصنوعی', Sparkles],
  ['/admin/n8n', 'اتصال n8n', Webhook], ['/admin/database', 'اتصال پایگاه داده', Database],
  ['/admin/finance', 'زرین‌پال و مالی', WalletCards],
] as const

export function DashboardLayout({ mode }: { mode: 'student' | 'admin' }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAppState()
  const navigate = useNavigate()
  const items = mode === 'admin' ? adminItems : studentItems
  return <div className={`dashboard-shell ${mode}`}>
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <div className="sidebar-head"><Brand light /><button className="icon-button mobile-only" onClick={() => setOpen(false)}><X /></button></div>
      <div className="demo-badge">نسخه دمو</div>
      <nav className="side-nav">
        {items.map(([path, label, Icon]) => <NavLink key={path} to={path} end={path === `/${mode}`} onClick={() => setOpen(false)}><Icon size={19}/><span>{label}</span><ChevronLeft className="side-arrow" size={15}/></NavLink>)}
      </nav>
      <button className="logout-button" onClick={() => { logout(); navigate('/') }}><LogOut size={18}/> خروج از حساب دمو</button>
    </aside>
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <button className="icon-button mobile-only" onClick={() => setOpen(true)}><Menu /></button>
        <div><strong>{mode === 'admin' ? 'پنل مدیریت Cent-s' : `سلام ${user?.name?.split(' ')[0] || ''} 👋`}</strong><small>{mode === 'admin' ? 'مدیریت نسخه تمرینی محصول' : 'امروز یک قدم به آمادگی بیشتر نزدیک شو'}</small></div>
        <div className="avatar">{user?.name?.slice(0, 1)}</div>
      </header>
      <main className="dashboard-content"><Outlet /></main>
    </div>
  </div>
}
