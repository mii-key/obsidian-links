//import { Editor, EditorCommandName, EditorPosition, EditorRange, EditorSelection, EditorSelectionOrCaret, EditorTransaction } from "obsidian";

/* istanbul ignore file */

export interface EditorPosition {
    /** @public */
    line: number;
    /** @public */
    ch: number;
}
export interface EditorRange {
    /** @public */
    from: EditorPosition;
    /** @public */
    to: EditorPosition;
}

export interface EditorSelection {
    /** @public */
    anchor: EditorPosition;
    /** @public */
    head: EditorPosition;
}

export interface EditorSelectionOrCaret {
    /** @public */
    anchor: EditorPosition;
    /** @public */
    head?: EditorPosition;
}

export interface EditorChange extends EditorRangeOrCaret {
    /** @public */
    text: string;
}

export interface EditorRangeOrCaret {
    /** @public */
    from: EditorPosition;
    /** @public */
    to?: EditorPosition;
}


export type EditorCommandName = 'goUp' | 'goDown' | 'goLeft' | 'goRight' | 'goStart' | 'goEnd' | 'goWordLeft' | 'goWordRight' | 'indentMore' | 'indentLess' | 'newlineAndIndent' | 'swapLineUp' | 'swapLineDown' | 'deleteLine' | 'toggleFold' | 'foldAll' | 'unfoldAll';

export interface EditorTransaction {}

export class EditorMock {
    constructor() {
        this.getValue = this.__mocks.getValue
        this.setValue = this.__mocks.setValue
        this.getCursor = this.__mocks.getCursor
        this.setCursor = this.__mocks.setCursor
        this.posToOffset = this.__mocks.posToOffset
        this.offsetToPos = this.__mocks.offsetToPos
        this.replaceRange = this.__mocks.replaceRange
        this.getSelection = this.__mocks.getSelection
        this.setSelection = this.__mocks.setSelection
        this.replaceSelection = this.__mocks.replaceSelection
    }
    __mocks : {
        getValue : jest.Mock
        setValue : jest.Mock
        getCursor : jest.Mock
        setCursor : jest.Mock
        posToOffset : jest.Mock
        offsetToPos : jest.Mock
        replaceRange : jest.Mock
        getSelection : jest.Mock
        setSelection : jest.Mock
        replaceSelection : jest.Mock
    } = {
        getValue : jest.fn(),
        setValue : jest.fn(),
        getCursor : jest.fn(),
        setCursor : jest.fn(),
        posToOffset : jest.fn(),
        offsetToPos : jest.fn(),
        replaceRange : jest.fn(),
        getSelection : jest.fn(),
        setSelection : jest.fn(),
        replaceSelection : jest.fn()

    }
    refresh(): void {
        throw new Error('Method not implemented.');
    }
    getValue(): string {
        throw new Error('Method not implemented.');
    }
    setValue(content: string): void {
        throw new Error('Method not implemented.');
    }
    getLine(line: number): string {
        throw new Error('Method not implemented.');
    }
    lineCount(): number {
        throw new Error('Method not implemented.');
    }
    lastLine(): number {
        throw new Error('Method not implemented.');
    }
    getSelection(): string {
        throw new Error('Method not implemented.');
    }
    getRange(from: EditorPosition, to: EditorPosition): string {
        throw new Error('Method not implemented.');
    }
    replaceSelection(replacement: string, origin?: string | undefined): void {
        throw new Error('Method not implemented.');
    }
    replaceRange(replacement: string, from: EditorPosition, to?: EditorPosition | undefined, origin?: string | undefined): void {
        throw new Error('Method not implemented.');
    }
    getCursor(string?: 'from' | 'to' | 'head' | 'anchor' | undefined): EditorPosition {
        throw new Error('Method not implemented.');
    }
    listSelections(): EditorSelection[] {
        throw new Error('Method not implemented.');
    }
    setSelection(anchor: EditorPosition, head?: EditorPosition | undefined): void {
        throw new Error('Method not implemented.');
    }
    setSelections(ranges: EditorSelectionOrCaret[], main?: number | undefined): void {
        throw new Error('Method not implemented.');
    }
    focus(): void {
        throw new Error('Method not implemented.');
    }
    blur(): void {
        throw new Error('Method not implemented.');
    }
    hasFocus(): boolean {
        throw new Error('Method not implemented.');
    }
    getScrollInfo(): { top: number; left: number; } {
        throw new Error('Method not implemented.');
    }
    scrollTo(x?: number | null | undefined, y?: number | null | undefined): void {
        throw new Error('Method not implemented.');
    }
    scrollIntoView(range: EditorRange, center?: boolean | undefined): void {
        throw new Error('Method not implemented.');
    }
    undo(): void {
        throw new Error('Method not implemented.');
    }
    redo(): void {
        throw new Error('Method not implemented.');
    }
    exec(command: EditorCommandName): void {
        throw new Error('Method not implemented.');
    }
    transaction(tx: EditorTransaction, origin?: string | undefined): void {
        throw new Error('Method not implemented.');
    }
    wordAt(pos: EditorPosition): EditorRange | null {
        throw new Error('Method not implemented.');
    }
    posToOffset(pos: EditorPosition): number {
        throw new Error('Method not implemented.');
    }
    offsetToPos(offset: number): EditorPosition {
        throw new Error('Method not implemented.');
    }
    getDoc(): this{
        throw new Error('Method not implemented.');
    }

    setLine(n: number, text: string): void{

    }

    somethingSelected(): boolean{
        throw new Error('Method not implemented.');

    }

    setCursor(pos: EditorPosition | number, ch?: number): void{

    }
    processLines<T>(read: (line: number, lineText: string) => T | null, write: (line: number, lineText: string, value: T | null) => EditorChange | void, ignoreEmpty?: boolean): void{

    }


}
