import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

type Appearance = 'light' | 'dark'
declare global {
  interface Window {
    ItatestAppearance: {
      getPreference: () => Appearance
      setPreference: (value: Appearance) => void
      subscribe: (listener: () => void) => () => void
    }
  }
}

export function AppearanceControl() {
  const owner = window.ItatestAppearance
  const preference = useSyncExternalStore(owner.subscribe, owner.getPreference)
  const next = preference === 'dark' ? 'light' : 'dark'
  const label = next === 'light' ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'
  return <div className="appearance-control">
    <button type="button" className="icon-button appearance-toggle" aria-label={label} title={label} onClick={() => owner.setPreference(next)}>
      {next === 'light' ? <Sun key="sun" size={20} aria-hidden="true"/> : <Moon key="moon" size={20} aria-hidden="true"/>}
    </button>
  </div>
}
