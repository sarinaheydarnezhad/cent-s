import type { AnswerMap, Breakdown, DiagnosticResult, Difficulty, Question, SubjectId } from '../types'

const emptyBreakdown = (): Breakdown => ({ total: 0, correct: 0, incorrect: 0, unanswered: 0, percentage: 0 })

const finalize = (value: Breakdown): Breakdown => ({
  ...value,
  percentage: value.total === 0 ? 0 : Math.round((value.correct / value.total) * 100),
})

export interface ScoringLimits { minScore?: number, maxScore?: number, negative?: boolean }

export function scoreAttempt(questions: Question[], answers: AnswerMap, limits?: ScoringLimits): DiagnosticResult {
  const total = emptyBreakdown()
  const bySubject: Record<SubjectId, Breakdown> = { math: emptyBreakdown(), logic: emptyBreakdown() }
  const byTopic: DiagnosticResult['byTopic'] = {}
  const byDifficulty: Record<Difficulty, Breakdown> = { easy: emptyBreakdown(), medium: emptyBreakdown(), hard: emptyBreakdown() }

  for (const question of questions) {
    const topic = byTopic[question.topic] ?? { ...emptyBreakdown(), subject: question.subject }
    const groups: Breakdown[] = [total, bySubject[question.subject], topic, byDifficulty[question.difficulty]]
    const answer = answers[question.id]

    groups.forEach((group) => {
      group.total += 1
      if (answer === undefined || answer === null) group.unanswered += 1
      else if (answer === question.correctAnswer) group.correct += 1
      else group.incorrect += 1
    })
    byTopic[question.topic] = topic
  }

  const finalizedTotal = finalize(total)
  const rawPercentage = limits?.negative && total.total > 0
    ? Math.round(((total.correct - total.incorrect / 3) / total.total) * 100)
    : finalizedTotal.percentage
  const minScore = Math.max(0, Math.min(100, limits?.minScore ?? 0))
  const maxScore = Math.max(minScore, Math.min(100, limits?.maxScore ?? 100))
  return {
    ...finalizedTotal,
    percentage: Math.max(minScore, Math.min(maxScore, rawPercentage)),
    attemptId: `ATT-${Date.now()}`,
    createdAt: new Date().toISOString(),
    answers,
    bySubject: { math: finalize(bySubject.math), logic: finalize(bySubject.logic) },
    byTopic: Object.fromEntries(Object.entries(byTopic).map(([key, value]) => [key, { ...finalize(value), subject: value.subject }])),
    byDifficulty: {
      easy: finalize(byDifficulty.easy),
      medium: finalize(byDifficulty.medium),
      hard: finalize(byDifficulty.hard),
    },
  }
}

export function getStrengthsAndWeaknesses(result: DiagnosticResult) {
  const topics = Object.entries(result.byTopic)
  const strengths = topics.filter(([, value]) => value.percentage >= 70).sort((a, b) => b[1].percentage - a[1].percentage).map(([name]) => name)
  const weaknesses = topics.filter(([, value]) => value.percentage < 60).sort((a, b) => a[1].percentage - b[1].percentage).map(([name]) => name)
  return { strengths, weaknesses }
}
