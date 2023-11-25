import { IVault } from "IVault";
import { VaultImp } from "Vault";
import { App, Notice, RequestUrlParam, RequestUrlResponsePromise, requestUrl } from "obsidian";
import { IObsidianLinksSettings } from "settings";
import { ILinkTextSuggestContext } from "suggesters/ILinkTextSuggestContext";
import { LinkData } from "utils";

export class ObsidianProxy {

    linkTextSuggestContext: ILinkTextSuggestContext;
    settings: IObsidianLinksSettings;
    Vault : IVault;
    app: App;

    constructor(app: App, linkTextSuggestContext: ILinkTextSuggestContext, settings: IObsidianLinksSettings){
        this.app = app;
        this.linkTextSuggestContext = linkTextSuggestContext;
        this.settings = settings;

        this.Vault = new VaultImp(app);
    }

    createNotice(message: string | DocumentFragment, timeout?: number) : Notice {
        return new Notice(message, timeout)
    }

    requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise {
        return requestUrl(request)
    }

    clipboardWriteText(text: string): void{
        navigator.clipboard.writeText(text);
    }
    
    clipboardReadText() : Promise<string>{
        return navigator.clipboard.readText();
    }

    linkTextSuggestContextSetLinkData(linkData: LinkData, titles: string[]) : void{
        this.linkTextSuggestContext.setLinkData(linkData, titles);
    }
}