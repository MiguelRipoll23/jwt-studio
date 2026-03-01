// Preload script — contextIsolation bridge
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  saveConfig: (data: string): Promise<boolean> => ipcRenderer.invoke('save-config', data),
  openConfig: (): Promise<string | null> => ipcRenderer.invoke('open-config'),
  readStore: (): Promise<string | null> => ipcRenderer.invoke('read-store'),
  writeStore: (data: string): Promise<void> => ipcRenderer.invoke('write-store', data),
  setTitleBarColor: (theme: string): void => ipcRenderer.send('set-title-bar-color', theme),
  checkForUpdates: (): Promise<{ version: string; url: string } | null> => ipcRenderer.invoke('check-for-updates'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open-external', url),
})
