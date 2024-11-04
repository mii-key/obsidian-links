import { INoteView } from "INoteView";
import { IVault, IVaultConfiguration, VaultConfiguration } from "IVault";
import { App, DataWriteOptions, MarkdownView, TAbstractFile, TFile, TFolder } from "obsidian";
import { LinkData, Position } from "utils";

export class VaultImp implements IVault {
    app: App;
    readonly configuration: IVaultConfiguration;

    constructor(app: App) {
        this.app = app;
        this.configuration = new VaultConfiguration(this);
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

    getBacklinksForFileByPath(file: string | TFile): Record<string, LinkData[]> | null {
        const _file = typeof (file) === 'string' ? this.app.vault.getAbstractFileByPath(file) as TFile : file;
        if (_file) {
            const backlinks = this.app.metadataCache.getBacklinksForFile(_file).data;
            if (backlinks === null) {
                return null;
            }
            const backlinksLinkData: Record<string, LinkData[]> = {};


            for (const backlink of backlinks) {
                const [sourceFile, linkCaches] = backlink
                const linkDataArray = new Array<LinkData>();
                for (const linkCache of linkCaches) {
                    const linkData = LinkData.parse(linkCache.original);
                    if (linkData) {
                        linkData.position = new Position(linkCache.position.start.offset, linkCache.position.end.offset);
                        linkDataArray.push(linkData);
                    }
                }
                backlinksLinkData[sourceFile] = linkDataArray;
            }
            return backlinksLinkData;
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
    getConfig(setting: string): boolean | string | number {
        return this.app.vault.getConfig(setting) as boolean | string | number;
    }

    getFiles(): TFile[] {
        return this.app.vault.getFiles()
    }

    getMarkdownFiles(): TFile[] {
        return this.app.vault.getMarkdownFiles()
    }

}