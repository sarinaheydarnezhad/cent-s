import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppStateProvider } from './state/AppState'
import { captureGoogleCallback, googleCallbackPath } from './services/google-auth'
import './styles.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'
import './cent.css'

if (window.location.pathname === googleCallbackPath()) captureGoogleCallback()

createRoot(document.getElementById('root')!).render(<StrictMode><AppStateProvider><App/></AppStateProvider></StrictMode>)
