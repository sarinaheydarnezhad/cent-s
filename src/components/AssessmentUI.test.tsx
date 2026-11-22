import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ExamExperience } from './ExamExperience'
import { AssessmentGuidance, ResultRing } from './AssessmentUI'
import type { AIAnalysis } from '../types'

const noop = () => {}
const attempt = { id: 'attempt', kind: 'practice', expiresAt: '2030-01-01', questions: [{ id: 'question', subject: 'math', topic: 'جبر', difficulty: 'easy' as const, text: 'x² = 4', options: ['x = 2', 'x = 4'] }] }
function exam(answers: Record<string, number | null>, remaining = 120, busy = false) {
  return renderToStaticMarkup(<MemoryRouter><ExamExperience kind="practice" returnToStudy={null} catalog={{ data: null, busy: false, error: '', reload: noop }} course="math" setCourse={noop} topic="" setTopic={noop} configurationChanged={noop} attempt={attempt} answers={answers} setAnswers={noop} index={0} setIndex={noop} busy={busy} error="" remaining={remaining} start={noop} submit={noop} restart={noop}/></MemoryRouter>)
}
describe('assessment presentation boundaries', () => {
  it('makes selection accessible without presenting it as correct', () => {
    const html = exam({ question: 1 })
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('aria-current="step"')
    expect(html).toContain('پاسخ انتخاب شده')
    expect(html).not.toContain('گزینه صحیح')
    expect(html).not.toContain('ui-badge-success')
    expect(html).not.toContain('ui-badge-error')
  })
  it('preserves the cleared-answer progress behavior while leaving no option selected', () => {
    const html = exam({ question: null })
    expect(html).not.toContain('aria-pressed="true"')
    expect(html).toContain('aria-valuenow="100"')
    expect(html).not.toContain('، پاسخ انتخاب شده')
  })
  it.each([{ remaining: 0, busy: false }, { remaining: 120, busy: true }])('retains disabled answer and submission states: %j', ({ remaining, busy }) => {
    const html = exam({}, remaining, busy)
    expect(html.match(/disabled=""/g)).toHaveLength(4) // Two options, previous and submit.
    expect(html).toContain(remaining === 0 ? 'آزمون تازه' : 'در حال ثبت…')
  })
  it('never shows unresolved identifiers in guidance or its markup', () => {
    const analysis: AIAnalysis = { suggestedNextStep: 'مرور math:unknown', priorityTopics: ['math:unknown'], personalizedExplanation: 'topic:unknown', strengths: [], weaknesses: [], recommendedStudyAreas: [], overallAssessment: '', provider: 'rules', status: 'FAILED' }
    const html = renderToStaticMarkup(<MemoryRouter><AssessmentGuidance analysis={analysis} curriculum={null}/></MemoryRouter>)
    expect(html).not.toContain('math:unknown')
    expect(html).not.toContain('topic:unknown')
    expect(html).toContain('راهنمایی این نتیجه کامل نشده')
    expect(html).toContain('نام مبحث در دسترس نیست')
  })
  it('pairs a supplied ring with visible percentage and its correct-answer meaning', () => {
    const html = renderToStaticMarkup(<ResultRing value={37.5}/>)
    expect(html).toContain('--score:37.5%')
    expect(html).toContain('37.5')
    expect(html).toContain('پاسخ صحیح')
  })
})
