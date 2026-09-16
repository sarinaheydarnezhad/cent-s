import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Brand } from './Brand'
import { useAppState } from '../state/AppState'

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user } = useAppState()
  return <div className="site-shell">
    <header className="public-header">
      <div className="container header-inner">
        <Brand />
        <button className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-label="نمایش منو">{open ? <X /> : <Menu />}</button>
        <nav className={open ? 'public-nav open' : 'public-nav'} onClick={() => setOpen(false)}>
          <NavLink to="/exam">آشنایی با آزمون</NavLink>
          <NavLink to="/diagnostic/intro">تعیین سطح</NavLink>
          <NavLink to="/package">پکیج آمادگی</NavLink>
          <Link className="button button-ghost button-small" to={user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/login'}>{user ? 'ورود به پنل' : 'ورود / ثبت‌نام'}</Link>
        </nav>
      </div>
    </header>
    <main className="public-route" key={location.pathname}><Outlet /></main>
    <footer className="footer">
      <div className="container footer-grid">
        <Brand light />
        <p>نسخه تمرینی محصول آمادگی آزمون. اطلاعات رسمی آزمون باید همواره از منبع رسمی بررسی شود.</p>
        <div><Link to="/exam">راهنمای آزمون</Link><Link to="/package">پکیج آمادگی</Link><Link to="/login">ورود دمو</Link></div>
      </div>
    </footer>
  </div>
}
