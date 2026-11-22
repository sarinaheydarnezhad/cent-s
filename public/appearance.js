/* Shared startup and runtime owner. Loaded before CSS/React to resolve appearance. */
;(function (host) {
  const key = 'itatest:appearance:v1'
  const valid = value => value === 'light' || value === 'dark'
  const media = host.matchMedia('(prefers-color-scheme: dark)')
  const listeners = new Set()
  const initial = () => media.matches ? 'dark' : 'light'
  let preference = initial()
  try {
    const saved = host.localStorage.getItem(key)
    if (valid(saved)) preference = saved
    // Migrate legacy System/invalid values to a concrete preference once.
    host.localStorage.setItem(key, preference)
  } catch { /* A blocked store must not prevent application startup. */ }

  function apply() {
    const theme = preference
    host.document.documentElement.dataset.theme = theme
    host.document.documentElement.style.colorScheme = theme
    host.document.documentElement.style.backgroundColor = theme === 'dark' ? '#182127' : '#F5F7F7'
    const meta = host.document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = theme === 'dark' ? '#182127' : '#F5F7F7'
    listeners.forEach(listener => listener())
  }

  host.ItatestAppearance = Object.freeze({
    getPreference: () => preference,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    setPreference(value) {
      if (!valid(value)) return
      preference = value
      try { host.localStorage.setItem(key, value) } catch { /* Remain usable in memory. */ }
      apply()
    },
  })
  host.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = valid(event.newValue) ? event.newValue : initial()
      if (!valid(event.newValue)) {
        try { host.localStorage.setItem(key, preference) } catch { /* Remain usable in memory. */ }
      }
      apply()
    }
  })
  apply()
})(globalThis)
