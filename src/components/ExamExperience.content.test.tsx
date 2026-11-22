import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ExamExperience } from './ExamExperience'
import type { ExamAttempt } from '../services/cent'

const noop = () => {}
function render(attempt: ExamAttempt) {
  return renderToStaticMarkup(<MemoryRouter><ExamExperience kind="practice" returnToStudy={null} catalog={{ data: null, busy: false, error: '', reload: noop }} course="reading" setCourse={noop} topic="" setTopic={noop} configurationChanged={noop} attempt={attempt} answers={{}} setAnswers={noop} index={0} setIndex={noop} busy={false} error="" remaining={300} start={noop} submit={noop} restart={noop}/></MemoryRouter>)
}
const attempt: ExamAttempt = { id: 'attempt', kind: 'practice', expiresAt: '2027-01-01', contentContract: 'passage-v1', passages: [{ id: 'passage', text: 'A shared original text.\n\nIts second paragraph.' }], questions: [{ id: 'q', subject: 'reading', topic: 'Inference', difficulty: 'medium', text: 'Which inference is supported?', options: ['One', 'Two', 'Three', 'Four', 'Five'], passageId: 'passage' }] }

describe('passage-aware practice', () => {
  it('renders the referenced passage once as English context above the question', () => {
    const markup = render(attempt)
    expect(markup.split('A shared original text.')).toHaveLength(2)
    expect(markup.indexOf('A shared original text.')).toBeLessThan(markup.indexOf('Which inference is supported?'))
    expect(markup).toContain('lang="en" dir="ltr"')
    expect(markup).toContain('Its second paragraph.')
    expect(markup).toContain('<span>E</span>')
  })
  it('withholds a dependent question and options when its passage is missing', () => {
    const markup = render({ ...attempt, passages: [] })
    expect(markup).toContain('متن مرتبط با این سؤال دریافت نشده است')
    expect(markup).not.toContain('Which inference is supported?')
    expect(markup).not.toContain('options-list')
  })
  it('continues rendering flat legacy questions without a passage contract', () => {
    const markup = render({ ...attempt, contentContract: undefined, passages: undefined, questions: [{ ...attempt.questions[0], passageId: undefined, options: ['One','Two','Three','Four'] }] })
    expect(markup).toContain('Which inference is supported?')
    expect(markup).not.toContain('متن مرتبط با سؤال')
    expect(markup).toContain('<span>الف</span>')
  })
})
