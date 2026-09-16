import { BookOpenCheck, ClipboardCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function JourneyNav() {
  return <nav className="journey-nav" aria-label="مراحل مسیر آمادگی">
    <NavLink to="/diagnostic/intro"><span><ClipboardCheck/></span><div><small>مرحله اول</small><b>تعیین سطح</b></div></NavLink>
    <i/>
    <NavLink to="/package"><span><BookOpenCheck/></span><div><small>مرحله دوم</small><b>پکیج آمادگی</b></div></NavLink>
  </nav>
}
