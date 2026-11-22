import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Atom, BookOpen, BrainCircuit, Calculator, Dna, FlaskConical, Route } from 'lucide-react'
import type { AIAnalysis } from '../types'
import type { Curriculum } from '../services/cent'
import { assessmentText } from '../services/assessment-presentation'
import { Badge, Card, Notice, Skeleton } from './UI'

export function SubjectIcon({ code }: { code: string }) {
  const Icon = ({ math: Calculator, logic: BrainCircuit, biology: Dna, chemistry: FlaskConical, physics: Atom } as Record<string, typeof BookOpen>)[code] || BookOpen
  return <span className="assessment-subject-icon"><Icon aria-hidden="true"/></span>
}

export function AssessmentHero({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <header className="assessment-hero"><div><span className="eyebrow">مسیر یادگیری تو</span><h1>{title}</h1><p>{description}</p>{children}</div><span className="assessment-hero-art" aria-hidden="true"><BookOpen/><span/></span></header>
}

export function AssessmentSkeleton({ label }: { label: string }) {
  return <div className="assessment-loading"><Skeleton label={label} lines={4}/><Skeleton label="در حال دریافت جزئیات…" lines={3}/></div>
}

export function ResultRing({ value }: { value: number }) {
  return <div className="assessment-score-ring" style={{ '--score': `${value}%` } as CSSProperties}><strong>{value}<small>٪</small></strong><span>پاسخ صحیح</span></div>
}

// Suppress an unresolved identifier rather than guessing its student-facing name.
export function TopicLabel({ value, curriculum }: { value: string; curriculum: Curriculum | null }) {
  return <span dir="auto">{assessmentText(value, curriculum) ?? 'نام مبحث در دسترس نیست'}</span>
}

export function AssessmentGuidance({ analysis, curriculum, href = '/student/content', action = 'رفتن به مطالعه' }: { analysis: AIAnalysis; curriculum: Curriculum | null; href?: string; action?: string }) {
  const guidance = assessmentText(analysis.suggestedNextStep, curriculum)
  const explanation = assessmentText(analysis.personalizedExplanation, curriculum)
  return <Card variant="recommendation" className="assessment-guidance"><div className="assessment-section-title"><Route aria-hidden="true"/><h2>قدم بعدی تو</h2><Badge tone="learning">براساس همین نتیجه</Badge></div>
    {analysis.status === 'FAILED' && <Notice tone="warning">راهنمایی این نتیجه کامل نشده؛ پاسخ‌ها و نتیجه ثبت‌شده‌ات در دسترسه.</Notice>}
    {guidance && <p dir="auto">{guidance}</p>}
    <div className="assessment-priorities">{analysis.priorityTopics.map((value, i) => <Badge tone="learning" key={`${value}-${i}`}><TopicLabel value={value} curriculum={curriculum}/></Badge>)}</div>
    {guidance === null && <p>نام بعضی مباحث پیشنهادی فعلاً در دسترس نیست. می‌تونی از کتابخانه به مطالعه ادامه بدی.</p>}
    {explanation && <p className="assessment-muted" dir="auto">{explanation}</p>}
    {guidance === '' && <p>برای این نتیجه، پیشنهاد متنی در دسترس نیست.</p>}
    <Link className="button button-primary" to={href}>{action}</Link>
  </Card>
}
