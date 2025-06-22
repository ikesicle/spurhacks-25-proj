import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    }
  });

  // During development, load Vite dev server:
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
    console.log(process.sandboxed);
  } else {
    // In production, load built React index.html
    win.loadFile('dist/renderer/index.html');
  }
}

// IPC handlers for file operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('create-file', async (event, filePath) => {
  try {
    fs.writeFileSync(filePath, '', { flag: 'wx' });
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

app.whenReady().then(createWindow);
