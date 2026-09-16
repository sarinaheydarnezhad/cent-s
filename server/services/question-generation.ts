import type { DiagnosticResult, Question } from '../../src/types'
import { questions } from '../../src/data/questions'

export interface QuestionGenerator {
  generate(result: DiagnosticResult): Promise<Question[]>
}

export class MockQuestionGenerator implements QuestionGenerator {
  async generate(result: DiagnosticResult): Promise<Question[]> {
    const weakTopics = Object.entries(result.byTopic)
      .sort((a, b) => a[1].percentage - b[1].percentage)
      .slice(0, 3)
      .map(([topic]) => topic)
    const targeted = questions.filter((q) => weakTopics.includes(q.topic) && q.status === 'active')
    return (targeted.length ? targeted : questions.filter((q) => q.status === 'active')).slice(0, 5)
  }
}

export class N8NQuestionGenerator implements QuestionGenerator {
  constructor(private webhookUrl: string, private secret?: string) {}
  async generate(result: DiagnosticResult): Promise<Question[]> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.secret ? { Authorization: `Bearer ${this.secret}` } : {}),
      },
      body: JSON.stringify({ event: 'simulator.completed', result }),
    })
    if (!response.ok) throw new Error(`n8n webhook failed with ${response.status}`)
    return await response.json() as Question[]
  }
}

export class QuestionGenerationService {
  async generate(result: DiagnosticResult) {
    const webhook = process.env.N8N_WEBHOOK_URL
    if (!webhook) return new MockQuestionGenerator().generate(result)
    try {
      return await new N8NQuestionGenerator(webhook, process.env.N8N_WEBHOOK_SECRET).generate(result)
    } catch (error) {
      console.error('n8n generation failed; using mock questions.', error)
      return new MockQuestionGenerator().generate(result)
    }
  }
}
