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

        this.initMethods();

        this.req.use(requestPlugin());
        this.res.use(responsePlugin());
    }

    initMethods() {
        ['post', 'put'].forEach((item) => {
            this[item] = (url, data, config = {}) => {
                const options = utils.extend({
                    url,
                    data,
                    method: item
                }, config);

                return this.request(options);
            };
        });

        ['get', 'delete'].forEach((item) => {
            this[item] = (url, data, config = {}) => {
                const options = utils.extend({
                    url: url + utils.getQuery(data),
                    method: item
                }, config);

                return this.request(options);
            };
        });
    }
}
