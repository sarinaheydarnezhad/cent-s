import { Link } from 'react-router-dom'
import { AppearanceControl } from '../../components/AppearanceControl'
import { Brand } from '../../components/Brand'
export function NotFoundPage() {
  return <div className="public-standalone"><header className="container public-standalone-header"><Brand/><AppearanceControl/></header><main className="container public-not-found"><span className="public-error-code" aria-hidden="true">۴۰۴</span><h1>این صفحه پیدا نشد.</h1><p>ممکنه آدرس تغییر کرده باشه یا صفحه دیگه در دسترس نباشه. می‌تونی از صفحه اصلی، مسیرت رو پیدا کنی.</p><Link className="button button-primary" to="/">بازگشت به صفحه اصلی</Link></main></div>
}
