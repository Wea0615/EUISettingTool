class DataHandlerBase {
    protected myDoc: Document;
    protected myDatas: any;
    protected myBlock: HTMLFieldSetElement = null;
    protected dataType: string;
    
    public constructor() {
        
    }

    public init(doc: Document, type: string): void {
        this.myDoc = doc;
        this.dataType = type;
        this.myBlock = this.myDoc.getElementById(this.dataType + "Block") as HTMLFieldSetElement;
    }

    private createSelectAll(): void {
        let selectDiv = this.myDoc.createElement("div");
        this.myBlock.appendChild(selectDiv);

        let selectLabel = this.myDoc.createElement("label");
        selectLabel.className = "switch";
        selectDiv.appendChild(selectLabel);

        let selectInput = this.myDoc.createElement("input");
        selectInput.type = "checkbox";
        selectInput.id = this.dataType + "selectAll";
        selectInput.checked = true;
        selectInput.addEventListener("change" , (event) => {
            let selectAll = event.target as HTMLInputElement;
            this.toggleSelection(selectAll.checked);
        });
        selectLabel.appendChild(selectInput);

        let srSpan = this.myDoc.createElement("span");
        srSpan.className = "slider";
        selectLabel.appendChild(srSpan);

        let selectTitle = this.myDoc.createElement("label");
        selectTitle.textContent = "全選";
        selectDiv.appendChild(selectTitle);
    }

    public createOptions(data: any): void {
        this.createSelectAll();

        this.myDatas = data;
        const optionColumn = 3;
        let colCount = 0;
        let optionDiv: HTMLDivElement;

        for (let option of this.myDatas) {
            if (colCount % optionColumn == 0) {
                optionDiv = this.myDoc.createElement("div");
                this.myBlock.appendChild(optionDiv);
            }
            ++colCount;
            this.generateBtn(optionDiv, option);
        }
    }

    private toggleSelection(isActive: boolean): void {
        let allCheckBox = this.myBlock.querySelectorAll("input");
        allCheckBox.forEach((checkNode) => {
            checkNode.checked = isActive;
        });
    }

    public getAllActiveOptions(): string[] {
        let selected: string[] = [];
        let allCheckBox = this.myBlock.querySelectorAll("input");
    
        allCheckBox.forEach((checkNode) => {
            if (checkNode.checked) {
                selected.push(checkNode.id);
                //console.info(`Checked: ${checkNode.id}`);
            }
        });
    
        return selected;
    }

    private generateBtn(optionDiv: HTMLDivElement, optionData: any) {
        let srLabel = this.myDoc.createElement("label");
        srLabel.className = "switch";
        optionDiv.appendChild(srLabel);

        let srInput = this.myDoc.createElement("input");
        srInput.type = "checkbox";
        srInput.id = optionData.id;
        srInput.checked = true;
        srLabel.appendChild(srInput);

        let srSpan = this.myDoc.createElement("span");
        srSpan.className = "slider round";
        srLabel.appendChild(srSpan);

        let optionTitle = this.myDoc.createElement("label");
        optionTitle.textContent = optionData.name;
        optionDiv.appendChild(optionTitle);
    }
}