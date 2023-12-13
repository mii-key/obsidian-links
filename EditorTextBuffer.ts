import { ITextBuffer } from "ITextBuffer";
import { Editor, EditorPosition } from "obsidian";

export class EditorTextBuffer implements ITextBuffer{

    editor: Editor;

    constructor(editor: Editor){
        this.editor = editor;
    }

    getValue(): string {
        return this.editor.getValue();
    }

    replaceRange(text: string, from: number, to?: number | undefined): void {
        let posTo : EditorPosition | undefined;
        if(to){
            posTo = this.editor.offsetToPos(to);
        }
        this.editor.replaceRange(text, this.editor.offsetToPos(from), posTo);
    }

    setPosition(offset: number): void {
        this.editor.setCursor(this.editor.offsetToPos(offset));
    }
}