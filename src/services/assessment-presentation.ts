import type { Curriculum } from './cent'
import { recommendationText, recommendationTopic } from './learning-presentation'

// Display only. Never infer a title from a slug or alter recommendation order.
export function assessmentText(value: string, curriculum: Curriculum | null) {
  const topic = recommendationTopic(value, curriculum)
  if (topic) return topic.title
  let text = value
  for (const item of curriculum?.topics || []) {
    const escaped = item.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    text = text.replace(new RegExp(`(?<![\\w:-])${escaped}(?![\\w-])`, 'g'), () => item.title)
  }
  const resolved = recommendationText(text, curriculum)
  if (resolved.unresolved.length || /\b[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\b/i.test(resolved.text) || /^[a-z\d_-]+$/i.test(resolved.text)) return null
  return resolved.text
}
