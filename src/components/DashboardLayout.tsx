import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, BrainCircuit, ChevronLeft, CircleUserRound, ClipboardCheck, Gauge, Layers3, LayoutDashboard, LogOut, Menu, Package, Users, WalletCards, X } from 'lucide-react'
import { Brand } from './Brand'
import { AppearanceControl } from './AppearanceControl'
import { useAppState } from '../state/AppState'
import { useNavigationDisclosure } from './useNavigationDisclosure'

const studentItems = [
  ['/student', 'داشبورد', LayoutDashboard],
  ['/student/preparation', 'آمادگی من', BookOpen],
  ['/student/results', 'نتایج من', BarChart3],
  ['/student/analysis', 'تحلیل شخصی', BrainCircuit],
  ['/student/content', 'کتابخانه من', Layers3],
  ['/student/notes', 'یادداشت‌های من', BookOpen],
  ['/student/simulators', 'آزمون‌های شبیه‌ساز', ClipboardCheck],
  ['/student/profile', 'پروفایل', CircleUserRound],
] as const

const adminItems = [
  ['/admin', 'داشبورد', Gauge], ['/admin/users', 'کاربران', Users], ['/admin/diagnostics', 'تعیین سطح و سؤال‌ها', ClipboardCheck],
  ['/admin/simulators', 'آزمون‌های شبیه‌ساز', Layers3], ['/admin/packages', 'پکیج‌ها', Package],
  ['/admin/content', 'آموزش‌ها و PDF', BookOpen],
  ['/admin/finance', 'زرین‌پال و مالی', WalletCards],
] as const

export function DashboardLayout({ mode }: { mode: 'student' | 'admin' }) {
  const { open, setOpen, trigger, panel, close } = useNavigationDisclosure({ focusOnOpen: true })
  const { user, logout } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  const items = mode === 'admin' ? adminItems : studentItems
  const heading = [...studentItems].reverse().find(([path]) => location.pathname === path || location.pathname.startsWith(`${path}/`))?.[1] || 'فضای یادگیری'
  return <div className={`dashboard-shell ${mode}`}>
    {mode === 'student' && <a className="student-skip-link" href="#student-main">رفتن به محتوای صفحه</a>}
    <aside ref={panel} id="dashboard-navigation" className={open ? 'sidebar open' : 'sidebar'}>
      <div className="sidebar-head"><Brand light={mode === 'admin'} /><button type="button" aria-label="بستن منو" className="icon-button mobile-only" onClick={close}><X aria-hidden="true"/></button></div>
      <div className="demo-badge">فضای یادگیری ایتاتست</div>
      <nav className="side-nav" aria-label={mode === 'admin' ? 'ناوبری مدیریت' : 'ناوبری یادگیری'}>
        {items.map(([path, label, Icon]) => <NavLink key={path} to={path} end={path === `/${mode}`} onClick={() => setOpen(false)}><Icon size={19} aria-hidden="true"/><span>{label}</span>{mode === 'admin' && <ChevronLeft className="side-arrow" size={15} aria-hidden="true"/>}</NavLink>)}
      </nav>
      <button className="logout-button" onClick={() => { logout(); navigate('/') }}><LogOut size={18}/> خروج از حساب</button>
    </aside>
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <button ref={trigger} type="button" aria-label="نمایش منو" aria-expanded={open} aria-controls="dashboard-navigation" className="icon-button mobile-only" onClick={() => setOpen(true)}><Menu aria-hidden="true"/></button>
        <div><strong>{mode === 'admin' ? 'پنل مدیریت ایتاتست' : heading}</strong><small>{mode === 'admin' ? 'آموزش، محتوا و خریدهای ایتاتست' : 'یاد بگیر، اونطور که خودت راحتی'}</small></div>
        <AppearanceControl />
        {mode === 'student' ? <Link className="student-account-access" to="/student/profile" aria-label={`حساب کاربری ${user?.name || ''}`}><span className="avatar" aria-hidden="true">{user?.name?.slice(0, 1)}</span><span className="student-account-name">{user?.name}</span></Link> : <div className="avatar">{user?.name?.slice(0, 1)}</div>}
      </header>
      <main id={mode === 'student' ? 'student-main' : undefined} tabIndex={mode === 'student' ? -1 : undefined} className="dashboard-content"><Outlet /></main>
    </div>
  </div>
}
