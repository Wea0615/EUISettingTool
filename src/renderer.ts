// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

const { ipcRenderer } = require('electron');
import { ipcEvent } from "./ipcEvent";

var gameBlock: HTMLFieldSetElement = null; //遊戲設定區塊
var themeBlock: HTMLFieldSetElement = null; //主題設定區塊

ipcRenderer.on("domInit", function (event, gameDatas) {
    let saveBtn = document.getElementById("SaveBtn");
    saveBtn.addEventListener("click", function () {
        let allActiveGames = getAllActiveGames();
        ipcRenderer.send(ipcEvent.saveButton, allActiveGames);
    });
});

ipcRenderer.on("game-data", function (event, gameDatas) {
    gameBlock = document.getElementById("gameBlock") as HTMLFieldSetElement;

    const gameColumn = 3;
    let colCount = 0;
    let gameDiv;

    for (let game of gameDatas) {
        if (colCount % gameColumn == 0) {
            gameDiv = document.createElement("div");
            gameBlock.appendChild(gameDiv);
        }
        ++colCount;
        createGameBtn(gameDiv, game);
    }
});

function createGameBtn(gameDiv: HTMLDivElement, gameData: any) {
    let srLabel = document.createElement("label");
    srLabel.className = "switch";
    gameDiv.appendChild(srLabel);

    let srInput = document.createElement("input");
    srInput.type = "checkbox";
    srInput.id = gameData.id;
    srInput.checked = true;
    srLabel.appendChild(srInput);

    let srSpan = document.createElement("span");
    srSpan.className = "slider round";
    srLabel.appendChild(srSpan);

    let gameTitle = document.createElement("label");
    gameTitle.textContent = gameData.name;
    gameDiv.appendChild(gameTitle);
}

ipcRenderer.on("theme-data", function (event, gameDatas) {
    themeBlock = document.getElementById("themeBlock") as HTMLFieldSetElement;
});

function getAllActiveGames() {
    let selectedGame: string[] = [];
    let allCheckBox = gameBlock.querySelectorAll("input");

    allCheckBox.forEach((checkNode) => {
        if (checkNode.checked) {
            selectedGame.push(checkNode.id);
            //console.info(`Checked: ${checkNode.id}`);
        }
    });

    return selectedGame;
}
