class DragHandler {

    private recvFileName: string = "egretProperties";
    private fileDragHandler: HTMLDivElement;
    
    public constructor() {

    }

    public init(doc: Document, callBack: any) {
        this.fileDragHandler = doc.getElementById("file") as HTMLDivElement;
        this.fileDragHandler.ondragover = () => { return false; };
        this.fileDragHandler.ondragleave = () => { return false; };
        this.fileDragHandler.ondragend = () => { return false; };
        this.fileDragHandler.ondrop = (e: DragEvent) => {
            e.preventDefault();

            let path = e.dataTransfer.files[0].path;
            if (path.indexOf(this.recvFileName) > 0) {
                let rootPath = path.split(this.recvFileName)[0];
                callBack(rootPath);
            }
            return false;
        };
    }

    public hide(): void {
        this.fileDragHandler.style.display = "none";
    }
}