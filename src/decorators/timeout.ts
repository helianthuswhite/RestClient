/**
 * Provide the timeout decorator
 *
 * @file src/decorators/retry.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import { Options } from 'ajax';
import use from './use';

/* eslint-disable arrow-body-style */
export default (timeout: number = 15 * 1000): Function => {
    return (target: any, key?: string, descriptor?: PropertyDescriptor): void => {
        use('request', (req: Options, next: Function): void => {
            req.timeout = timeout;
            next();
        })(target, key, descriptor);
    };
};
