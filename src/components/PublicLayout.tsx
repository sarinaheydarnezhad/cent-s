import { isAdminRole } from '../services/admin'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Brand } from './Brand'
import { AppearanceControl } from './AppearanceControl'
import { useAppState } from '../state/AppState'
import { useNavigationDisclosure } from './useNavigationDisclosure'

export function PublicLayout() {
  const { open, setOpen, trigger, panel } = useNavigationDisclosure({ focusOnOpen: true })
  const location = useLocation()
  const { user } = useAppState()
  return <div className="site-shell">
    <a className="public-skip-link" href="#public-main">رفتن به محتوای صفحه</a>
    <header className="public-header">
      <div className="container header-inner">
        <Brand />
        <nav ref={panel} id="public-navigation" aria-label="ناوبری اصلی" className={open ? 'public-nav open' : 'public-nav'} onClick={() => setOpen(false)}>
          <NavLink to="/" end>خانه</NavLink>
          <NavLink to="/exam">آشنایی با آزمون</NavLink>
          <NavLink to="/diagnostic/intro">تعیین سطح</NavLink>
          <NavLink to="/package">آموزش‌ها و اشتراک</NavLink>
          <Link className="button button-secondary button-small public-account-link" to={user ? (isAdminRole(user.role) ? '/admin' : '/student') : '/login'}>{user ? 'ورود به پنل' : 'ورود / ثبت‌نام'}</Link>
        </nav>
        <AppearanceControl />
        <button ref={trigger} type="button" className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-label={open ? 'بستن منو' : 'نمایش منو'} aria-expanded={open} aria-controls="public-navigation">{open ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</button>
      </div>
    </header>
    <main id="public-main" tabIndex={-1} className="public-route" key={location.pathname}><Outlet /></main>
    <footer className="footer">
      <div className="container footer-grid">
        <div className="public-footer-brand"><Brand light /><p>همراه تو برای شناخت مباحث، مطالعه و تمرین؛ یک قدم روشن‌تر در مسیر آمادگی آزمون.</p></div>
        <nav aria-label="دسترسی‌های پایین صفحه"><h2>مسیر آمادگی</h2><Link to="/exam">راهنمای آزمون</Link><Link to="/diagnostic/intro">ارزیابی سطح</Link><Link to="/package">آموزش‌ها و اشتراک</Link></nav>
        <div className="public-footer-about"><h2>شفاف و روشن</h2><p>مسیر فعلی ایتاتست برای <bdi lang="en">CEnT-S</bdi> در دسترسه. اطلاعات رسمی آزمون رو از منبع برگزارکننده بررسی کن.</p><Link to={user ? (isAdminRole(user.role) ? '/admin' : '/student') : '/login'}>{user ? 'ورود به پنل' : 'ورود به حساب / ثبت‌نام'}</Link></div>
      </div>
      <div className="container public-footer-bottom"><span lang="en" dir="ltr">Itatest</span><span>سردرگم نمون، هدفمند بخون.</span></div>
    </footer>
  </div>
}
