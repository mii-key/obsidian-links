import { Notice, RequestUrlParam, RequestUrlResponsePromise, requestUrl } from "obsidian";

export class ObsidianProxy {

    createNotice(message: string | DocumentFragment, timeout?: number) : Notice {
        return new Notice(message, timeout)
    }

    requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise {
        return requestUrl(request)
    }
}