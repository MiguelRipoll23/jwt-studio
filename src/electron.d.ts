// Global injected by Vite define
declare const __APP_VERSION__: string

// Electron preload bridge
interface ElectronAPI {
  platform: string
  saveConfig: (data: string) => Promise<boolean>
  openConfig: () => Promise<string | null>
  readStore: () => Promise<string | null>
  writeStore: (data: string) => Promise<void>
  setTitleBarColor: (theme: string) => void
  checkForUpdates: () => Promise<{ version: string; url: string } | null>
  openExternal: (url: string) => Promise<void>
}

interface Window {
  electronAPI: ElectronAPI
}
