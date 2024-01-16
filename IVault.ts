import { INoteView } from "INoteView";
import { DataWriteOptions, LinkCache, TAbstractFile, TFile, TFolder } from "obsidian";

export interface IVault {
    exists(path: string, caseSensitive?: boolean): Promise<boolean>;
    createNote(path: string, content: string): Promise<TFile>;
    getActiveNoteView(): INoteView | null;
    createFolder(path: string): Promise<TFolder>;
    rename(normalizedPath: string, normalizedNewPath: string): Promise<void>;
    getBacklinksForFileByPath(path: string): Record<string, LinkCache[]> | null;
    read(file: TFile): Promise<string>;
    modify(file: TFile, data: string, options?: DataWriteOptions): Promise<void>;
    getFilesInFolder(folder: TFolder): TFile[];
    getRoot(): TFolder;
    getName(): string;
    delete(file: TAbstractFile, force?: boolean): Promise<void>;
    trash(file: TAbstractFile, system: boolean): Promise<void>;
}