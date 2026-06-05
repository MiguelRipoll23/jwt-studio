// In preload.mjs (or .ts):
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  saveConfig: (data) => ipcRenderer.invoke('save-config', data),
  openConfig: () => ipcRenderer.invoke('open-config'),
  readStore: () => ipcRenderer.invoke('read-store'),
  writeStore: (data) => ipcRenderer.invoke('write-store', data),
  setTitleBarColor: (theme) => ipcRenderer.send('set-title-bar-color', theme),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_event, version) => callback(version))
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (_event, info) => callback(info))
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (_event, info) => callback(info))
  },
  restartAndInstall: () => {
    ipcRenderer.send('restart-and-install')
  },
});
