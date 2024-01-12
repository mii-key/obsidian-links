import { INoteView } from "INoteView";
import { IVault } from "IVault";
import { DataWriteOptions, FileStats, LinkCache, Vault } from "obsidian";

export abstract class TAbstractFile {
    /**
     * @public
     */
    vault: Vault;
    /**
     * @public
     */
    path: string;
    /**
     * @public
     */
    name: string;
    /**
     * @public
     */
    parent: TFolder;

    constructor(path: string, parent: TFolder) {
        this.path = path;
        const tmp = path.split('/');
        this.name = tmp[tmp.length - 1];
        this.parent = parent;
    }
}


export class TFolder extends TAbstractFile {

    isRootFolder: boolean;

    children: TAbstractFile[];

    constructor(path: string, parent: TFolder, isRoot: boolean = false) {
        super(path, parent);
        this.children = [];
        this.isRootFolder = isRoot;
    }

    /**
     * @public
     */
    isRoot(): boolean {
        return this.isRootFolder;
    }

}

export class TFile extends TAbstractFile {

    /**
     * @public
     */
    stat: FileStats;
    /**
     * @public
     */
    basename: string;
    /**
     * @public
     */
    extension: string;

    constructor(path: string, parent: TFolder) {
        super(path, parent);
        const dotIdx = path.lastIndexOf('.');
        if (dotIdx >= 0) {
            this.extension = path.substring(dotIdx + 1);
        }

        const baseNameEndIdx = dotIdx >= 0 ? dotIdx : path.length;
        const slashIdx = path.lastIndexOf('/', baseNameEndIdx);
        this.basename = path.substring(slashIdx >= 0 ? slashIdx + 1 : 0, baseNameEndIdx);
    }

}


export class VaultMock implements IVault {
    __mocks: {
        getFilesInFolder: jest.Mock,
        read: jest.Mock,
        modify: jest.Mock,
        rename: jest.Mock,
        createFolder: jest.Mock,
        getActiveNoteView: jest.Mock,
        exists: jest.Mock,
        createNote: jest.Mock,
        getBacklinksForFileByPath: jest.Mock
    } = {
            getFilesInFolder: jest.fn(),
            read: jest.fn(),
            modify: jest.fn(),
            rename: jest.fn(),
            createFolder: jest.fn(),
            getActiveNoteView: jest.fn(),
            exists: jest.fn(),
            createNote: jest.fn(),
            getBacklinksForFileByPath: jest.fn(),
        }

    constructor() {
        this.getFilesInFolder = this.__mocks.getFilesInFolder;
        this.read = this.__mocks.read;
        this.modify = this.__mocks.modify;
        this.rename = this.__mocks.rename;
        this.createFolder = this.__mocks.createFolder;
        this.getActiveNoteView = this.__mocks.getActiveNoteView;
        this.exists = this.__mocks.exists;
        this.createNote = this.__mocks.createNote;
        this.getBacklinksForFileByPath = this.__mocks.getBacklinksForFileByPath;
    }

    getFilesInFolder(folder: TFolder): TFile[] {
        throw new Error('Method not implemented.');

    }

    read(file: TFile): Promise<string> {
        throw new Error('Method not implemented.');
    }

    modify(file: TFile, data: string, options?: DataWriteOptions | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    createFolder(path: string): Promise<TFolder> {
        throw new Error('Method not implemented.');
    }

    getActiveNoteView(): INoteView | null {
        throw new Error('Method not implemented.');
    }

    exists(path: string, caseSensitive?: boolean): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    createNote(path: string, content: string): Promise<TFile> {
        throw new Error('Method not implemented.');
    }

    getBacklinksForFileByPath(path: string): Record<string, LinkCache[]> | null {
        throw new Error('Method not implemented.');
    }

    getRoot(): TFolder {
        return {
            isRootFolder: true,
            children: [],
            vault: null as any,
            isRoot: () => true,
            path: '/',
            name: '/',
            parent: null as any
        };
    }

}