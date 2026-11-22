import { describe, expect, it } from 'vitest'
import { diagnosticQuestions } from '../data/questions'
import { scoreAttempt } from './scoring'

describe('scoreAttempt', () => {
  it('calculates deterministic totals and subject scores', () => {
    const answers = Object.fromEntries(diagnosticQuestions.map((q, index) => [q.id, index < 3 ? q.correctAnswer : null]))
    const result = scoreAttempt(diagnosticQuestions, answers)
    expect(result.correct).toBe(3)
    expect(result.unanswered).toBe(diagnosticQuestions.length - 3)
    expect(result.bySubject.math.total).toBeGreaterThan(0)
    expect(result.bySubject.logic.total).toBeGreaterThan(0)
  })
  it('scores Reading and future subject keys without a fixed subject count', () => {
    const sample = diagnosticQuestions[0]
    const questions = [{ ...sample, id: 'reading', subject: 'reading' }, { ...sample, id: 'future', subject: 'future-subject' }]
    const result = scoreAttempt(questions, { reading: sample.correctAnswer, future: null })
    expect(result.bySubject.reading.correct).toBe(1)
    expect(result.bySubject['future-subject'].unanswered).toBe(1)
    expect(result.percentage).toBe(50)
  })
})
