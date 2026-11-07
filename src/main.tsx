import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppStateProvider } from './state/AppState'
import './styles.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'
import './cent.css'

createRoot(document.getElementById('root')!).render(<StrictMode><AppStateProvider><App/></AppStateProvider></StrictMode>)
