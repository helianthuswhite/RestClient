/**
 * Provide the retry decorator
 *
 * @file src/decorators/retry.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import use from './use';
import timeoutDecorator from './timeout';
import plugins from '../plugins';

const {retry} = plugins;

/* eslint-disable arrow-body-style */
export default (times = 2, timeout?: number, condition?: Function): Function => {
    return (target: any, key?: string, descriptor?: PropertyDescriptor): void => {
        timeoutDecorator(timeout)(target, key, descriptor);
        use('response', retry(condition, times), 1)(target, key, descriptor);
    };
};
