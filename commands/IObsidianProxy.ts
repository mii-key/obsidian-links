import { IVault } from "IVault";
import { Notice, RequestUrlParam, RequestUrlResponsePromise } from "obsidian";
import { IObsidianLinksSettings } from "settings";
import { LinkData } from "utils";

export interface IObsidianProxy {
    Vault: IVault;
    createNotice(message: string | DocumentFragment, timeout?: number): Notice
    requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise
    clipboardWriteText(text: string): void;
    clipboardReadText() : Promise<string>;
    linkTextSuggestContextSetLinkData(linkData: LinkData, titles: string[]) : void;
    settings: IObsidianLinksSettings;
}