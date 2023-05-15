const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

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

    win.webContents.openDevTools();

}

app.whenReady().then(() => {
    createWindow();
    
    ipcMain.on('close-window', (event) => {
        const win = BrowserWindow.getFocusedWindow();
        win.close();
    });

    ipcMain.on('salvar_arquivo', async function (event, mensagem) {
        const conteudoDoArquivo = mensagem;

        const filePath = path.join(__dirname, 'auto_save.json'); // Caminho do arquivo JSON na pasta raiz
        writeFile(filePath, JSON.stringify(conteudoDoArquivo), 'utf-8', function (err, result) {
          if (err) {
            event.reply('main/salvar_arquivo', { status: 400, msg: 'Erro ao salvar o arquivo' });
            return false;
          }
          //console.log('Arquivo salvo em:', filePath);
          event.reply('main/salvar_arquivo', { status: 200, msg: filePath });
        });
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


//tenta abrir o autosave
const autoSavePath =  path.join(__dirname, 'auto_save.json');
if (fs.existsSync(autoSavePath)) {
  
  fs.readFile(autoSavePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    //console.log(data);
    // Envia a mensagem para o preload
    const win = BrowserWindow.getFocusedWindow();
    win.webContents.send('auto_save_content', data);
  }); 
}