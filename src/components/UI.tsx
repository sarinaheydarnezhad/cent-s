import type { ReactNode } from 'react'

export function ProgressBar({ value, tone = 'primary' }: { value: number, tone?: 'primary' | 'success' | 'warning' | 'danger' }) {
  return <div className="progress-track" aria-label={`${value} درصد`}><span className={`progress-value ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
}

export function StatCard({ label, value, note, icon }: { label: string, value: string | number, note?: string, icon?: ReactNode }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div></div>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string, title: string, description?: string, action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

export function EmptyState({ title, description, action }: { title: string, description: string, action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-illustration">○</div><h3>{title}</h3><p>{description}</p>{action}</div>
}
