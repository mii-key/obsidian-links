import { INoteView } from "INoteView";
import { DataWriteOptions, TAbstractFile, TFile, TFolder } from "obsidian";
import { LinkData } from "utils";

export interface IVault {
    exists(path: string, caseSensitive?: boolean): Promise<boolean>;
    createNote(path: string, content: string): Promise<TFile>;
    getActiveNoteView(): INoteView | null;
    createFolder(path: string): Promise<TFolder>;
    rename(normalizedPath: string, normalizedNewPath: string): Promise<void>;
    getBacklinksForFileByPath(file: string | TFile): Record<string, LinkData[]> | null;
    read(file: TFile): Promise<string>;
    modify(file: TFile, data: string, options?: DataWriteOptions): Promise<void>;
    getFilesInFolder(folder: TFolder): TFile[];
    getRoot(): TFolder;
    getName(): string;
    delete(file: TAbstractFile, force?: boolean): Promise<void>;
    trash(file: TAbstractFile, system: boolean): Promise<void>;
    getAbstractFileByPath(path: string): TAbstractFile | null;
}