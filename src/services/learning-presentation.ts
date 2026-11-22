import type { Curriculum } from './cent'

export function assessmentPath(curriculum: Curriculum | null, course: string, topic?: string) {
  const passageAware = curriculum?.topics.some(t => t.courseCode === course && (!topic || t.id === topic) && t.contentContract === 'passage-v1')
  const base = passageAware ? '/student/practice' : '/diagnostic/test'
  return `${base}?course=${encodeURIComponent(course)}${topic ? `&topic=${encodeURIComponent(topic)}` : ''}`
}

// Display-only translation. Keep the recommendation's text and priority order;
// match a course/topic pair exactly rather than guessing from a code or slug.
export function recommendationText(value: string, curriculum: Curriculum | null) {
  let text = value
  const mappings = (curriculum?.topics || []).flatMap(topic => {
    const course = curriculum?.courses.find(course => course.code === topic.courseCode)
    if (!course) return []
    return [topic.id, topic.title].map(key => ({ key: `${topic.courseCode}:${key}`, label: `${course.title} · ${topic.title}` }))
  }).sort((a, b) => b.key.length - a.key.length)
  for (const mapping of mappings) {
    const escaped = mapping.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(':', ':\\s*')
    text = text.replace(new RegExp(`(?<![\\w-])${escaped}(?![\\p{L}\\p{N}_-])`, 'gu'), () => mapping.label)
  }
  const unresolved = [...new Set(text.match(/\b[a-z][a-z0-9_-]*:\s*[^\s،؛,«»]+/gi) || [])]
  return { text, unresolved }
}

export function recommendationTopic(value: string, curriculum: Curriculum | null) {
  const normalized = value.replace(/^([a-z][a-z0-9_-]*):\s*/i, '$1:')
  const matches = curriculum?.topics.filter(topic => normalized === `${topic.courseCode}:${topic.id}` || normalized === `${topic.courseCode}:${topic.title}` || value === topic.id || value === topic.title) || []
  return matches.length === 1 ? matches[0] : null
}
