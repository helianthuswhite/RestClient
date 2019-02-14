import * as utils from '../src/utils';

describe('Testing utils', () => {

    test('parseHeaders can parse responseHeaders to object', () => {
        const headerString = `
            Content-Type: application/json
            Cache-Control: true
            Set-Cookie: cetest
            Set-Cookie: cetest2
            Age: 100
            X-Request-By: RestClient
            Age: 10
        `;
        const headers = {
            'content-type': 'application/json',
            'cache-control': 'true',
            'x-request-by': 'RestClient',
            'set-cookie': ['cetest', 'cetest2'],
            'age': '100'
        };
        const parsed = utils.parseHeaders(headerString);
        expect(parsed).toEqual(headers);

        const parsedEmpty = utils.parseHeaders();
        expect(parsedEmpty).toEqual({});
    });

    test('extend objects and return a new object ', () => {
        const a = {a: 1};
        const b = {b: 2};
        const dest = {a: 1, b: 2};
        expect(utils.extend(a, b)).toEqual(dest);
    });

    test('isObject method return if param is an object ', () => {
        expect(utils.isObject({})).toBe(true);
        expect(utils.isObject([1, 2])).toBe(true);
        expect(utils.isObject(() => {})).toBe(true);
        expect(utils.isObject(1)).toBe(false);
        expect(utils.isObject('a')).toBe(false);
    });

    test('isUndefined method return if param is undefined', () => {
        expect(utils.isUndefined(undefined)).toBe(true);
        expect(utils.isUndefined(null)).toBe(false);
        expect(utils.isUndefined(NaN)).toBe(false);
        expect(utils.isUndefined('')).toBe(false);
        expect(utils.isUndefined(0)).toBe(false);
    });

    test('getQuery can convert an object to url query string ', () => {
        const obj = {
            a: 1,
            b: 'test'
        };
        const query = '?a=1&b=test';
        expect(utils.getQuery(obj)).toBe(query);
        expect(utils.getQuery()).toBe('');
    });

    test('generateRequestId is to generate a random uuid of the request ', () => {
        //  requestId like xxx-xxx-xxx and idL is the length of every xxx
        const idL = [8, 4, 4, 4, 12];
        const requestId = utils.generateRequestId().split('-');
        for (let i = 0; i < requestId.length; i++) {
            expect(requestId[i].length).toBe(idL[i]);
        }
    });

    test('getUTCTime method convert param time to UTCTime ', () => {
        expect(utils.getUTCTime(new Date())).toMatch(/T|Z/g);
        expect(() => utils.getUTCTime(1)).toThrow();
    });
    
});