import { Link } from 'react-router-dom'

export function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="ایتاتست — صفحه اصلی">
    <span className="brand-mark" aria-hidden="true"><img className="brand-symbol-light" src={`${import.meta.env.BASE_URL}brand/symbol.svg`} alt=""/><img className="brand-symbol-dark" src={`${import.meta.env.BASE_URL}brand/symbol-dark.svg`} alt=""/></span>
    <span><b lang="en" dir="ltr">Itatest</b><small>سردرگم نمون، هدفمند بخون.</small></span>
  </Link>
}
