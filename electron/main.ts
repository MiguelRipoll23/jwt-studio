import { app, BrowserWindow, Menu, ipcMain, dialog, nativeTheme, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { request } from 'node:https'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Remove native menu bar entirely
Menu.setApplicationMenu(null)

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
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    backgroundColor: isDark ? '#0d0d0d' : '#f9f9f9',
    title: 'JWT Studio',

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
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

// IPC: check GitHub for the latest release
ipcMain.handle('check-for-updates', () => {
  return new Promise<{ version: string; url: string } | null>((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/MiguelRipoll23/jwt-studio/releases/latest',
      headers: { 'User-Agent': 'jwt-studio-app' },
    };
    const req = request(options, (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      res.on('end', () => {
        try {
          const json = JSON.parse(body) as { tag_name?: string; html_url?: string };
          if (!json.tag_name) return resolve(null);
          const version = json.tag_name.replace(/^v/, '');
          resolve({ version, url: json.html_url ?? 'https://github.com/MiguelRipoll23/jwt-studio/releases/latest' });
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
});

// IPC: open a URL in the system browser
ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
