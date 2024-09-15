import { INoteView } from "INoteView";
import { DataWriteOptions, TAbstractFile, TFile, TFolder } from "obsidian";
import { LinkData } from "utils";

export interface IVault {
    readonly configuration: IVaultConfiguration;

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
    getConfig(setting: string): boolean | string | number;
}

type NewLinkFormat = 'absolute' | 'shortest' | 'relative';

export interface IVaultConfiguration {
    readonly useMarkdownLinks: boolean;
    //return value: absolute | shortest | relative
    readonly newLinkFormat: NewLinkFormat;
}

export class VaultConfiguration implements IVaultConfiguration {
    vault: IVault;
    constructor(vault: IVault) {
        this.vault = vault;
    }

    get useMarkdownLinks(): boolean {
        return this.vault.getConfig("useMarkdownLinks") as boolean;
    }

    get newLinkFormat(): NewLinkFormat {
        return this.vault.getConfig("newLinkFormat") as NewLinkFormat;
    }
}