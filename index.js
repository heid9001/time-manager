const { app, BrowserWindow, Notification } = require('electron')
const path = require('path')
const {startApi} = require('./api');
const {startWorker} = require('./worker');

let server = startApi();
let ival   = startWorker(showNotification)();

function showNotification (msg) {
    new Notification({ title: "Время!", body: msg }).show()
}

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {}
    })
    win.loadFile(path.join(__dirname, 'dist', 'template.html'))
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // if (BrowserWindow.getAllWindows().length === 0) {
        //     createWindow()
        // }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('exit', () => {
    clearInterval(ival);
    server.stop();
});