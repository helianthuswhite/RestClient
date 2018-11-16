/**
 * Utils
 *
 * @file src/utils.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

// parseHeaders https://github.com/axios/helper/parseHeaders.js
export const parseHeaders = (headers) => {
    const parsed = {};
    const ignoreDuplicateOf = [
        'age', 'authorization', 'content-length', 'content-type', 'etag',
        'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
        'last-modified', 'location', 'max-forwards', 'proxy-authorization',
        'referer', 'retry-after', 'user-agent'
    ];

    if (headers) {
        headers.split('\n').forEach((line) => {
            const i = line.indexOf(':');
            const key = line.substr(0, i).trim().toLowerCase();
            const val = line.substr(i + 1);

            if (key) {
                if (parsed[key] && ignoreDuplicateOf.indexOf(key)) {
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

export const extend = (...args) => {
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

export const isObject = obj => obj === Object(obj);

export const isUndefined = obj => obj === void 0;

export const getQuery = (obj) => {
    let query = '';

    if (!isObject(obj) || !Object.keys(obj).length) {
        return query;
    }

    Object.keys(obj).forEach((key) => {
        const str = `&${key}=${obj[key]}`;
        query += str;
    });

    return query.replace('&', '?');
};

export const generateRequestId = () => {
    const chunk = () => {
        let v = (~~(Math.random() * 0xffff)).toString(16);
        if (v.length < 4) {
            v += new Array(4 - v.length + 1).join('0');
        }
        return v;
    };

    const a = chunk();
    const b = chunk();
    const c = chunk();
    const d = chunk();
    const e = chunk();
    const f = chunk();
    const g = chunk();
    const h = chunk();

    return `${a + b}-${c}-${d}-${e}-${f}${g}${h}`;
};

export const getUTCTime = date => date.toISOString().replace(/\.\d+Z$/, 'Z');
