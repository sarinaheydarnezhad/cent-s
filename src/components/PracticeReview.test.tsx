import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PracticeReview } from './PracticeReview'
import type { ExamOutcome } from '../services/cent'

const breakdown = { total: 3, correct: 1, incorrect: 1, unanswered: 1, percentage: 33 }
const fixture: ExamOutcome = {
  contentContract: 'passage-v1', passages: [{ id: 'p', text: 'Original shared evidence.' }],
  result: { ...breakdown, attemptId: 'practice', createdAt: '2026-11-22', bySubject: { reading: breakdown }, byTopic: {}, byDifficulty: { easy: breakdown, medium: breakdown, hard: breakdown }, answers: { correct: 0, wrong: 1, blank: null } },
  analysis: { overallAssessment: '', strengths: [], weaknesses: [], priorityTopics: [], recommendedStudyAreas: [], suggestedNextStep: '', personalizedExplanation: '', provider: 'rules', status: 'COMPLETED' },
  review: ['correct', 'wrong', 'blank'].map(id => ({ id, topic: 'Evidence', text: `Question ${id}`, options: ['First','Second','Third','Fourth','Fifth'], passageId: 'p', correctAnswer: 0, explanation: `English rationale for ${id}.` })),
}
describe('Practice feedback and historical review', () => {
  it('shows all three answer states with full question context and English rationales', () => {
    const html = renderToStaticMarkup(<PracticeReview outcome={fixture}/>)
    expect(html).toContain('صحیح'); expect(html).toContain('نادرست'); expect(html).toContain('بدون پاسخ')
    expect(html).toContain('Question correct'); expect(html).toContain('Fifth')
    expect(html).toContain('Original shared evidence.'); expect(html).toContain('lang="en" dir="ltr"')
    expect(html).toContain('English rationale for wrong.')
  })
  it('withholds dependent reviews when a passage is missing', () => {
    const html = renderToStaticMarkup(<PracticeReview outcome={{ ...fixture, passages: [] }}/>)
    expect(html).toContain('متن مرتبط با سؤال دریافت نشده است')
    expect(html).not.toContain('Question correct'); expect(html).not.toContain('English rationale')
  })
  it('keeps flat legacy explanation-only results readable', () => {
    const html = renderToStaticMarkup(<PracticeReview outcome={{ ...fixture, contentContract: null, passages: undefined, review: [{ id: 'correct', topic: 'Algebra', correctAnswer: 0, explanation: 'توضیح تاریخی حفظ‌شده' }] }}/>)
    expect(html).toContain('توضیح تاریخی حفظ‌شده'); expect(html).not.toContain('متن مرتبط با سؤال دریافت نشده')
  })
})
