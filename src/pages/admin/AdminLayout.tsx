import { useCallback, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, CreditCard, FileChartColumn, Gauge, LogOut, Menu, Settings, ShieldCheck, Users, X } from 'lucide-react'
import { Brand } from '../../components/Brand'
import { AppearanceControl } from '../../components/AppearanceControl'
import { useNavigationDisclosure } from '../../components/useNavigationDisclosure'
import { LoadState, useRemote } from '../../components/CentUI'
import { Notice } from '../../components/UI'
import { useAppState } from '../../state/AppState'
import { admin, adminPermission, roleLabel, type Permission } from '../../services/admin'

const navigation = [
  ['/admin', 'نمای کلی', 'overview', Gauge], ['/admin/users', 'کاربران', 'users', Users],
  ['/admin/resources', 'منابع آموزشی', 'content', BookOpen], ['/admin/content', 'نقشه محتوا', 'content', ClipboardList],
  ['/admin/assessments', 'آزمون‌ها', 'exams', ClipboardList], ['/admin/questions', 'بانک سؤال', 'exams', BookOpen],
  ['/admin/orders', 'سفارش‌ها و پرداخت‌ها', 'finance', CreditCard], ['/admin/subscriptions', 'اشتراک‌ها', 'finance', ClipboardList],
  ['/admin/packages', 'محصولات', 'finance', CreditCard], ['/admin/reports', 'گزارش‌ها', 'roles', FileChartColumn],
  ['/admin/roles', 'نقش‌ها و دسترسی', 'roles', ShieldCheck], ['/admin/settings', 'تنظیمات', 'settings', Settings],
] as const

export function AdminLayout() {
  const location = useLocation(), navigate = useNavigate()
  const { user, logout } = useAppState()
  const { open, trigger, panel, close, setOpen } = useNavigationDisclosure({ focusOnOpen: true })
  const loadAccess = useCallback(() => { void location.pathname; return admin.access() }, [location.pathname])
  const access = useRemote(loadAccess)
  const reloadAccess = access.reload
  useEffect(() => { const refresh = () => reloadAccess(); window.addEventListener('focus', refresh); return () => window.removeEventListener('focus', refresh) }, [reloadAccess])
  const heading = navigation.find(([path]) => location.pathname === path)?.[1] || 'مدیریت ایتاتست'
  const allowed = access.data?.permissions.includes(adminPermission(location.pathname))
  return <div className="admin-app" dir="rtl">
    <a className="admin-skip" href="#admin-main">رفتن به محتوای مدیریت</a>
    <aside id="admin-navigation" ref={panel} className={`admin-sidebar${open ? ' is-open' : ''}`}>
      <div className="admin-brand"><Brand/><button type="button" className="icon-button admin-mobile" aria-label="بستن منو" onClick={close}><X/></button></div>
      <div className="admin-workspace"><ShieldCheck size={18}/><span>مدیریت ایتاتست<small>{roleLabel(access.data?.role || user?.role || '')}</small></span></div>
      <nav aria-label="ناوبری مدیریت">{navigation.filter(([, , permission]) => access.data?.permissions.includes(permission as Permission)).map(([path, label, , Icon]) => <NavLink key={path} to={path} end={path === '/admin'} onClick={close}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="admin-sidebar-footer"><Link to="/">نمای عمومی سایت</Link><button type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }}><LogOut size={18}/>خروج از حساب</button></div>
    </aside>
    <div className="admin-body"><header className="admin-header"><button type="button" ref={trigger} className="icon-button admin-mobile" aria-label="نمایش منو" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(true)}><Menu/></button><div><small>مدیریت / {heading}</small><strong>{heading}</strong></div><div className="admin-account"><AppearanceControl/><details><summary aria-label="منوی حساب مدیر"><span className="avatar" aria-hidden="true">{user?.name?.slice(0, 1)}</span><span>{user?.name}</span></summary><div><p>{roleLabel(access.data?.role || '')}</p><button type="button" className="button button-secondary" onClick={() => { logout(); navigate('/login', { replace: true }) }}>خروج از حساب</button></div></details></div></header>
    <main id="admin-main" tabIndex={-1} className="admin-main"><LoadState {...access} retry={access.reload}/>{access.data && (allowed ? <Outlet context={access.data}/> : <Notice tone="warning" live="assertive">مجوز مشاهده این بخش را ندارید. از منوی مدیریت بخش مجاز را انتخاب کنید.</Notice>)}</main></div>
  </div>
}
