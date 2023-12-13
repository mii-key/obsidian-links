import { ITextBuffer } from "./ITextBuffer";

export class TextBuffer implements ITextBuffer{

    text: string;
    position: number = 0;
   
    constructor(text: string){
        this.text = text;
    }

    getValue(): string {
       return this.text; 
    }
    
    replaceRange(text: string, from: number, to?: number | undefined): void {
        let tmp = this.text.substring(0, from) + text;
        if(to){
            tmp += this.text.substring(to);
        }

        this.text = tmp;
    }

    setPosition(pos: number): void {
        this.position = pos;
    }
}