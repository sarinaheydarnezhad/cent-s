import { ArrowLeft, BrainCircuit, CheckCircle2, RotateCcw, Sparkles, Target, TriangleAlert } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { ProgressBar } from '../../components/UI'
import { subjectLabels } from '../../data/questions'
import { useAppState } from '../../state/AppState'

export function DiagnosticResultsPage() {
  const { diagnosticResult: result, aiAnalysis: analysis } = useAppState()
  if (!result || !analysis) return <Navigate to="/diagnostic/intro" replace />
  const ringStyle = { background: `conic-gradient(var(--primary) ${result.percentage * 3.6}deg, #e8edf2 0deg)` }
  const strengths = analysis.strengths.length ? analysis.strengths : ['پشتکار در تکمیل ارزیابی', 'آمادگی برای شروع یک برنامه هدفمند']
  const weaknesses = analysis.weaknesses.length ? analysis.weaknesses : ['برای تشخیص دقیق‌تر، تمرین‌های بیشتری انجام بده', 'مرور ترکیبی مباحث پیشنهاد می‌شود']
  return <div className="results-page">
    <section className="results-hero"><div className="container results-summary"><div><span className="pill light"><Sparkles/> تحلیل تو آماده است</span><h1>نقشه شروع تو روشن‌تر شد.</h1><p>{analysis.overallAssessment}</p></div><div className="score-ring" style={ringStyle}><div><strong>{result.percentage}</strong><span>درصد کل</span></div></div></div></section>
    <div className="container results-content">
      <div className="subject-score-grid">{(['math','logic'] as const).map((subject) => <article className="card" key={subject}><div><span>{subjectLabels[subject]}</span><strong>{result.bySubject[subject].percentage}٪</strong></div><ProgressBar value={result.bySubject[subject].percentage} tone={result.bySubject[subject].percentage >= 70 ? 'success' : result.bySubject[subject].percentage >= 50 ? 'warning' : 'danger'} /><small>{result.bySubject[subject].correct} پاسخ صحیح از {result.bySubject[subject].total} سؤال</small></article>)}</div>
      <div className="result-columns">
        <section className="card topic-performance"><h2>عملکرد موضوعی</h2>{Object.entries(result.byTopic).map(([topic, score]) => <div className="topic-row" key={topic}><div><b>{topic}</b><span>{subjectLabels[score.subject]}</span></div><strong>{score.percentage}٪</strong><ProgressBar value={score.percentage} tone={score.percentage >= 70 ? 'success' : score.percentage >= 50 ? 'warning' : 'danger'} /></div>)}</section>
        <div className="insight-stack">
          <section className="card insight success-card"><h3><CheckCircle2/> نقاط قوت</h3><p>این بخش‌ها پایه خوبی برای ادامه مسیر تو هستند.</p><ul>{strengths.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className="card insight warning-card"><h3><TriangleAlert/> نیازمند توجه</h3><p>با چند تمرین هدفمند می‌توانی این فاصله را سریع‌تر کم کنی.</p><ul>{weaknesses.map((item) => <li key={item}>{item}</li>)}</ul></section>
        </div>
      </div>
      <section className="ai-analysis-card"><div className="ai-icon"><BrainCircuit/></div><div className="ai-body"><div className="ai-title"><div><span>تحلیل تعیین سطح</span><h2>پیشنهاد شخصی‌سازی‌شده Cent-s</h2></div><em>{analysis.provider === 'openrouter' ? 'OpenRouter' : analysis.provider === 'fallback' ? 'Fallback محلی' : 'Mock AI'}</em></div><p>{analysis.personalizedExplanation}</p><div className="priority-box"><Target/><div><b>قدم پیشنهادی بعدی</b><p>{analysis.suggestedNextStep}</p></div></div><div className="tag-row">{analysis.priorityTopics.map((topic) => <span key={topic}>{topic}</span>)}</div></div></section>
      <section className="result-cta"><div><span>حالا دقیقاً می‌دانی کجا باید قوی‌تر شوی.</span><h2>مسیر کامل مطالعه و تمرین را شروع کن.</h2><p>درس‌نامه، سؤال‌های هدفمند، شبیه‌ساز و پیگیری پیشرفت در پکیج اصلی Cent-s.</p></div><div><Link className="button button-light button-large" to="/package">مشاهده پکیج اصلی <ArrowLeft/></Link><Link className="retry-link" to="/diagnostic/test"><RotateCcw/> تکرار تعیین سطح</Link></div></section>
    </div>
  </div>
}
