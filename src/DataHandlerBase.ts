class DataHandlerBase {
    protected myDoc: Document;
    protected myDatas: any;
    protected myBlock: HTMLFieldSetElement = null;
    protected blockName: string;

    public constructor() {
        
    }

    public init(doc: Document, block: string): void {
        this.myDoc = doc;
        this.blockName = block;
        this.myBlock = this.myDoc.getElementById(this.blockName) as HTMLFieldSetElement;
    }

    public createOptions(data: any): void {
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