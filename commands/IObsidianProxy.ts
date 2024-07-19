import { IVault } from "IVault";
import { App, Notice, RequestUrlParam, RequestUrlResponsePromise } from "obsidian";
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
    generateLink(notePath: string, destination: string, destinationSubPath?: string, text?: string): string;
}