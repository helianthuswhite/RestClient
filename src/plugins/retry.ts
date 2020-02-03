/**
 * a response plugin
 *
 * @file src/plugins/response.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import { Response, Options } from 'ajax';
import Ajax from '../ajax';
import response from './response';
import {promiseRace} from '../utils';

/* eslint-disable arrow-body-style */
export default (condition: Function, times: number): Function => {
    return async (res: Response, next: Function): Promise<any> => {
        const {config, status} = res;
        const ajax = new Ajax();
        ajax.responsePlugins.push(response());
        const executable = condition ? condition(res) : !config.validateStatus(status);

        if (executable) {
            try {
                res.data = await promiseRace(ajax.request.bind(ajax, config as Options), times);
                res.status = 200;
            } catch (e) {
                res.data = e;
            }
        }

        next();
    };
};
