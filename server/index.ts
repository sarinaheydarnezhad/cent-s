import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { AIAnalysisService } from './services/ai-analysis'
import { PaymentService } from './services/payment'
import { QuestionGenerationService } from './services/question-generation'

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ai: process.env.OPENROUTER_API_KEY ? 'openrouter' : 'mock', payment: 'mock', questions: process.env.N8N_WEBHOOK_URL ? 'n8n' : 'mock' }))

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const result = z.object({ attemptId: z.string(), percentage: z.number(), total: z.number(), correct: z.number(), incorrect: z.number(), unanswered: z.number() }).passthrough().parse(req.body)
    const analysis = await new AIAnalysisService().analyze(result as never)
    res.json(analysis)
  } catch (error) {
    res.status(400).json({ message: 'داده‌های نتیجه آزمون معتبر نیستند.', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.post('/api/payments/mock', async (req, res) => {
  try {
    const body = z.object({ product: z.object({ id: z.string(), title: z.string(), price: z.number(), features: z.array(z.string()) }).passthrough(), user: z.object({ id: z.string(), name: z.string(), email: z.string(), role: z.enum(['STUDENT', 'ADMIN']) }) }).parse(req.body)
    const order = await new PaymentService().process(body.product, body.user)
    res.status(order.status === 'PAID' ? 200 : 402).json(order)
  } catch {
    res.status(400).json({ message: 'امکان ساخت سفارش آزمایشی وجود ندارد.' })
  }
})

app.post('/api/questions/generate', async (req, res) => {
  try {
    const result = z.object({ attemptId: z.string(), byTopic: z.record(z.string(), z.unknown()) }).passthrough().parse(req.body)
    res.json(await new QuestionGenerationService().generate(result as never))
  } catch {
    res.status(400).json({ message: 'داده‌های عملکرد برای تولید تمرین معتبر نیستند.' })
  }
})

app.use((_req, res) => res.status(404).json({ message: 'مسیر API پیدا نشد.' }))
app.listen(port, () => console.log(`Cent-s API running on http://localhost:${port}`))
