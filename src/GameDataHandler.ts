class GameDataHandler {
    private myDoc: Document;
    private gameDatas: any;
    private gameBlock: HTMLFieldSetElement = null; //遊戲設定區塊

    public constructor() {
        
    }

    public init(doc: Document): void {
        this.myDoc = doc;
        this.gameBlock = this.myDoc.getElementById("gameBlock") as HTMLFieldSetElement;
    }

    public createGameBtn(data: any): void {
        this.gameDatas = data;
        const gameColumn = 3;
        let colCount = 0;
        let gameDiv: HTMLDivElement;

        for (let game of this.gameDatas) {
            if (colCount % gameColumn == 0) {
                gameDiv = this.myDoc.createElement("div");
                this.gameBlock.appendChild(gameDiv);
            }
            ++colCount;
            this.generateBtn(gameDiv, game);
        }
    }

    public getAllActiveGames(): string[] {
        let selectedGame: string[] = [];
        let allCheckBox = this.gameBlock.querySelectorAll("input");
    
        allCheckBox.forEach((checkNode) => {
            if (checkNode.checked) {
                selectedGame.push(checkNode.id);
                //console.info(`Checked: ${checkNode.id}`);
            }
        });
    
        return selectedGame;
    }

    private generateBtn(gameDiv: HTMLDivElement, gameData: any) {
        let srLabel = this.myDoc.createElement("label");
        srLabel.className = "switch";
        gameDiv.appendChild(srLabel);

        let srInput = this.myDoc.createElement("input");
        srInput.type = "checkbox";
        srInput.id = gameData.id;
        srInput.checked = true;
        srLabel.appendChild(srInput);

        let srSpan = this.myDoc.createElement("span");
        srSpan.className = "slider round";
        srLabel.appendChild(srSpan);

        let gameTitle = this.myDoc.createElement("label");
        gameTitle.textContent = gameData.name;
        gameDiv.appendChild(gameTitle);
    }
}