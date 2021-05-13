// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { ipcRenderer } from 'electron';
import { ipcEvent } from "./ipcEvent";

let gameDataHandler = new GameDataHandler();

ipcRenderer.on(ipcEvent.HTMLLoaded, function (event, data) {
    gameDataHandler.init(document);
    
    let saveBtn = document.getElementById("SaveBtn");
    saveBtn.addEventListener("click", function () {
        let allActiveGames = gameDataHandler.getAllActiveGames();
        ipcRenderer.send(ipcEvent.saveButton, allActiveGames);
    });
});

ipcRenderer.on(ipcEvent.readGameData, function (event, data) {
    gameDataHandler.createGameBtn(data);
});