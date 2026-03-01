"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  saveConfig: (data) => electron.ipcRenderer.invoke("save-config", data),
  openConfig: () => electron.ipcRenderer.invoke("open-config"),
  readStore: () => electron.ipcRenderer.invoke("read-store"),
  writeStore: (data) => electron.ipcRenderer.invoke("write-store", data),
  setTitleBarColor: (theme) => electron.ipcRenderer.send("set-title-bar-color", theme)
});
