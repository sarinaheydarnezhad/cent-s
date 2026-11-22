import { afterEach, describe, expect, it, vi } from 'vitest'
import { cent } from './cent'
import { assessmentPath } from './learning-presentation'

afterEach(() => vi.unstubAllGlobals())
const curriculum = { syllabusRevisionId: 'syllabus/r1', courses: [{ code: 'reading', title: 'Reading', trainingId: 'reading' }], chapters: [], documents: [], topics: [{ id: 'new', courseCode: 'reading', contentContract: 'passage-v1' as const, chapterId: 'chapter', title: 'Inference', questionCount: 6 }, { id: 'old', courseCode: 'math', chapterId: 'chapter', title: 'Algebra', questionCount: 3 }] }
function mockFetch() {
  const fn = vi.fn().mockImplementation((url: string) => Promise.resolve(new Response(JSON.stringify(url.endsWith('/curriculum') ? curriculum : {}))))
  vi.stubGlobal('fetch', fn)
  return fn
}
describe('content contract selection', () => {
  it('selects passage-aware Practice from actual topic capabilities', async () => {
    const fetcher = mockFetch()
    await cent.startExam('practice', 'request', 'reading', 'new')
    expect(JSON.parse(fetcher.mock.calls.at(-1)![1].body).contentContract).toBe('passage-v1')
  })
  it('preserves legacy topic Practice and diagnostic requests', async () => {
    const fetcher = mockFetch()
    await cent.startExam('practice', 'request', 'math', 'old')
    expect(JSON.parse(fetcher.mock.calls.at(-1)![1].body)).not.toHaveProperty('contentContract')
    fetcher.mockClear()
    await cent.startExam('diagnostic', 'request', 'math')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).not.toHaveProperty('contentContract')
  })
  it('requests the published syllabus scope without hardcoded revision IDs', async () => {
    const fetcher = mockFetch()
    await cent.mastery()
    expect(fetcher.mock.calls.at(-1)![0]).toBe('/api/cent/v1/me/mastery?syllabusRevisionId=syllabus%2Fr1')
  })
  it('routes current topic assessments to Practice and keeps old links usable', () => {
    expect(assessmentPath(curriculum, 'reading', 'new')).toBe('/student/practice?course=reading&topic=new')
    expect(assessmentPath(curriculum, 'math', 'old')).toBe('/diagnostic/test?course=math&topic=old')
    expect(assessmentPath(null, 'math', 'old')).toBe('/diagnostic/test?course=math&topic=old')
  })
})
