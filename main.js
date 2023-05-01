const { app, BrowserWindow, ipcMain,Menu  } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({    
    width: 800,
    height: 600,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be',
      height: 33
    }
  });

  win.loadFile('index.html'); 

  // Remover o menu padrão
  //win.webContents.openDevTools();
  
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('close-window', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    win.close();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
