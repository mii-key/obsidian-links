import { IVault } from "IVault";
import { App, CachedMetadata, Editor, HeadingCache, ListItemCache, Notice, RequestUrlParam, RequestUrlResponsePromise, SectionCache, TFile } from "obsidian";
import { IObsidianLinksSettings } from "settings";
import { ButtonInfo } from "ui/PromotModal.common";
import { LinkData } from "utils";

export interface IObsidianProxy {
    app: App;
    Vault: IVault;
    settings: IObsidianLinksSettings;

    createNotice(message: string | DocumentFragment, timeout?: number): Notice
    requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise
    request(request: RequestUrlParam | string): Promise<string>
    clipboardWriteText(text: string): void;
    clipboardReadText(): Promise<string>;
    linkTextSuggestContextSetLinkData(linkData: LinkData, titles: string[]): void;
    showPromptModal(title: string, text: string[], buttons: ButtonInfo[], onSubmit: (result: string) => void): void;
    createLink(sourcePath: string, destination: string, destinationSubPath?: string, text?: string, dimensions?: string): string;
    getFileCache(file: TFile): CachedMetadata | null;
    getBlock(editor: Editor, file: TFile): ListItemCache | HeadingCache | SectionCache | undefined;
}