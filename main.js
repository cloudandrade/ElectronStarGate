const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');

//SET ENV
process.env.NODE_ENV = 'development';

//init window
let win;

function createWindow() {
  //create browser window
  win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true, //ativa a integração de pacotes do node 'require'
      contextIsolation: false,
      enableRemoteModule: false,
    },
    //icon: __dirname + '/img/sis.png',
  });

  //load index.html
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  //open dev tools
  //win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });

  //build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  if (mainMenuTemplate.length > 0) {
    //insert menu
    Menu.setApplicationMenu(mainMenu);
  } else {
    win.removeMenu();
  }
}

//Run create window function
app.on('ready', createWindow);

//quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//create menu template
const mainMenuTemplate = [];

//add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toogle Devtools',
        accelerator:
          process.platform == 'darwin' ? 'Command+i' : 'Ctrl+i',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: 'reload',
      },
    ],
  });
}

//##########################################################################
