
export class Notice {
    setMessage(message: string | DocumentFragment): this{
        throw new Error('Method not implemented.');
    }
    hide(): void{
        throw new Error('Method not implemented.');
    }
}

export interface RequestUrlParam {
    /** @public */
    url: string;
    /** @public */
    method?: string;
    /** @public */
    contentType?: string;
    /** @public */
    body?: string | ArrayBuffer;
    /** @public */
    headers?: Record<string, string>;
    /**
     * Whether to throw an error when the status code is >= 400
     * Defaults to true
     * @public
     */
    throw?: boolean;
}

export interface RequestUrlResponse {
    /** @public */
    status: number;
    /** @public */
    headers: Record<string, string>;
    /** @public */
    arrayBuffer: ArrayBuffer;
    /** @public */
    json: any;
    /** @public */
    text: string;
}

export interface RequestUrlResponsePromise extends Promise<RequestUrlResponse> {
    /** @public */
    arrayBuffer: Promise<ArrayBuffer>;
    /** @public */
    json: Promise<any>;
    /** @public */
    text: Promise<string>;
}

export class ObsidianProxyMock {

    __mocks: {
        NoticeMock : {
            setMessage: jest.Mock
            hide: jest.Mock
        }
        requestUrlMock: jest.Mock
    } = {
        NoticeMock : {
            setMessage: jest.fn(),
            hide: jest.fn()
        },
        requestUrlMock: jest.fn()
    }

    createNotice(message: string | DocumentFragment, timeout?: number) : Notice {
        return this.__mocks.NoticeMock;
    }

    requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise {
        return this.__mocks.requestUrlMock()
    }
}