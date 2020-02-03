/**
 * Abstract class
 *
 * @file src/client.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import { Options, TSObject } from 'ajax';
import { Client } from 'client';
import Ajax from './ajax';
import plugins from './plugins';
import decorators from './decorators';
import * as utils from './utils';

const {request: requestPlugin, response: responsePlugin} = plugins;
const {use} = decorators;

@use('request', requestPlugin())
@use('response', responsePlugin())
export default class RestClient extends Ajax implements Client {
    __bulkRequest(url: string, method: string, config = {}, querys?: TSObject, data?: TSObject): Promise<any> {
        const options = utils.extend({
            url,
            method
        }, config);

        if (querys) {
            options.url += utils.getQuery(querys);
        }

        if (data) {
            options.data = data;
        }

        return this.request(options as Options);
    }

    head(url: string, config = {}): Promise<any> {
        return this.__bulkRequest(url, 'head', config);
    }

    options(url: string, config = {}): Promise<any> {
        return this.__bulkRequest(url, 'options', config);
    }

    patch(url: string, data?: TSObject, config = {}): Promise<any> {
        return this.__bulkRequest(url, 'patch', config, undefined, data);
    }

    get(url: string, querys?: TSObject, config = {}): Promise<any> {
        return this.__bulkRequest(url, 'get', config, querys);
    }

    delete(url: string, querys?: TSObject, config = {}): Promise<any> {
        return this.__bulkRequest(url, 'delete', config, querys);
    }

    post(url: string, data?: TSObject, config = {}): Promise<any> {
        return this.__bulkRequest(url, 'post', config, undefined, data);
    }

    put(url: string, data?: TSObject, config = {}): Promise<any> {
        return this.__bulkRequest(url, 'put', config, undefined, data);
    }

    __decoratorMiddleware(fn: Function, key: string, ...args: Array<any>[]): Promise<any> {
        this.__current = key;
        return fn.apply(this, args);
    }
}
