/**
 * Abstract class
 *
 * @file src/client.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import Ajax from './ajax';
import requestPlugin from './plugins/request';
import responsePlugin from './plugins/response';
import * as utils from './utils';

export default class Client extends Ajax {
    constructor(config) {
        super(config);

        this.req.use(requestPlugin());
        this.res.use(responsePlugin());
    }

    get(url, data, config = {}) {
        const options = utils.extend({
            url: url + utils.getQuery(data),
            method: 'get'
        }, config);

        return this.request(options);
    }

    delete(url, data, config = {}) {
        const options = utils.extend({
            url: url + utils.getQuery(data),
            method: 'delete'
        }, config);

        return this.request(options);
    }

    post(url, data, config = {}) {
        const options = utils.extend({
            url,
            data,
            method: 'post'
        }, config);

        return this.request(options);
    }

    put(url, data, config = {}) {
        const options = utils.extend({
            url,
            data,
            method: 'put'
        }, config);

        return this.request(options);
    }
}
