import { describe, expect, it } from 'vitest'
import type { Curriculum } from './cent'
import { recommendationText, recommendationTopic } from './learning-presentation'

const curriculum: Curriculum = {
  courses: [{ code: 'math', title: 'ریاضی', trainingId: 'training' }], chapters: [], documents: [],
  topics: [{ id: 'topic-id', chapterId: 'chapter', courseCode: 'math', title: 'عبارت‌های جبری', questionCount: 3 }],
}
describe('recommendation presentation without changing guidance', () => {
  it('replaces a known course/topic ID inside the original sentence', () => {
    expect(recommendationText('مرور math:topic-id، سپس تمرین.', curriculum)).toEqual({ text: 'مرور ریاضی · عبارت‌های جبری، سپس تمرین.', unresolved: [] })
  })
  it('resolves a legacy course/title using actual curriculum text', () => {
    expect(recommendationText('math:عبارت‌های جبری', curriculum).text).toBe('ریاضی · عبارت‌های جبری')
    expect(recommendationText('مرور «math: عبارت‌های جبری»', curriculum).text).toBe('مرور «ریاضی · عبارت‌های جبری»')
    expect(recommendationTopic('math: عبارت‌های جبری', curriculum)).toBe(curriculum.topics[0])
  })
  it('retains unknown codes and explicitly reports unresolved mapping', () => {
    expect(recommendationText('مرور math:missing', curriculum)).toEqual({ text: 'مرور math:missing', unresolved: ['math:missing'] })
    expect(recommendationText('math: مبحث ناشناخته', curriculum).unresolved).toEqual(['math: مبحث'])
  })
  it('retains the original code while metadata is unavailable', () => {
    expect(recommendationText('math:topic-id', null)).toEqual({ text: 'math:topic-id', unresolved: ['math:topic-id'] })
  })
  it('does not guess from a different course or a matching prefix', () => {
    expect(recommendationText('physics:topic-id math:topic-id-extra', curriculum).unresolved).toEqual(['physics:topic-id', 'math:topic-id-extra'])
    expect(recommendationTopic('physics:topic-id', curriculum)).toBeNull()
  })
  it('links only an unambiguous topic from metadata', () => {
    expect(recommendationTopic('math:topic-id', curriculum)).toBe(curriculum.topics[0])
    expect(recommendationTopic('عبارت‌های جبری', curriculum)).toBe(curriculum.topics[0])
    expect(recommendationTopic('missing', curriculum)).toBeNull()
    expect(recommendationTopic('عبارت‌های جبری', { ...curriculum, topics: [...curriculum.topics, { ...curriculum.topics[0], id: 'other' }] })).toBeNull()
  })
  it('keeps human-readable guidance intact', () => {
    expect(recommendationText('از مرور درس شروع کن.', curriculum)).toEqual({ text: 'از مرور درس شروع کن.', unresolved: [] })
  })
  it('does not treat curriculum titles as regular expressions or replacements', () => {
    const value = { ...curriculum, topics: [{ ...curriculum.topics[0], title: 'تابع (x) $&' }] }
    expect(recommendationText('math:تابع (x) $&', value).text).toBe('ریاضی · تابع (x) $&')
  })
})
