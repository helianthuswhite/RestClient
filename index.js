define(function () { 'use strict';

    /**
     * Plugin Object to deal with plugins.
     *
     * @file src/plugin.js
     * @author helianthuswhite(hyz19960229@gmail.com)
     */

    class Plugin {
        constructor() {
            this.stack = [];
            this.index = 0;
            this.options = null;
        }

        //  use a plugin
        use(fn) {
            if (typeof fn !== 'function') {
                throw new Error('The plugin should be a function.');
            }

            this.stack.push(fn);

            return this;
        }

        //  remove a plugin by index
        abort(index) {
            if (index) {
                this.stack.splice(index, 1);
            } else {
                this.stack.pop();
            }

            return this;
        }

        //  hanlde plugins in order
        handle(options) {
            this.index = 0;
            this.options = options;

            const next = err => {
                const fn = this.stack[this.index++];

                if (!fn) {
                    return;
                }

                this.__call(fn, err, next);
            };

            next();
        }

        __call(fn, err, next) {
            //  catch error to next
            try {
                if (err && fn.length === 3) {
                    fn(err, this.options, next);
                    return;
                }
                if (!err && fn.length < 3) {
                    fn(this.options, next);
                    return;
                }
            } catch (e) {
                /*  eslint-disable */
                err = e;
                /*  eslint-enable */
            }

            next(err);
        }
    }

    /**
     * Utils
     *
     * @file src/utils.js
     * @author helianthuswhite(hyz19960229@gmail.com)
     */

    // parseHeaders https://github.com/axios/helper/parseHeaders.js
    const parseHeaders = headers => {
        const parsed = {};
        const ignoreDuplicateOf = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'];

        if (headers) {
            headers.split('\n').forEach(line => {
                const i = line.indexOf(':');
                const key = line.substr(0, i).trim().toLowerCase();
                const val = line.substr(i + 1).trim();

                if (key) {
                    if (parsed[key] && ignoreDuplicateOf.indexOf(key) > -1) {
                        return;
                    }
                    if (key === 'set-cookie') {
                        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
                    } else {
                        parsed[key] = parsed[key] ? `${parsed[key]}, ${val}` : val;
                    }
                }
            });
        }

        return parsed;
    };

    const extend = (...args) => {
        const obj = {};
        for (let i = 0; i < args.length; i++) {
            const source = args[i];
            for (const prop in source) {
                if ({}.hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    };

    const isObject = obj => obj === Object(obj);

    const getQuery = obj => {
        let query = '';

        if (!isObject(obj) || !Object.keys(obj).length) {
            return query;
        }

        Object.keys(obj).forEach(key => {
            const str = `&${key}=${obj[key]}`;
            query += str;
        });

        return query.replace('&', '?');
    };

    /**
     * Ajax core object.
     *
     * @file src/ajax.js
     * @author helianthuswhite(hyz19960229@gmail.com)
     */

    class Ajax {
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
                const options = extend(this.config, config);

                //  to handle request plugins
                this.req.handle(options);

                options.method = options.method ? options.method.toLowerCase() : 'get';

                options.headers = options.headers || {};

                //  set validateStatus function
                options.validateStatus = options.validateStatus || (status => status >= 200 && status < 300);

                const xhr = new XMLHttpRequest();

                xhr.open(options.method.toUpperCase(), options.url, true);

                // set timeout handler
                xhr.timeout = options.timeout;

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        // prepare the response
                        const responseHeaders = parseHeaders(xhr.getAllResponseHeaders());

                        const response = {
                            data: xhr.responseText,
                            status: xhr.status === 1223 ? 204 : xhr.status,
                            statusText: xhr.status === 1223 ? 'No Content' : xhr.statusText,
                            headers: responseHeaders,
                            config: options,
                            request: xhr
                        };

                        //  use plugin to handle response
                        this.res.use(res => {
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
                Object.keys(options.headers).forEach(key => {
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

    /**
     * a request plugin
     *
     * @file src/plugins/request.js
     * @author helianthuswhite(hyz19960229@gmail.com)
     */

    var requestPlugin = (() => (req, next) => {
        //  set default request headers
        req.headers = req.headers || {};
        req.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

        if (isObject(req.data)) {
            req.headers['Content-Type'] = 'application/json;charset=utf-8';
            req.data = JSON.stringify(req.data);
        }

        //  set requester info
        req.headers['X-Request-By'] = 'RestClient';

        //  set csrftoken
        req.headers.csrftoken = new Date().getTime();

        //  to handle next plugin
        next();
    });

    /**
     * a response plugin
     *
     * @file src/plugins/response.js
     * @author helianthuswhite(hyz19960229@gmail.com)
     */

    var responsePlugin = (() => (res, next) => {
        if (typeof res.data === 'string') {
            try {
                res.data = JSON.parse(res.data);
            } catch (e) {/* Ignore */}
        }

        next();
    });

    /**
     * Abstract class
     *
     * @file src/client.js
     * @author helianthuswhite(hyz19960229@gmail.com)
     */

    class Client extends Ajax {
        constructor(config) {
            super(config);

            this.initMethods();

            this.req.use(requestPlugin());
            this.res.use(responsePlugin());
        }

        initMethods() {
            ['post', 'put'].forEach(item => {
                this[item] = (url, data, config = {}) => {
                    const options = extend({
                        url,
                        data,
                        method: item
                    }, config);

                    return this.request(options);
                };
            });

            ['get', 'delete'].forEach(item => {
                this[item] = (url, data, config = {}) => {
                    const options = extend({
                        url: url + getQuery(data),
                        method: item
                    }, config);

                    return this.request(options);
                };
            });
        }
    }

    return Client;

});
