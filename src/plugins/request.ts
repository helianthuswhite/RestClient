/**
 * a request plugin
 *
 * @file src/plugins/request.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import { Options } from 'ajax';
import * as utils from '../utils';

export default (): Function => (req: Options, next: Function): void => {
    //  set default request headers
    req.headers = req.headers || {};

    if (utils.isObject(req.data) && !(req.data instanceof FormData)) {
        req.headers['Content-Type'] = 'application/json;charset=utf-8';
        req.data = JSON.stringify(req.data);
    }

    //  set requester info
    req.headers['X-Request-By'] = 'RestClient';

    //  set csrftoken
    req.headers.csrftoken = new Date().getTime();

    //  to handle next plugin
    next();
};
