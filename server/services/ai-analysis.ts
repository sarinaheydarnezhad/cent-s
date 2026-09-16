import type { AIAnalysis, DiagnosticResult } from '../../src/types'

interface AIAnalysisProvider {
  analyze(result: DiagnosticResult): Promise<AIAnalysis>
}

function rankedTopics(result: DiagnosticResult) {
  return Object.entries(result.byTopic).sort((a, b) => a[1].percentage - b[1].percentage)
}

export class MockAIAnalysisProvider implements AIAnalysisProvider {
  async analyze(result: DiagnosticResult): Promise<AIAnalysis> {
    const ranked = rankedTopics(result)
    const weaknesses = ranked.filter(([, value]) => value.percentage < 60).map(([topic]) => topic)
    const strengths = ranked.filter(([, value]) => value.percentage >= 70).reverse().map(([topic]) => topic)
    const priorityTopics = weaknesses.slice(0, 3)
    const lowerSubject = result.bySubject.math.percentage <= result.bySubject.logic.percentage ? 'ریاضیات' : 'منطق'

    return {
      overallAssessment: result.percentage >= 75
        ? 'پایه شما برای ورود به تمرین‌های سطح آزمون مناسب است، اما چند موضوع هنوز به مرور هدفمند نیاز دارد.'
        : result.percentage >= 50
          ? 'بخشی از مباحث پایه را می‌دانید، اما برای رسیدن به عملکرد پایدار باید ضعف‌های موضوعی را منظم مرور کنید.'
          : 'بهتر است پیش از تمرین‌های فشرده، چند مبحث پایه را به‌ترتیب اولویت بازسازی کنید.',
      strengths: strengths.length ? strengths.slice(0, 3) : ['پاسخ‌گویی و تکمیل آزمون تشخیصی'],
      weaknesses: weaknesses.length ? weaknesses.slice(0, 4) : ['برای تشخیص دقیق‌تر به تمرین‌های بیشتری نیاز است'],
      priorityTopics: priorityTopics.length ? priorityTopics : ['مرور ترکیبی ریاضیات و منطق'],
      recommendedStudyAreas: priorityTopics.length ? priorityTopics.map((topic) => `درس‌نامه و تمرین هدفمند «${topic}»`) : ['آزمون ترکیبی سطح متوسط'],
      suggestedNextStep: priorityTopics.length
        ? `از مبحث «${priorityTopics[0]}» شروع کنید و پس از مرور درس‌نامه، حداقل ۵ سؤال تازه حل کنید.`
        : 'یک مجموعه سؤال ترکیبی سطح متوسط حل کنید تا پایداری عملکردتان سنجیده شود.',
      personalizedExplanation: `امتیازهای محاسبه‌شده نشان می‌دهد عملکرد فعلی شما در ${lowerSubject} نسبت به درس دیگر نیازمند توجه بیشتری است. این تحلیل بر اساس درصدهای قطعی سامانه تهیه شده و هیچ نمره‌ای توسط AI ساخته نشده است.`,
      provider: 'mock',
      status: 'COMPLETED',
    }
  }
}

export class OpenRouterAnalysisProvider implements AIAnalysisProvider {
  constructor(private apiKey: string, private model: string) {}

  async analyze(result: DiagnosticResult): Promise<AIAnalysis> {
    const prompt = `You are an educational diagnostic analyst. Return valid JSON only.
The supplied metrics are authoritative. Never recalculate, change, or invent any score.
Write all user-facing values in Persian.
Required keys: overallAssessment, strengths, weaknesses, priorityTopics, recommendedStudyAreas, suggestedNextStep, personalizedExplanation.
Metrics:\n${JSON.stringify({
      overall: { total: result.total, correct: result.correct, incorrect: result.incorrect, unanswered: result.unanswered, percentage: result.percentage },
      subjects: result.bySubject,
      topics: result.byTopic,
      difficulty: result.byDifficulty,
    })}`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Cent-s Practice MVP',
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    })
    if (!response.ok) throw new Error(`OpenRouter failed with ${response.status}`)
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = payload.choices?.[0]?.message?.content
    if (!content) throw new Error('OpenRouter returned an empty response')
    return { ...JSON.parse(content), provider: 'openrouter', status: 'COMPLETED' } as AIAnalysis
  }
}

export class AIAnalysisService {
  private mock = new MockAIAnalysisProvider()

  async analyze(result: DiagnosticResult): Promise<AIAnalysis> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return this.mock.analyze(result)
    try {
      const provider = new OpenRouterAnalysisProvider(apiKey, process.env.OPENROUTER_MODEL || 'openai/gpt-4.1-mini')
      return await provider.analyze(result)
    } catch (error) {
      console.error('OpenRouter analysis failed; using deterministic fallback.', error)
      const fallback = await this.mock.analyze(result)
      return { ...fallback, provider: 'fallback' }
    }
  }
}
