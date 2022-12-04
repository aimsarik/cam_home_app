const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require("electron-updater");
const isDev = require("electron-is-dev");
const ProgressBar = require('electron-progressbar');
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false,
    }
  })
  win.loadFile('index.html');
  win.setIcon(path.join(__dirname, "/src/assets/home_screen.png"));

  win.maximize();
  
  if (!isDev) {
		autoUpdater.checkForUpdates();
	};
  // wait and show progress bar
  setTimeout(() => {
    var progressBar = new ProgressBar({
      text: 'កំពុងទាញទិន្នន័យ...',
      detail: 'សូមរង់ចាំ...'
    });
    progressBar
      .on('completed', function() {
        console.info(`completed...`);
        progressBar.detail = 'Task completed. Exiting...';
      })
      .on('aborted', function() {
        console.info(`aborted...`);
      });
      win.webContents.on('did-finish-load',WindowsReady);

      function WindowsReady() {
          progressBar.setCompleted();
      }      
  }, 500);
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
autoUpdater.on("checking-for-update", () => {
});
autoUpdater.on("update-available", () => {
  // progresbar with percentage
  var progressBarPer = new ProgressBar({
    indeterminate: false,
    text: 'Preparing data...',
    detail: 'Wait...'
  });

  progressBarPer
    .on('completed', function() {
      console.info(`completed...`);
      progressBarPer.detail = 'Task completed. Exiting...';
    })
    .on('aborted', function(value) {
      console.info(`aborted... ${value}`);
    })
    .on('progress', function(value) {
      progressBarPer.detail = `Value ${value} out of ${progressBarPer.getOptions().maxValue}...`;
    });

  autoUpdater.on("download-progress", (processTrack) => {
    if (processTrack.percent > 0) {
      progressBarPer.value = processTrack.percent;
    }
  });
});

autoUpdater.on("update-not-available", () => {
});

autoUpdater.on("error", (error) => {
});

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  // restart the app and install the update
  autoUpdater.quitAndInstall();
});
