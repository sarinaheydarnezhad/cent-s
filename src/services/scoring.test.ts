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
})
