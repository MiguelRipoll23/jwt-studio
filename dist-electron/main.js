import { Menu, ipcMain, BrowserWindow, dialog, app, nativeTheme } from "electron";
import { fileURLToPath } from "node:url";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
Menu.setApplicationMenu(null);
let mainWindow = null;
function getStorePath() {
  return path.join(app.getPath("home"), ".jwtstudio", "config.json");
}
function setTitleBarColor(theme) {
  if (!mainWindow) return;
  mainWindow.setBackgroundColor(theme === "dark" ? "#0d0d0d" : "#f9f9f9");
}
function createWindow() {
  const isDark = nativeTheme.shouldUseDarkColors;
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    titleBarStyle: "default",
    backgroundColor: isDark ? "#0d0d0d" : "#f9f9f9",
    title: "JWT Studio",
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env["VITE_DEV_SERVER_URL"]) {
    mainWindow.loadURL(process.env["VITE_DEV_SERVER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
}
ipcMain.handle("read-store", async () => {
  try {
    return await readFile(getStorePath(), "utf-8");
  } catch {
    return null;
  }
});
ipcMain.handle("write-store", async (_event, data) => {
  const storePath = getStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, data, "utf-8");
});
ipcMain.handle("save-config", async (event, data) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showSaveDialog(win ?? BrowserWindow.getFocusedWindow(), {
    title: "Export JWT Studio Config",
    defaultPath: "jwt-studio-config.json",
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (result.canceled || !result.filePath) return false;
  await writeFile(result.filePath, data, "utf-8");
  return true;
});
ipcMain.handle("open-config", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win ?? BrowserWindow.getFocusedWindow(), {
    title: "Import JWT Studio Config",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const { readFile: readFile2 } = await import("node:fs/promises");
  return readFile2(result.filePaths[0], "utf-8");
});
ipcMain.on("set-title-bar-color", (_event, theme) => {
  setTitleBarColor(theme);
});
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
