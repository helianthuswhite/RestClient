/**
 * Ajax core object.
 *
 * @file src/ajax.ts
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import {Options, Response, TSObject} from 'ajax';
import Plugin from './plugin';
import * as utils from './utils';

export default class Ajax {
    config: Options | TSObject;

    __current: string;

    [key: string]: any;

    requestPlugins: Array<Function> = [];

    responsePlugins: Array<Function> = [];

    constructor(config?: Options) {
        this.config = config;
    }

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
    request(config: Options): Promise<any> {
        const current = this.__current || 'get';
        const currentRequestPlugins = this[`${current}requestPlugins`] || [];
        const currentResponsePlugins = this[`${current}responsePlugins`] || [];
        const requestHandler = new Plugin(utils.getPlugins(this.requestPlugins, currentRequestPlugins));
        const responseHandler = new Plugin(utils.getPlugins(this.responsePlugins, currentResponsePlugins));

        //  Clear the current
        this.__current = '';

        return new Promise((resolve, reject) => {
            //  response handler
            const resultHandler = (xhr: XMLHttpRequest, opt: Options): void => {
                // Prepare the response
                const responseHeaders = utils.parseHeaders(xhr.getAllResponseHeaders());

                const response: Response = {
                    data: xhr.responseText,
                    status: xhr.status === 1223 ? 204 : xhr.status,
                    statusText: xhr.status === 1223 ? 'No Content' : xhr.statusText,
                    headers: responseHeaders,
                    config: opt,
                    request: xhr
                };

                //  use plugin to handle response
                responseHandler.use((res: Response) => {
                    responseHandler.abort();

                    if (opt.validateStatus && opt.validateStatus(res.status)) {
                        resolve(res.data);
                    } else {
                        reject(res.data);
                    }
                });

                //  to handle response plugins
                responseHandler.handle(response);
            };

            const options = utils.extend({method: 'GET', url: ''}, this.config, config) as Options;

            options.headers = options.headers || {};

            if (options.validateStatus) {
                options.validateStatus = options.validateStatus;
            } else {
                options.validateStatus = ((status: number): boolean => status >= 200 && status <= 300);
            }

            //  to handle request plugins
            requestHandler.handle(options);

            const xhr = new XMLHttpRequest();

            xhr.open(options.method.toUpperCase(), options.url, true);

            // Set timeout handler
            xhr.timeout = options.timeout || 0;

            //  Use onloadend to handle result
            //  IE & Edge may not support
            if (!utils.isUndefined(xhr.onloadend)) {
                xhr.onloadend = (): void => resultHandler(xhr, options);
            } else {
                xhr.onreadystatechange = (): void => {
                    if (xhr.readyState === 4) {
                        resultHandler(xhr, options);
                    }
                };
            }

            // Handle abort
            xhr.onabort = options.onabort || null;

            // Handle low level network errors
            xhr.onerror = options.onerror || null;

            // Handle timeout
            xhr.ontimeout = options.ontimeout || null;

            // Add headers to the request
            Object.keys(options.headers).forEach((key: string) => {
                if (typeof options.data === 'undefined' && key.toLowerCase() === 'content-type') {
                    // Remove Content-Type if data is undefined
                    delete options.headers[key];
                } else {
                    // Otherwise add header to the request
                    xhr.setRequestHeader(key, options.headers[key]);
                }
            });

            // Add withCredentials to request if needed
            if (options.withCredentials) {
                xhr.withCredentials = true;
            }

            // Add responseType to request if needed
            if (options.responseType) {
                xhr.responseType = options.responseType;
            }

            // Handle progress if needed
            if (typeof options.onDownloadProgress === 'function') {
                xhr.addEventListener('progress', options.onDownloadProgress);
            }

            // Not all browsers support upload events
            if (typeof options.onUploadProgress === 'function' && xhr.upload) {
                xhr.upload.addEventListener('progress', options.onUploadProgress);
            }

            // Send the request
            xhr.send(options.data);
        });
    }
}
