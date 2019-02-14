import Ajax from '../src/ajax';

describe('Testing Ajax Class', () => {

    const ajax = new Ajax({});

    test('Ajax instance should have config property and tow Plugins', () => {
        expect(ajax.hasOwnProperty('config')).toBe(true);
        expect(typeof ajax.req).toBe('object');
        expect(typeof ajax.res).toBe('object');
    });

    test('new Ajax().request should return a promise', () => {
        expect(ajax.request()  instanceof Promise).toBe(true);
    });

});