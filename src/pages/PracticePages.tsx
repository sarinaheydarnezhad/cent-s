import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { cent, type ExamAttempt } from '../services/cent'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import type { AnswerMap } from '../types'
import { studyReturnPath } from '../services/study-return'
import { ExamExperience } from '../components/ExamExperience'
import { ReviewedAssessmentPicker } from '../components/ReviewedAssessmentPicker'
export { CentResultPage, CentSimulatorsPage } from './AssessmentResults'
export { PersonalResults as CentResultsPage } from './PersonalResults'

export { StudentDashboard as CentDashboard } from './StudentDashboard'

export function CentExamPage({ kind = 'diagnostic' }: { kind?: 'diagnostic' | 'simulator' | 'practice' }) {
  const { user, loading, setDiagnostic } = useAppState()
  const [params] = useSearchParams()
  const assessment = kind === 'practice' ? params.get('assessment') : null
  const returnToStudy = studyReturnPath(params.get('returnTo'))
  const catalog = useRemote(cent.curriculum)
  const [course, setCourse] = useState(params.get('course') || '')
  const [topic, setTopic] = useState(params.get('topic') || '')
  const storageKey = `cent:exam:${user?.id}:${kind}:${course}:${topic}${assessment ? ':' + assessment : ''}`
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(3600)
  const requestId = useRef(crypto.randomUUID())
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => { if (!active) return; try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as { attempt: ExamAttempt; answers: AnswerMap } | null
      if (saved && Date.parse(saved.attempt.expiresAt) > Date.now()) { setAttempt(saved.attempt); setAnswers(saved.answers) }
      else sessionStorage.removeItem(storageKey)
    } catch { try { sessionStorage.removeItem(storageKey) } catch { /* Storage is optional for legacy Practice. */ } }
    })
    return () => { active = false }
  }, [storageKey])
  useEffect(() => { if (attempt) sessionStorage.setItem(storageKey, JSON.stringify({ attempt, answers })) }, [attempt, answers, storageKey])
  useEffect(() => {
    if (!attempt) return
    const tick = () => setRemaining(Math.max(0, Math.floor((Date.parse(attempt.expiresAt) - Date.now()) / 1000)))
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer)
  }, [attempt])
  if (loading) return <LoadState busy error="" retry={() => {}}/>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }}/>
  async function start() {
    setBusy(true); setError('')
    try { setAttempt(assessment ? await cent.startReviewedAssessment(assessment, requestId.current) : await cent.startExam(kind, requestId.current, course || undefined, topic || undefined)); setIndex(0); setAnswers({}) }
    catch (e) { setError(e instanceof Error ? e.message : 'آزمون آماده نشد.') } finally { setBusy(false) }
  }
  async function submit() {
    if (!attempt) return
    setBusy(true); setError('')
    try {
      const outcome = await cent.submitExam(attempt.id, answers)
      setDiagnostic(outcome.result, outcome.analysis)
      sessionStorage.removeItem(storageKey)
      navigate(`/student/results/${attempt.id}${returnToStudy ? `?returnTo=${encodeURIComponent(returnToStudy)}` : ''}`)
    } catch (e) { setError(e instanceof Error ? e.message : 'ثبت نتیجه انجام نشد؛ پاسخ‌هایت حفظ شده‌اند.'); setBusy(false) }
  }
  return <>{kind === 'practice' && !attempt && !assessment && <ReviewedAssessmentPicker/>}<ExamExperience kind={kind} returnToStudy={returnToStudy} catalog={catalog} course={course} setCourse={setCourse} topic={topic} setTopic={setTopic} configurationChanged={() => { requestId.current = crypto.randomUUID() }} attempt={attempt} answers={answers} setAnswers={setAnswers} index={index} setIndex={setIndex} busy={busy} error={error} remaining={remaining} start={start} submit={submit} restart={() => { sessionStorage.removeItem(storageKey); requestId.current = crypto.randomUUID(); setAttempt(null) }}/></>
}
