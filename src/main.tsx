import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { THEME_KEY, applyDocumentTheme } from './lib/theme'

// Read persisted theme (index.html inline script already applied it to DOM,
// but applyDocumentTheme ensures the colorScheme style stays in sync)
const saved = localStorage.getItem(THEME_KEY)
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = (saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light')
applyDocumentTheme(theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
