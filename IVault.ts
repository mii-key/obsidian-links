import { INoteView } from "INoteView";
import { Constructor, DataWriteOptions, LinkCache, TFile, TFolder, View } from "obsidian";

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
}