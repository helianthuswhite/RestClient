/**
 * a response plugin
 *
 * @file src/plugins/response.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

export default () => (res, next) => {
    if (typeof res.data === 'string') {
        try {
            res.data = JSON.parse(res.data);
        } catch (e) { /* Ignore */ }
    }

    next();
};
