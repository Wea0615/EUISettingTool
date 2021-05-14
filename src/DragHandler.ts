class DragHandler {

    private recvFileName: string = "egretProperties";
    
    public constructor() {

    }

    public init(doc: Document, callBack: any) {
        let fileDragHandler = doc.getElementById("file");
        fileDragHandler.ondragover = () => { return false; };
        fileDragHandler.ondragleave = () => { return false; };
        fileDragHandler.ondragend = () => { return false; };
        fileDragHandler.ondrop = (e: DragEvent) => {
            e.preventDefault();

            let path = e.dataTransfer.files[0].path;
            if (path.indexOf(this.recvFileName) > 0) {
                fileDragHandler.style.display = "none";
                let rootPath = path.split(this.recvFileName)[0];
                callBack(rootPath);
            }
            return false;
        };
    }
}