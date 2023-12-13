
export interface ITextBuffer {
    getValue(): string;
    replaceRange(text: string, from: number, to?: number): void;
    setPosition(offset: number): void;
}