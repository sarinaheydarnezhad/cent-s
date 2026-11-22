import { useId, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
  loadingLabel?: string
}

export function Button({ variant = 'primary', size = 'medium', fullWidth, loading, loadingLabel = 'در حال انجام…', disabled, type = 'button', className = '', children, ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={`button button-${variant} button-${size}${fullWidth ? ' button-block' : ''} ${className}`}>
    <span className="button-content"><span className="button-label" aria-hidden={loading || undefined}>{children}</span>{loading !== undefined && <span className="button-loading" aria-hidden={!loading}><span className="cent-spinner" aria-hidden="true"/>{loadingLabel}</span>}</span>
  </button>
}

export function IconButton({ label, children, ...props }: Omit<ButtonProps, 'children' | 'loadingLabel' | 'fullWidth'> & { label: string; children: ReactNode }) {
  return <Button {...props} aria-label={label} loadingLabel={label} className={`icon-button ${props.className || ''}`}>{children}</Button>
}

export function Card({ variant = 'standard', className = '', children, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: 'standard' | 'outlined' | 'elevated' | 'recommendation' | 'learning' | 'selected' }) {
  return <div {...props} className={`card ui-card ui-card-${variant} ${className}`}>{children}</div>
}

// A whole-card action must contain content only; put secondary controls outside it.
export function ActionCard({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} type={props.type || 'button'} className={`card ui-card ui-card-interactive ${className}`}>{children}</button>
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'learning' | 'recommendation' | 'success' | 'warning' | 'error' | 'info'; children: ReactNode }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>
}

export function FilterGroup<T extends string>({ label, value, options, onChange, disabled, className = '' }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; disabled?: boolean; className?: string }) {
  return <div role="group" aria-label={label} className={`ui-filter-group ${className}`}>{options.map(option => <button type="button" key={option.value} disabled={disabled} aria-pressed={value === option.value} className={value === option.value ? 'active' : ''} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>
}

const noticeIcons = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert }
export function Notice({ tone = 'info', title, children, action, live = 'off', className = '' }: { tone?: keyof typeof noticeIcons; title?: string; children: ReactNode; action?: ReactNode; live?: 'off' | 'polite' | 'assertive'; className?: string }) {
  const Icon = noticeIcons[tone]
  return <div className={`ui-notice ui-notice-${tone} ${className}`} role={live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined}>
    <Icon size={20} aria-hidden="true"/><div>{title && <strong>{title}</strong>}<div>{children}</div>{action && <div className="ui-notice-action">{action}</div>}</div>
  </div>
}

export function StatusMessage({ children }: { children: ReactNode }) {
  return <p className="ui-status" role="status" aria-live="polite" aria-atomic="true">{children}</p>
}

export function LoadingState({ label = 'داریم اطلاعات رو بارگذاری می‌کنیم…' }: { label?: string }) {
  return <div className="cent-loading" role="status"><span className="cent-spinner" aria-hidden="true"/>{label}</div>
}

export function Skeleton({ label = 'داریم اطلاعات رو بارگذاری می‌کنیم…', lines = 3 }: { label?: string; lines?: number }) {
  return <div role="status" className="ui-skeleton"><span className="sr-only">{label}</span><div aria-hidden="true">{Array.from({ length: Math.max(1, Math.min(8, lines)) }, (_, i) => <span key={i}/>)}</div></div>
}

export function ProgressBar({ value, tone = 'primary', label = 'پیشرفت', valueText }: { value: number; tone?: 'primary' | 'learning' | 'action' | 'success' | 'warning' | 'danger'; label?: string; valueText?: string }) {
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized} aria-valuetext={valueText || `${normalized} درصد`}><span className={`progress-value ${tone}`} style={{ width: `${normalized}%` }} /></div>
}

export function StatCard({ label, value, note, icon }: { label: string, value: string | number, note?: string, icon?: ReactNode }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div></div>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string, title: string, description?: string, action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

export function EmptyState({ title, description, action, kind = 'empty' }: { title: string; description: string; action?: ReactNode; kind?: 'empty' | 'search' | 'unavailable' | 'restricted' }) {
  const id = useId()
  return <section className={`empty-state ui-empty-${kind}`} aria-labelledby={id}><div className="empty-illustration" aria-hidden="true">{kind === 'search' ? '⌕' : kind === 'restricted' ? '◇' : '○'}</div><h3 id={id}>{title}</h3><p>{description}</p>{action}</section>
}
