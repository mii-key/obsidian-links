import { INoteView } from "INoteView";
import { IVault } from "IVault";
import { App, Constructor, MarkdownView, TFile, Vault, View } from "obsidian";

export class VaultImp implements IVault {
    app: App;

    constructor(app: App){
        this.app = app;
    }    
    rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
        return this.app.vault.adapter.rename(normalizedPath, normalizedNewPath);
    }
    
    createFolder(path: string): Promise<void> {
        return this.app.vault.createFolder(path)
    }

    getActiveNoteView(): INoteView | null {
        return app.workspace.getActiveViewOfType(MarkdownView);
    }

    exists(path: string, caseSensitive?: boolean): Promise<boolean> {
        return this.app.vault.adapter.exists(path, caseSensitive)
    }
    createNote(path: string, content: string): Promise<TFile> {
        return this.app.vault.create(path, content)
    }
}