import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as fs from 'fs';
import { ipcEvent } from "./ipcEvent";

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true, // for renderer import
            contextIsolation: false,
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../index.html")).then(() => {
        mainWindow.webContents.send(ipcEvent.HTMLLoaded);

        //讀取遊戲設定
        let rawdata:any = fs.readFileSync(path.resolve(__dirname, "setting.json"));
        let gameData = JSON.parse(rawdata);
        mainWindow.webContents.send(ipcEvent.readGameData, gameData.Games);
    });

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

function initEvents() {
    //儲存按鈕
    ipcMain.on(ipcEvent.saveButton, (event, arg) => {
        console.info(arg);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow();
    initEvents();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});