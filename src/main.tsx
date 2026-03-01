import './index.css'
import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider"
import { applyDocumentTheme } from "@openai/apps-sdk-ui/theme"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Read persisted theme (index.html inline script already applied it to DOM,
// but applyDocumentTheme ensures the SDK and colorScheme style are in sync)
const THEME_KEY = 'jwt-studio-theme'
const saved = localStorage.getItem(THEME_KEY)
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = (saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light')
applyDocumentTheme(theme)

export { THEME_KEY }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppsSDKUIProvider linkComponent="a">
      <App />
    </AppsSDKUIProvider>
  </StrictMode>,
)
