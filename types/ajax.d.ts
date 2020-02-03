/**
 * types
 *
 * @file types/ajax.d.ts
 * @author helianthuswhite(hyz19960229@gmail.com)
 */


declare type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'CONNECT' | 'TRACE';

declare type ResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';

export interface MethodPlugin {
    plugins: Array<Function>,
    sequence?: number
}

export interface Response {
    data: string,
    status: number,
    statusText: string,
    headers: TSObject,
    config: TSObject,
    request: XMLHttpRequest
}

export interface TSObject {
    [key: string]: any
}

export interface Options {
    method: Method,
    url: string,
    data?: any,
    headers?: TSObject,
    timeout?: number,
    responseType?: ResponseType,
    withCredentials?: boolean,
    validateStatus?: Function,
    onDownloadProgress?: (this: XMLHttpRequest, ev: ProgressEvent<XMLHttpRequestEventTarget>) => any,
    onUploadProgress?: (this: XMLHttpRequestUpload, ev: ProgressEvent<XMLHttpRequestEventTarget>) => any,
    onabort?: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any),
    onerror?: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any),
    ontimeout?: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any)
}

export class Ajax {
    config: Options | TSObject;
    __current: string;
    [key: string]: any;
    requestPlugins: Array<Function>;
    responsePlugins: Array<Function>;
    constructor(config?: Options);
    /**
     * Request in XMLHttprequest
     *
     * @param {meta.AjaxOption} options configs
     * @param {meta.AjaxOption.String} options.method request method
     * @param {meta.AjaxOption.String} options.url request url
     * @param {meta.AjaxOption.any} options.data request data
     * @param {meta.AjaxOption.Object} options.headers request headers
     * @param {meta.AjaxOption.Number} options.timeout request timeout
     * @param {meta.AjaxOption.Func} options.validateStatus response validateStatus
     * @param {meta.AjaxOption.String} options.responseType response responseType
     * @param {meta.AjaxOption.Bool} options.withCredentials request cors
     * @param {meta.AjaxOption.Func} options.onDownloadProgress download progress
     * @param {meta.AjaxOption.Func} options.onUploadProgress upload progress
     * @param {meta.AjaxOption.Func} options.onabort abort handler
     * @param {meta.AjaxOption.Func} options.onerror error handler
     * @param {meta.AjaxOption.Func} options.ontimeout timeout handler
     *
     * @return {meta.requseter}
     */
    request(options?: Options): Promise<unknown>;
}