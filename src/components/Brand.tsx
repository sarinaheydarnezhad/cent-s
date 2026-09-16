import { Link } from 'react-router-dom'

export function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Cent-s">
    <span className="brand-mark">C</span>
    <span><b>Cent-s</b><small>مسیر آمادگی هدفمند</small></span>
  </Link>
}
