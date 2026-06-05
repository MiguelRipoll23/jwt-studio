import { app, BrowserWindow, Menu, ipcMain, dialog, nativeTheme, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Remove native menu bar entirely
Menu.setApplicationMenu(null)

// Auto-updater
if (app.isPackaged) {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', info.version)
  })

  autoUpdater.on('download-progress', (info) => {
    mainWindow?.webContents.send('update-download-progress', {
      percent: info.percent,
      transferred: info.transferred,
      total: info.total,
    })
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err)
  })
}

let mainWindow: BrowserWindow | null = null;

function getStorePath(): string {
  return path.join(app.getPath('home'), '.jwtstudio', 'config.json');
}

function setTitleBarColor(theme: string) {
  if (!mainWindow) return;
  mainWindow.setBackgroundColor(theme === 'dark' ? '#0d0d0d' : '#f9f9f9');
}

function createWindow() {
  const isDark = nativeTheme.shouldUseDarkColors;
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    backgroundColor: isDark ? '#0d0d0d' : '#f9f9f9',
    title: 'JWT Studio',
    icon: path.join(__dirname, app.isPackaged ? '../dist/icon.png' : '../public/icon.png'),

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow = win

  // Open devtools with F12
  win.webContents.on('before-input-event', (_, input) => {
    if (input.key === 'F12') {
      win.webContents.toggleDevTools()
    }
  })

  if (process.env['VITE_DEV_SERVER_URL']) {
    win.loadURL(process.env['VITE_DEV_SERVER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// IPC: read config file
ipcMain.handle('read-store', async () => {
  try {
    return await readFile(getStorePath(), 'utf-8');
  } catch {
    return null; // file doesn't exist yet
  }
})

// IPC: write config file
ipcMain.handle('write-store', async (_event, data: string) => {
  const storePath = getStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, data, 'utf-8');
})

// IPC: export config to file chosen by the user
ipcMain.handle('save-config', async (event, data: string) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showSaveDialog(win ?? BrowserWindow.getFocusedWindow()!, {
    title: 'Export JWT Studio Config',
    defaultPath: 'jwt-studio-config.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (result.canceled || !result.filePath) return false
  await writeFile(result.filePath, data, 'utf-8')
  return true
})

// IPC: open file picker and return contents
ipcMain.handle('open-config', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showOpenDialog(win ?? BrowserWindow.getFocusedWindow()!, {
    title: 'Import JWT Studio Config',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  })
  if (result.canceled || !result.filePaths[0]) return null
  const { readFile } = await import('node:fs/promises')
  return readFile(result.filePaths[0], 'utf-8')
})

ipcMain.on('set-title-bar-color', (_event, theme: string) => {
  setTitleBarColor(theme);
});

// IPC: check for updates using electron-updater
ipcMain.handle('check-for-updates', () => {
  return new Promise<{ version: string; url: string } | null>((resolve) => {
    if (!app.isPackaged) return resolve(null)

    autoUpdater.checkForUpdates().then((result) => {
      if (!result?.updateInfo) return resolve(null)
      const version = result.updateInfo.version
      const url = `https://github.com/MiguelRipoll23/jwt-studio/releases/tag/v${version}`
      resolve({ version, url })
    }).catch(() => resolve(null))
  })
})

// IPC: restart and install update
ipcMain.on('restart-and-install', () => {
  autoUpdater.quitAndInstall()
})

// IPC: open a URL in the system browser
ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  createWindow()

  if (app.isPackaged) {
    autoUpdater.checkForUpdates()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
