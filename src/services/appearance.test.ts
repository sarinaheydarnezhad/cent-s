import { describe, expect, it } from 'vitest'
import source from '../../public/appearance.js?raw'

function boot(saved: string | null = null, dark = false, blocked = false) {
  const events: Record<string, (event: { key: string | null; newValue: string | null }) => void> = {}
  const media = { matches: dark }
  const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> }
  const meta = { content: '' }
  const store = new Map(saved ? [['itatest:appearance:v1', saved]] : [])
  const host = {
    matchMedia: () => media,
    localStorage: {
      getItem: (key: string) => { if (blocked) throw Error('blocked'); return store.get(key) ?? null },
      setItem: (key: string, value: string) => { if (blocked) throw Error('blocked'); store.set(key, value) },
    },
    document: { documentElement: root, querySelector: () => meta },
    addEventListener: (name: string, handler: (event: { key: string | null; newValue: string | null }) => void) => { events[name] = handler },
  }
  new Function('globalThis', source)(host)
  return { owner: (host as typeof host & { ItatestAppearance: Window['ItatestAppearance'] }).ItatestAppearance, root, meta, store, events, media }
}
describe('single startup/runtime appearance owner', () => {
  it.each([false, true])('resolves and saves initial OS preference, dark=%s before React', dark => {
    const app = boot(null, dark)
    expect(app.owner.getPreference()).toBe(dark ? 'dark' : 'light')
    expect(app.store.get('itatest:appearance:v1')).toBe(dark ? 'dark' : 'light')
    expect(app.root.dataset.theme).toBe(dark ? 'dark' : 'light')
    expect(app.root.style.colorScheme).toBe(app.root.dataset.theme)
    expect(app.root.style.backgroundColor).toBe(dark ? '#182127' : '#F5F7F7')
  })
  it.each(['light', 'dark'] as const)('restores explicit %s independently of system', selected => {
    expect(boot(selected, selected === 'light').root.dataset.theme).toBe(selected)
  })
  it('persists switching and restores on a new startup', () => {
    const app = boot()
    app.owner.setPreference('dark')
    expect(app.root.dataset.theme).toBe('dark')
    expect(boot(app.store.get('itatest:appearance:v1')).root.dataset.theme).toBe('dark')
    app.owner.setPreference('light')
    expect(app.root.dataset.theme).toBe('light')
  })
  it('keeps the selected theme when the OS changes', () => {
    const app = boot('light')
    app.media.matches = true
    expect(app.root.dataset.theme).toBe('light')
    expect(app.events.media).toBeUndefined()
  })
  it('survives blocked storage for startup and changes', () => {
    const app = boot('light', true, true)
    expect(app.root.dataset.theme).toBe('dark')
    expect(() => app.owner.setPreference('light')).not.toThrow()
    expect(app.root.dataset.theme).toBe('light')
  })
  it('ignores invalid saved and runtime values', () => {
    const app = boot('invalid', true)
    app.owner.setPreference('invalid' as 'light')
    expect(app.owner.getPreference()).toBe('dark')
  })
  it('notifies subscribers and cleans up subscriptions', () => {
    const app = boot(); let calls = 0
    const dispose = app.owner.subscribe(() => calls++)
    app.owner.setPreference('dark'); dispose(); app.owner.setPreference('light')
    expect(calls).toBe(1)
  })
  it('syncs another tab and clearing preferences', () => {
    const app = boot(null, true)
    app.events.storage({ key: 'itatest:appearance:v1', newValue: 'light' })
    expect(app.root.dataset.theme).toBe('light')
    app.events.storage({ key: null, newValue: null })
    expect(app.root.dataset.theme).toBe('dark')
    expect(app.meta.content).toBe('#182127')
  })
  it.each([false, true])('migrates stored System to a concrete preference, dark=%s', dark => {
    const app = boot('system', dark)
    expect(app.owner.getPreference()).toBe(dark ? 'dark' : 'light')
    expect(app.store.get('itatest:appearance:v1')).toBe(dark ? 'dark' : 'light')
  })
  it('rejects runtime System without changing the current preference', () => {
    const app = boot('light', true)
    app.owner.setPreference('system' as 'light')
    expect(app.owner.getPreference()).toBe('light')
  })
  it('ignores storage events for unrelated keys', () => {
    const app = boot('light', true)
    app.events.storage({ key: 'unrelated', newValue: 'dark' })
    expect(app.owner.getPreference()).toBe('light')
  })
})
