import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { ipcEvent } from "./ipcEvent";

let gameSetting: { id: string; resId: string; name: string }[];
let themeSetting: { id: string; name: string }[];
let egretRawData: any;
let wingRawData: any;
let egretSetting: any;
let wingSetting: any;
let rootPath: string;
let mainWindow: BrowserWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 150,
        center: true,
        useContentSize: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true, // for renderer import
            contextIsolation: false
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../index.html")).then(() => {
        mainWindow.webContents.send(ipcEvent.HTMLLoaded);
    });

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
}

function initEvents() {    
    initSettingData();
    initSaveBtn();
    initResetBtn();
    initFileBtn();
}

/** 接收到egret資料路徑 */
function initSettingData() {
    ipcMain.on(ipcEvent.egretData, (event, arg) => {
        rootPath = arg;

        egretRawData = fs.readFileSync(path.join(rootPath, "./egretProperties.json"));
        egretSetting = JSON.parse(egretRawData);

        wingRawData = fs.readFileSync(path.join(rootPath, "./wingProperties.json"));
        wingSetting = JSON.parse(wingRawData);

        readGameSetting();
        readThemeSetting();
        mainWindow.webContents.send(ipcEvent.readSettingData, gameSetting, themeSetting);

        mainWindow.setSize(800, 750);
        mainWindow.center();
    });
}

/** 儲存按鈕 */
function initSaveBtn() {
    ipcMain.on(ipcEvent.saveButton, (event, ...arg) => {
        let activeGames = arg[0];
        let activeThemes = arg[1];
 
        //#region 儲存egretProperties
        egretSetting.eui.exmlRoot.length = 0;

        for (let theme of activeThemes) {
            let defaultSkin = `resource/skins/${theme.id}/`;
            egretSetting.eui.exmlRoot.push(defaultSkin);
        }

        let themeSkinCnt = 0;
        let noThemeGame: string = "";
        for (let game of activeGames) {
            themeSkinCnt = 0;
            for (let theme of activeThemes) {         
                let gameSkinRoot = `Games/${game.id}/resource/skins/`;
                //檢查是否有skin資料夾
                if (!fs.existsSync(path.join(rootPath, `/${gameSkinRoot}`))) {
                    ++themeSkinCnt; //沒有skin也不計算
                    continue;
                }
                let gameSkin = `${gameSkinRoot}${theme.id}/`;
                //檢查是否有該主題的skin
                if (!fs.existsSync(path.join(rootPath, `/${gameSkin}`))) {
                    continue;
                }
                egretSetting.eui.exmlRoot.push(gameSkin);
                ++themeSkinCnt;
            }

            if (themeSkinCnt == 0) {
                noThemeGame += `${game.id}的Skin沒有預設主題\n`;
            }
        }
        if (noThemeGame.length > 0) {
            dialog.showMessageBox({
                title: "遊戲Skin沒有分主題",
                message: noThemeGame
            });
        }

        let egretData = JSON.stringify(egretSetting, null, 2); //保留空白
        fs.writeFileSync(path.join(rootPath, "./egretProperties.json"), egretData);
        //#endregion

        //#region 儲存wingProperties
        wingSetting.resourcePlugin.configs.length = 0;
        for (let theme of activeThemes) {
            if (theme.id == "default")
                continue;
                
            let newThemeconfig = { configPath: `resource/${theme.id}.res.json`, relativePath: `resource/` };
            wingSetting.resourcePlugin.configs.push(newThemeconfig);
        }
        //default最後塞入
        let defaultThemeconfig = { configPath: `resource/default.res.json`, relativePath: `resource/` };
        wingSetting.resourcePlugin.configs.push(defaultThemeconfig);

        for (let game of activeGames) {
            let gameResId = String(game.resId);
            if (gameResId && gameResId.length > 0) {
                let newGameConfig = {
                    configPath: `Games/${game.id}/resource/${gameResId}.res.json`,
                    relativePath: `Games/${game.id}/resource/`
                };
                wingSetting.resourcePlugin.configs.push(newGameConfig);
            }
        }
        let wingData = JSON.stringify(wingSetting, null, 2); //保留空白
        fs.writeFileSync(path.join(rootPath, "./wingProperties.json"), wingData);
        //#endregion
    });
}

/** 重置按鈕 */
function initResetBtn() {
    ipcMain.on(ipcEvent.resetButton, (event, arg) => {
        //重置egretProperties和wingProperties
        fs.writeFileSync(path.join(rootPath, "./egretProperties.json"), egretRawData);
        fs.writeFileSync(path.join(rootPath, "./wingProperties.json"), wingRawData);
    });
}

/** 選擇檔案視窗 */
function initFileBtn() {
    ipcMain.on(ipcEvent.fileButton, (event, arg) => {
        let egretFileName = "egretProperties";
        dialog.showOpenDialog({
            filters: [{ name: egretFileName, extensions: ["json"] }],
            properties: ["openFile"]
        })
        .then((result) => {
            if (!result.canceled) {
                let filePath = result.filePaths[0];
                if (filePath.indexOf(egretFileName) > 0) {
                    let rootPath = filePath.split(egretFileName)[0];
                    event.reply(ipcEvent.fileBtnResult, rootPath);
                }
            }
        })
        .catch((err) => {
            console.log(err);
        });
    });
}

function readGameSetting() {
    if (!fs.existsSync(path.join(rootPath, "/Games"))) {
        return;
    }

    gameSetting = [];
    const isDirectory = (source: string) => {
        return fs.lstatSync(source).isDirectory();
    };
    const getDirectories = (source: string) => {
        return fs
            .readdirSync(source)
            .map((name) => path.join(source, name))
            .filter(isDirectory);
    };

    let gameFolders = getDirectories(path.join(rootPath, "/Games"));
    gameFolders.forEach((folderPath) => {
        let gameResId = "";
        let gameFolder = folderPath.split(path.sep).pop();
        let gameName = gameFolder;

        let setting = { id: gameFolder, resId: gameResId, name: gameName };
        gameSetting.push(setting);

        fs.readdirSync(path.join(rootPath, `/Games/${gameFolder}/resource`)).forEach((file) => {
            if (file.indexOf("res.json") > 0) {
                gameResId = file.replace(".res.json", "");
                let setting = gameSetting.find((x) => x.id == gameFolder);
                setting.resId = gameResId;
            }
        });
    });
}

function readThemeSetting() {
    if (!fs.existsSync(path.join(rootPath, "/resource"))) {
        dialog.showErrorBox("無法執行", "非合法的Egret資料夾結構!!");
        return;
    }

    themeSetting = [];
    //theme資料由 thm.json判斷
    fs.readdirSync(path.join(rootPath, `/resource`)).forEach((file) => {
        if (file.indexOf("thm.json") > 0) {
            let themeId = file.replace(".thm.json", "");
            let thmSetting = { id: themeId, name: themeId };
            themeSetting.push(thmSetting);
        }
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
