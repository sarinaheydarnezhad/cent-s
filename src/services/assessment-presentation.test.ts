import { describe, expect, it } from 'vitest'
import { assessmentText } from './assessment-presentation'
import type { Curriculum } from './cent'

const curriculum: Curriculum = { courses: [{ code: 'math', title: 'ریاضی', trainingId: 'training' }], chapters: [], documents: [], topics: [{ id: '13aabbcc-1234-4567-8910-abcdef123456', courseCode: 'math', chapterId: 'chapter', title: 'عبارت‌های جبری', questionCount: 3 }] }
describe('assessment topic privacy and honest labels', () => {
  it('resolves exact identifiers and legacy course/title pairs', () => {
    expect(assessmentText(curriculum.topics[0].id, curriculum)).toBe('عبارت‌های جبری')
    expect(assessmentText('math:عبارت‌های جبری', curriculum)).toBe('عبارت‌های جبری')
    expect(assessmentText(`مرور ${curriculum.topics[0].id}، سپس تمرین.`, curriculum)).toBe('مرور عبارت‌های جبری، سپس تمرین.')
  })
  it.each(['math:missing', 'مرور math:missing، سپس تمرین.', 'unknown-topic', '12345678-1234-4567-8910-abcdef123456', 'مرور 12345678-1234-4567-8910-abcdef123456'])('withholds unresolved technical feedback: %s', value => {
    expect(assessmentText(value, curriculum)).toBeNull()
  })
  it('preserves scientific notation, natural guidance and an absent recommendation', () => {
    expect(assessmentText('تابع f(x) = x² و CEnT-S', curriculum)).toBe('تابع f(x) = x² و CEnT-S')
    expect(assessmentText('از مرور درس شروع کن.', null)).toBe('از مرور درس شروع کن.')
    expect(assessmentText('', null)).toBe('')
  })
  it('does not guess a topic without available metadata', () => {
    expect(assessmentText(curriculum.topics[0].id, null)).toBeNull()
    expect(assessmentText('physics:عبارت‌های جبری', curriculum)).toBeNull()
  })
})
