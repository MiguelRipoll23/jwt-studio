import type { ThemeMode } from '../types';

export const THEME_KEY = 'jwt-studio-theme';

/** Resolves a ThemeMode ('system'|'light'|'dark') to an actual light/dark theme. */
export function resolveTheme(themeMode: ThemeMode): 'light' | 'dark' {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
}

/** Applies a resolved theme to the document (replaces SDK's applyDocumentTheme). */
export function applyDocumentTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.backgroundColor = theme === 'dark' ? '#0d0d0d' : '#f9f9f9';
}
