/**
 * Utils
 *
 * @file src/utils.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import { TSObject, MethodPlugin } from 'ajax';
import {
    ParseHeaders,
    Extend,
    IsObject,
    IsUndefined,
    GetQuery,
    GetUTCTime,
    GenerateRequestId,
    PromiseRace,
    GetPlugins
} from 'utils';

// parseHeaders https://github.com/axios/helper/parseHeaders.js
export const parseHeaders: ParseHeaders = (headers: string) => {
    const parsed: TSObject = {};
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
            const val = line.substr(i + 1).trim();

            if (key) {
                if (parsed[key] && ignoreDuplicateOf.indexOf(key) > -1) {
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

export const extend: Extend = (...args: Array<Record<string, any>>) => {
    const obj = {};
    for (let i = 0; i < args.length; i++) {
        const source = args[i];
        for (const prop in source) {
            if ({}.hasOwnProperty.call(source, prop)) {
                (obj as any)[prop] = (source as any)[prop];
            }
        }
    }
    return obj;
};

export const isObject: IsObject = (obj: any) => obj === Object(obj);

export const isUndefined: IsUndefined = (obj: any) => obj === void 0;

export const getQuery: GetQuery = (obj: TSObject) => {
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

export const generateRequestId: GenerateRequestId = () => {
    const chunk = (): string => {
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

export const getUTCTime: GetUTCTime = (date: Date) => date.toISOString().replace(/\.\d+Z$/, 'Z');

export const promiseRace: PromiseRace = async (promise: Function, n: number) => {
    for (let i = 0; i < n; i++) {
        try {
            return await promise();
        } catch (error) {
            if (i === n - 1) {
                return Promise.reject(error);
            }
        }
    }
};

export const getPlugins: GetPlugins = (base: Array<Function>, extra: Array<MethodPlugin>) => {
    const plugins = [...base];
    extra.forEach(item => plugins.splice(item.sequence || plugins.length, 0, ...item.plugins));
    return plugins;
};
