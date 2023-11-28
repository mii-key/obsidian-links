import { INoteView } from "INoteView";
import { Constructor, TFile, View } from "obsidian";

export interface IVault {
    exists(path: string, caseSensitive?: boolean): Promise<boolean>;
    createNote(path: string, content: string): Promise<TFile>;
    getActiveNoteView(): INoteView | null;
    createFolder(path: string) : Promise<void>;
    rename(normalizedPath: string, normalizedNewPath: string): Promise<void>;
}