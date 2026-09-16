import { AlertCircle, ArrowLeft, ArrowRight, Check, Clock3, Flag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { diagnosticQuestions, difficultyLabels, subjectLabels } from '../../data/questions'
import { api } from '../../services/api'
import { getStrengthsAndWeaknesses, scoreAttempt } from '../../services/scoring'
import { useAppState } from '../../state/AppState'
import type { AIAnalysis, AnswerMap } from '../../types'

function localFallback(result: ReturnType<typeof scoreAttempt>): AIAnalysis {
  const { strengths, weaknesses } = getStrengthsAndWeaknesses(result)
  return {
    overallAssessment: 'نتیجه شما با موفقیت محاسبه شد. برای تحلیل دقیق‌تر، مباحث کم‌امتیاز را پیش از ورود به تمرین‌های دشوار مرور کنید.',
    strengths: strengths.length ? strengths : ['تکمیل ارزیابی اولیه'], weaknesses: weaknesses.length ? weaknesses : ['برای تشخیص دقیق‌تر به تمرین بیشتر نیاز است'],
    priorityTopics: weaknesses.slice(0, 3), recommendedStudyAreas: weaknesses.slice(0, 3).map((x) => `مرور و تمرین ${x}`),
    suggestedNextStep: weaknesses[0] ? `مطالعه را با مبحث «${weaknesses[0]}» شروع کنید.` : 'یک تمرین ترکیبی سطح متوسط انجام دهید.',
    personalizedExplanation: 'سرویس تحلیل آنلاین در دسترس نبود؛ این پیشنهاد از قواعد قطعی داخل برنامه ساخته شده است.', provider: 'fallback', status: 'COMPLETED',
  }
}

export function DiagnosticTestPage() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [seconds, setSeconds] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setDiagnostic } = useAppState()
  const question = diagnosticQuestions[index]
  const answered = useMemo(() => Object.values(answers).filter((x) => x !== null && x !== undefined).length, [answers])

  useEffect(() => { const timer = window.setInterval(() => setSeconds((x) => x + 1), 1000); return () => clearInterval(timer) }, [])

  async function submit() {
    if (submitting) return
    setSubmitting(true); setError('')
    let limits: {minScore?:number,maxScore?:number,negative?:boolean} | undefined
    try { limits = JSON.parse(localStorage.getItem('cents:scoring-limits') || '') } catch { limits = undefined }
    const result = scoreAttempt(diagnosticQuestions, answers, limits)
    try {
      const analysis = await api.analyze(result)
      setDiagnostic(result, analysis)
    } catch {
      setDiagnostic(result, localFallback(result))
    }
    navigate('/diagnostic/results')
  }

  return <div className="test-page">
    <div className="test-topbar container"><div><b>تعیین سطح Cent-s</b><span>ریاضیات و منطق</span></div><div className="test-time"><Clock3/> {String(Math.floor(seconds / 60)).padStart(2,'0')}:{String(seconds % 60).padStart(2,'0')}</div></div>
    <div className="container test-layout">
      <aside className="question-map card"><div className="map-head"><b>وضعیت پاسخ‌ها</b><span>{answered} از {diagnosticQuestions.length}</span></div><div className="question-dots">{diagnosticQuestions.map((q, i) => <button key={q.id} onClick={() => setIndex(i)} className={`${i === index ? 'current' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}>{i + 1}</button>)}</div><div className="map-legend"><span><i className="answered"/> پاسخ داده</span><span><i className="current"/> سؤال فعلی</span></div></aside>
      <main className="question-card card">
        <div className="question-meta"><span>سؤال {index + 1} از {diagnosticQuestions.length}</span><div><em>{subjectLabels[question.subject]}</em><em>{question.topic}</em><em>{difficultyLabels[question.difficulty]}</em></div></div>
        <div className="test-progress"><i style={{width:`${((index + 1) / diagnosticQuestions.length) * 100}%`}} /></div>
        <h2>{question.text}</h2>
        <div className="options-list">{question.options.map((option, optionIndex) => <button key={option} className={answers[question.id] === optionIndex ? 'selected' : ''} onClick={() => setAnswers((current) => ({...current, [question.id]: optionIndex}))}><span>{['الف','ب','ج','د'][optionIndex]}</span><b>{option}</b>{answers[question.id] === optionIndex && <Check/>}</button>)}</div>
        {error && <div className="inline-error"><AlertCircle/>{error}</div>}
        <div className="question-actions"><button className="button button-ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowRight/> قبلی</button>{index < diagnosticQuestions.length - 1 ? <button className="button button-primary" onClick={() => setIndex(index + 1)}>بعدی <ArrowLeft/></button> : <button className="button button-primary" onClick={submit} disabled={submitting}><Flag/> {submitting ? 'در حال تحلیل…' : 'پایان و مشاهده نتیجه'}</button>}</div>
      </main>
    </div>
  </div>
}
