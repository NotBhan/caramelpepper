
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

/**
 * Main Electron process for CaramelPepper.
 * Spawns the native window and handles IPC communication with the Next.js frontend.
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'CaramelPepper',
    backgroundColor: '#000000',
    show: false, // Do not show the window until it is ready to be painted
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Check for development environment
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    // In dev mode, we load the Next.js dev server on port 9002
    win.loadURL('http://localhost:9002');
  } else {
    // [PRODUCTION PLACEHOLDER]: Load the production build
    win.loadFile(path.join(__dirname, '../out/index.html')).catch(() => {
      // Fallback for custom server setups
      win.loadURL('http://localhost:9002');
    });
  }

  // Optimize perceived boot time by only showing the window when content is ready
  win.once('ready-to-show', () => {
    win.show();
    if (isDev) {
      win.webContents.openDevTools();
    }
  });

  win.on('page-title-updated', (e) => e.preventDefault());
}

app.whenReady().then(() => {
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

// Example IPC handler to test the bridge
ipcMain.handle('ping', () => 'CaramelPepper Bridge: Online');
