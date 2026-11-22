import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './cent'
import { MockSession, mockExams, mockRemaining, mockStartIdentity, type MockContent, type MockState, type PendingCommand } from './mock-exams'

function fixture() {
  const storageData = new Map<string, string>()
  const storage = { getItem: (k: string) => storageData.get(k) ?? null, setItem: (k: string, v: string) => { storageData.set(k, v) }, removeItem: (k: string) => { storageData.delete(k) } }
  const state: MockState = { attemptId: 'attempt', examVersionId: 'current', configurationRevision: 'r1', revision: 1, status: 'ACTIVE', serverNow: '2026-11-22T10:00:00Z', activeSectionId: 'reading', activeSection: { sectionId: 'reading', sectionKey: 'reading', subjectId: 'reading', order: 1, questionCount: 10, durationSeconds: 1800, state: 'ACTIVE', deadline: '2026-11-22T10:30:00Z' }, sections: [] }
  const content: MockContent = { attemptId: 'attempt', revision: 1, serverNow: state.serverNow, sectionId: 'reading', activeSection: state, passages: [{ passageSnapshotId: 'p', text: 'Original context.' }], questions: [{ questionId: 'q', position: 1, stem: 'What follows?', options: [{ id: 'a', text: 'One' }, { id: 'b', text: 'Two' }], selectedOptionId: null, passageSnapshotId: 'p' }] }
  const api = { ...mockExams, state: vi.fn(async () => structuredClone(state)), content: vi.fn(async () => structuredClone(content)), command: vi.fn(async (_id: string, command: PendingCommand) => ({ receipt: { accepted: true, commandId: command.input.commandId, appliedRevision: 2 }, currentState: { ...state, revision: 2 } })) }
  let now = 0
  const create = (owner = 'owner') => new MockSession(owner, 'attempt', storage, api, () => now)
  return { state, content, api, storage, storageData, create, advanceClock: (ms: number) => { now += ms } }
}
describe('server-authoritative mock recovery', () => {
  it('uses server timestamps and a monotonic elapsed interval despite the device wall clock', () => {
    const f = fixture()
    expect(mockRemaining(f.state, 1000)).toBe(1799)
    expect(mockRemaining(f.state, 1801000)).toBe(0)
    expect(mockRemaining(f.state, -10000)).toBe(1800)
  })
  it('keeps an uncertain write across browser closure and retries its exact command identity', async () => {
    const f = fixture(); const first = f.create(); await first.refresh()
    f.api.command.mockRejectedValueOnce(new TypeError('network lost after commit'))
    await first.send('answer', 'q', 'b')
    const pending = first.snapshot().pending
    expect(pending?.input.selectedOptionId).toBe('b')
    await first.send('advance')
    expect(f.api.command).toHaveBeenCalledTimes(1)
    const reopened = f.create(); expect(reopened.snapshot().pending).toEqual(pending)
    await reopened.refresh(); await reopened.retry()
    expect(f.api.command.mock.calls[1][1]).toEqual(pending)
    expect(reopened.snapshot().pending).toBeNull()
    expect(reopened.snapshot().acknowledgment).toContain('ذخیره شد')
    expect(f.storageData.size).toBe(0)
  })
  it('does not show acknowledgment before receipt and isolates pending commands by account', async () => {
    const f = fixture(); const session = f.create(); await session.refresh()
    f.api.command.mockRejectedValueOnce(new TypeError('offline'))
    await session.send('answer', 'q', null)
    expect(session.snapshot().acknowledgment).toBe('')
    expect(f.create('someone-else').snapshot().pending).toBeNull()
    expect(f.create().snapshot().pending?.input).toHaveProperty('selectedOptionId', null)
  })
  it('reconciles stale revisions without silently overwriting another tab', async () => {
    const f = fixture(); const session = f.create(); await session.refresh()
    f.api.command.mockRejectedValueOnce(new ApiError('stale', 409, 'stale_revision'))
    await session.send('answer', 'q', 'a')
    expect(session.snapshot().pending).toBeNull()
    expect(session.snapshot().error).toContain('پذیرفته نشد')
    expect(f.api.command).toHaveBeenCalledTimes(1)
  })
  it('never advances locally on timeout and freezes inputs until a fresh server section arrives', async () => {
    const f = fixture(); const session = f.create(); await session.refresh()
    f.advanceClock(1800001)
    await session.send('answer', 'q', 'a'); await session.send('advance')
    expect(f.api.command).not.toHaveBeenCalled()
    expect(session.snapshot().state?.activeSectionId).toBe('reading')
    f.state.status = 'EXPIRED'; f.state.activeSection = null; f.state.activeSectionId = null
    await session.refresh()
    expect(session.snapshot().state?.status).toBe('EXPIRED')
    expect(session.snapshot().content).toBeNull()
  })
  it('uses the atomic active-content state when a deadline passes between GETs', async () => {
    const f = fixture(); f.content.revision = 2
    f.content.activeSection = { ...f.state, revision: 2 }
    const session = f.create(); await session.refresh()
    expect(session.snapshot().state?.revision).toBe(2)
    expect(session.snapshot().error).toBe('')
  })
  it('sends explicit irreversible confirmation and persists completion commands', async () => {
    const f = fixture(); const session = f.create(); await session.refresh()
    await session.send('advance')
    expect(f.api.command.mock.calls[0][1]).toMatchObject({ action: 'advance', input: { sectionId: 'reading', expectedRevision: 1, confirmForfeitRemainingTime: true } })
  })
  it('refuses writes when durable storage is unavailable', async () => {
    const f = fixture(); f.storage.setItem = () => { throw new Error('blocked') }
    const session = f.create(); await session.refresh(); await session.send('answer', 'q', 'a')
    expect(f.api.command).not.toHaveBeenCalled(); expect(session.snapshot().error).toContain('ذخیره محلی')
  })
  it('preserves the same start identity for uncertain starts and separates revisions', () => {
    const f = fixture(); const config = { examVersionId: 'v1', configurationRevision: 'r1' } as Parameters<typeof mockStartIdentity>[1]
    expect(mockStartIdentity('owner', config, f.storage)).toEqual(mockStartIdentity('owner', config, f.storage))
    expect(mockStartIdentity('other', config, f.storage).input.requestId).not.toBe(mockStartIdentity('owner', config, f.storage).input.requestId)
    expect(mockStartIdentity('owner', { ...config, configurationRevision: 'r2' }, f.storage).input.requestId).not.toBe(mockStartIdentity('owner', config, f.storage).input.requestId)
  })
})
