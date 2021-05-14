import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { ipcEvent } from "./ipcEvent";

let egretSetting: any;
let wingSetting: any;
let isInitOK: boolean = false;

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true, // for renderer import
            contextIsolation: false
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../index.html")).then(() => {
        mainWindow.webContents.send(ipcEvent.HTMLLoaded);

        if (!fs.existsSync(path.resolve("./setting.json"))) {
            dialog.showErrorBox("無法執行", "找不到遊戲設定檔!!");
            return;
        }

        isInitOK = true;
        //讀取遊戲設定
        let rawdata: any = fs.readFileSync(path.resolve("./setting.json"));
        let gameData = JSON.parse(rawdata);
        mainWindow.webContents.send(ipcEvent.readSettingData, gameData.Games, gameData.Themes);

        let egretRawData: any = fs.readFileSync(path.resolve("./egretProperties.json"));
        egretSetting = JSON.parse(egretRawData);
        //console.info(egretSetting.eui.exmlRoot);

        let wingRawData: any = fs.readFileSync(path.resolve("./wingProperties.json"));
        wingSetting = JSON.parse(wingRawData);
    });

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
}

function initEvents() {
    //儲存按鈕
    ipcMain.on(ipcEvent.saveButton, (event, ...arg) => {
        if (!isInitOK)
            return;

        egretSetting.eui.exmlRoot.length = 0;
        let activeGames = arg[0];
        for (let game of activeGames) {
            let gameSkin = `Games/${game}/resource/skins`;
            egretSetting.eui.exmlRoot.push(gameSkin);
        }

        let egretData = JSON.stringify(egretSetting, null, 2); //保留空白
        fs.writeFileSync(path.resolve("./egretProperties.json"), egretData);

        let index = 0;
        let gameConfig = [];
        let allConfig = wingSetting.resourcePlugin.configs;
        for (let config of allConfig) {
            let path = String(config.configPath);
            if (path.indexOf("Games") > 0) {
                //removeIndex.push(index);
                wingSetting.resourcePlugin.configs.splice(index, 1);
            }
            ++index;
        }

        let activeThemes = arg[1];
        for (let theme of activeThemes) {
            let newConfig = { configPath: `resource/${theme}.res.json`, relativePath: `resource/` };
            wingSetting.resourcePlugin.configs.push(newConfig);
        }
        let wingData = JSON.stringify(wingSetting, null, 2); //保留空白
        fs.writeFileSync(path.resolve("./wingProperties.json"), wingData);
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
