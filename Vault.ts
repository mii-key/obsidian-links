import { INoteView } from "INoteView";
import { IVault } from "IVault";
import { App, Constructor, DataWriteOptions, LinkCache, MarkdownView, TAbstractFile, TFile, TFolder, Vault, View } from "obsidian";

export class VaultImp implements IVault {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    getFilesInFolder(folder: TFolder): TFile[] {
        let folders: TFolder[] = [];
        let files: TFile[] = [];
        folders.push(folder);
        while (folders.length > 0) {
            const currentFolder = folders.pop();
            if (!currentFolder) {
                break;
            }
            for (let child of currentFolder.children) {
                if (child instanceof TFolder) {
                    folders.push(child);
                } else {
                    files.push(child as TFile);
                }
            }
        }

        return files;
    }

    read(file: TFile): Promise<string> {
        return app.vault.read(file);
    }

    modify(file: TFile, data: string, options?: DataWriteOptions | undefined): Promise<void> {
        return app.vault.modify(file, data, options);
    }

    rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
        return this.app.vault.adapter.rename(normalizedPath, normalizedNewPath);
    }

    createFolder(path: string): Promise<TFolder> {
        return this.app.vault.createFolder(path)
    }

    getActiveNoteView(): INoteView | null {
        return app.workspace.getActiveViewOfType(MarkdownView);
    }
    getName(): string {
        return app.vault.getName();
    }

    exists(path: string, caseSensitive?: boolean): Promise<boolean> {
        return this.app.vault.adapter.exists(path, caseSensitive)
    }
    createNote(path: string, content: string): Promise<TFile> {
        return this.app.vault.create(path, content)
    }

    getBacklinksForFileByPath(path: string): Record<string, LinkCache[]> | null {
        const file = this.app.vault.getAbstractFileByPath(path) as TFile;

        if (file) {
            return this.app.metadataCache.getBacklinksForFile(file).data;
        }

        return null;
    }

    getRoot(): TFolder {
        return this.app.vault.getRoot();
    }

    delete(file: TAbstractFile, force?: boolean | undefined): Promise<void> {
        return this.app.vault.delete(file, force);
    }
    trash(file: TAbstractFile, system: boolean): Promise<void> {
        return this.app.vault.trash(file, system);
    }

    getAbstractFileByPath(path: string): TAbstractFile | null {
        return this.app.vault.getAbstractFileByPath(path);
    }
}