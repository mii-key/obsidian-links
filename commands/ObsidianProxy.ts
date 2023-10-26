import { App, Notice, RequestUrlParam, RequestUrlResponsePromise, requestUrl } from "obsidian";
import { ILinkTextSuggestContext } from "suggesters/ILinkTextSuggestContext";
import { LinkData } from "utils";

export class ObsidianProxy {

    linkTextSuggestContext: ILinkTextSuggestContext;

    constructor(linkTextSuggestContext: ILinkTextSuggestContext){
        this.linkTextSuggestContext = linkTextSuggestContext;
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