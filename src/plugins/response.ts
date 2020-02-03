/**
 * a response plugin
 *
 * @file src/plugins/response.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import { Options } from 'ajax';

export default (): Function => (res: Options, next: Function): void => {
    if (typeof res.data === 'string') {
        try {
            res.data = JSON.parse(res.data);
        } catch (e) { /* Ignore */ }
    }

    next();
};
