// In preload.mjs (or .ts):
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  saveConfig: (data) => ipcRenderer.invoke('save-config', data),
  openConfig: () => ipcRenderer.invoke('open-config'),
  setTitleBarColor: (color) => ipcRenderer.send('set-title-bar-color', color),
});
