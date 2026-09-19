/**
 * QuizMaster Pro - Main Electron Process
 * Handles window creation, lifecycle, and secure IPC communication.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 830,
    minWidth: 1024,
    minHeight: 700,
    title: 'QuizMaster Pro',
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,      // Security: Isolate renderer context
      nodeIntegration: false,       // Security: Disable Node.js in renderer
      sandbox: true
    }
  });

  // Remove native menu bar for clean modern UI look
  mainWindow.setMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure data directory and default JSON store exist
const dataDir = path.join(app.getPath('userData'), 'app-data');
const storePath = path.join(dataDir, 'user-data.json');

function initializeStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const defaultData = {
    settings: {
      username: 'Student Explorer',
      soundEnabled: true
    },
    quizHistory: [],
    leaderboard: [
      { name: 'Nawsin Tabassum', score: 95, category: 'JavaScript', date: '2026-02-01' },
      { name: 'Sutopa', score: 90, category: 'HTML', date: '2026-02-03' },
      { name: 'Nirob', score: 85, category: 'CSS', date: '2026-02-05' }
    ]
  };

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// Application Lifecycle
app.whenReady().then(() => {
  initializeStorage();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Communication Handlers
ipcMain.handle('get-app-data', async () => {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading app data:', err);
    return null;
  }
});

ipcMain.handle('save-app-data', async (event, data) => {
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Error saving app data:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-questions', async () => {
  try {
    const questionsPath = path.join(__dirname, 'data', 'questions.json');
    const raw = fs.readFileSync(questionsPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading questions data:', err);
    return [];
  }
});