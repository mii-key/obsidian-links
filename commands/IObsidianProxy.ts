import { Notice, RequestUrlParam, RequestUrlResponsePromise } from "obsidian";

export interface IObsidianProxy {
    createNotice(message: string | DocumentFragment, timeout?: number): Notice
    requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise
    clipboardWriteText(text: string): void;
    clipboardReadText() : Promise<string>;
}