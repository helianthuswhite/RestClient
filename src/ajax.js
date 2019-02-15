/**
 * Ajax core object.
 *
 * @file src/ajax.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import Plugin from './plugin';
import * as utils from './utils';

export default class Ajax {
    constructor(config) {
        this.config = config || {};

        //  prepare tow plugin queues
        this.req = new Plugin();
        this.res = new Plugin();
    }

    /**
     * Request in XMLHttprequest
     *
     * @param {meta.AjaxOption} options configs
     * @param {meta.AjaxOption.String} options.method request method
     * @param {meta.AjaxOption.String} options.url request url
     * @param {meta.AjaxOption.Number} options.timeout request timeout
     * @param {meta.AjaxOption.Func} options.validateStatus response validateStatus
     * @param {meta.AjaxOption.String} options.responseType response responseType
     * @param {meta.AjaxOption.Bool} options.withCredentials request cors
     * @param {meta.AjaxOption.Func} options.onDownloadProgress download progress
     * @param {meta.AjaxOption.Func} options.onUploadProgress upload progress
     *
     * @return {meta.requseter}
     */
    request(config = {}) {
        return new Promise((resolve, reject) => {
            const options = utils.extend(this.config, config);

            //  to handle request plugins
            this.req.handle(options);

            options.method = options.method ? options.method.toLowerCase() : 'get';

            options.headers = options.headers || {};

            //  set validateStatus function
            options.validateStatus = options.validateStatus
                || (status => status >= 200 && status < 300);

            const xhr = new XMLHttpRequest();

            xhr.open(options.method.toUpperCase(), options.url, true);

            // set timeout handler
            xhr.timeout = options.timeout;

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    // prepare the response
                    const responseHeaders = utils.parseHeaders(xhr.getAllResponseHeaders());

                    const response = {
                        data: xhr.responseText,
                        status: xhr.status === 1223 ? 204 : xhr.status,
                        statusText: xhr.status === 1223 ? 'No Content' : xhr.statusText,
                        headers: responseHeaders,
                        config: options,
                        request: xhr,
                    };

                    //  use plugin to handle response
                    this.res.use((res) => {
                        //  abort this handler when exec
                        this.res.abort();

                        if (options.validateStatus(res.status)) {
                            resolve(res.data);
                        } else {
                            reject(res.data);
                        }
                    });

                    //  to handle response plugins
                    this.res.handle(response);
                }
            };

            // Handle abort
            xhr.onabort = () => {
                // Fix some brower change readyState to 4
                xhr.onreadystatechange = null;

                reject(new Error('Request aborted.'));
            };

            // Handle low level network errors
            xhr.onerror = () => {
                reject(new Error('Network Error.'));
            };

            // Handle timeout
            xhr.ontimeout = () => {
                reject(new Error(`timeout of ${options.timeout}ms exceeded`));
            };

            // Handle progress if needed
            if (typeof options.onDownloadProgress === 'function') {
                xhr.addEventListener('progress', options.onDownloadProgress);
            }

            // Not all browsers support upload events
            if (typeof options.onUploadProgress === 'function' && xhr.upload) {
                xhr.upload.addEventListener('progress', options.onUploadProgress);
            }

            // Add withCredentials to request if needed
            if (options.withCredentials) {
                xhr.withCredentials = true;
            }

            // Add headers to the request
            Object.keys(options.headers).forEach((key) => {
                if (typeof options.data === 'undefined' && key.toLowerCase() === 'content-type') {
                    // Remove Content-Type if data is undefined
                    delete options.headers[key];
                } else {
                    // Otherwise add header to the request
                    xhr.setRequestHeader(key, options.headers[key]);
                }
            });

            // Add responseType to request if needed
            if (options.responseType) {
                xhr.responseType = options.responseType;
            }

            // Send the request
            xhr.send(options.data);
        });
    }
}
