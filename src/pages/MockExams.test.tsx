import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MockMetrics, MockQuestionView, MockReviewView } from './MockExams'
import type { MockContent, MockCounts } from '../services/mock-exams'

const content: MockContent = { attemptId: 'a', revision: 1, serverNow: '', sectionId: 's', activeSection: null, passages: [{ passageSnapshotId: 'p', text: 'A shared passage.' }], questions: [{ questionId: 'q', position: 1, stem: 'Which claim follows?', options: ['a','b','c','d','e'].map(id => ({ id, text: `Option ${id}` })), passageSnapshotId: 'p', selectedOptionId: 'b' }] }
describe('mock presentation privacy and result semantics', () => {
  it('renders English context and five options without premature explanations or keys', () => {
    const html = renderToStaticMarkup(<MockQuestionView content={content} index={0} blocked={false} answer={() => {}}/>)
    expect(html.split('A shared passage.')).toHaveLength(2)
    expect(html.indexOf('A shared passage.')).toBeLessThan(html.indexOf('Which claim follows?'))
    expect(html).toContain('lang="en" dir="ltr"'); expect(html).toContain('<span>E</span>')
    expect(html).not.toContain('correctOptionId'); expect(html).not.toContain('explanation')
    expect(html).toContain('aria-pressed="true"')
  })
  it('withholds orphaned passage questions and unsupported media', () => {
    expect(renderToStaticMarkup(<MockQuestionView content={{ ...content, passages: [] }} index={0} blocked={false} answer={() => {}}/>)).not.toContain('Which claim follows?')
    expect(renderToStaticMarkup(<MockQuestionView content={{ ...content, questions: [{ ...content.questions[0], media: 'unknown' }] }} index={0} blocked={false} answer={() => {}}/>)).not.toContain('Option a')
  })
  it('shows negative raw scores and undefined zero-answer accuracy correctly', () => {
    const counts: MockCounts = { questionCount: 65, correctCount: 0, incorrectCount: 1, unansweredCount: 64, answeredCount: 1, rawScore: '-0.25', maximumRawScore: '65.00', accuracy: { displayPercent: '0.00' }, completionRate: { displayPercent: '1.54' } }
    const html = renderToStaticMarkup(<MockMetrics counts={counts}/>)
    expect(html).toContain('-0.25'); expect(html).toContain('1.54٪')
    expect(renderToStaticMarkup(<MockMetrics counts={{ ...counts, accuracy: { displayPercent: null } }}/>)).toContain('—')
  })
  it('reviews selected and correct options with the frozen passage and English explanation', () => {
    const html = renderToStaticMarkup(<MockReviewView review={{ passages: [{ passageRevisionId: 'p', text: 'Frozen context.' }], questions: [{ questionId: 'q', position: 1, sectionSubjectId: 'reading', stem: 'Review stem', options: content.questions[0].options, passageRevisionId: 'p', selectedOptionId: null, correctOptionId: 'b', explanation: 'The evidence supports B.' }] }}/>)
    expect(html).toContain('بدون پاسخ'); expect(html).toContain('Frozen context.'); expect(html).toContain('The evidence supports B.')
  })
})
