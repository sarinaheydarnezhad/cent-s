export type SubjectId = 'math' | 'logic'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionStatus = 'active' | 'draft'

export interface Question {
  id: string
  subject: SubjectId
  topic: string
  difficulty: Difficulty
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
  status: QuestionStatus
  kind: 'diagnostic' | 'simulator' | 'both'
}

export interface AnswerMap { [questionId: string]: number | null }

export interface Breakdown {
  total: number
  correct: number
  incorrect: number
  unanswered: number
  percentage: number
}

export interface DiagnosticResult extends Breakdown {
  attemptId: string
  createdAt: string
  bySubject: Record<SubjectId, Breakdown>
  byTopic: Record<string, Breakdown & { subject: SubjectId }>
  byDifficulty: Record<Difficulty, Breakdown>
  answers: AnswerMap
}

export interface AIAnalysis {
  overallAssessment: string
  strengths: string[]
  weaknesses: string[]
  priorityTopics: string[]
  recommendedStudyAreas: string[]
  suggestedNextStep: string
  personalizedExplanation: string
  provider: 'mock' | 'openrouter' | 'fallback'
  status: 'COMPLETED' | 'FAILED'
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'ADMIN'
}

export interface Order {
  id: string
  student: string
  product: string
  amount: number
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  provider: 'MOCK' | 'ZARINPAL'
  createdAt: string
  demo: boolean
}

export interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  features: string[]
}
