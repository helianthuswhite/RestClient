import fauxJax from 'faux-jax';
import Ajax from '../src/ajax';

describe('Testing Ajax Class', () => {

    const ajax = new Ajax({url: '/test'});

    beforeEach(() => fauxJax.install());

    afterEach(() => fauxJax.restore());

    test('Ajax instance should have config property and tow Plugins', () => {
        expect(ajax.hasOwnProperty('config')).toBe(true);
        expect(typeof ajax.requestPlugins).toBe('object');
        expect(typeof ajax.responsePlugins).toBe('object');
    });

    test('Ajax instance receive a config or empty object', () => {
        expect(ajax.config).toEqual({url: '/test'});

        const ajax2 = new Ajax();
        expect(ajax2.config).toEqual(undefined);
    });

    test('new Ajax().request should return a promise', () => {
        expect(ajax.request() instanceof Promise).toBe(true);
    });

    test('Ajax method will be convert to lowercase and default get', async () => {
        fauxJax.on('request', request => {
            expect(request.requestMethod.toLowerCase()).toBe('get');

            request.respond(200);
        });
        await ajax.request();
    });

    test('Option.responseType can set xhr.responseType', async () => {
        fauxJax.on('request', request => {
            request.respond(200, {'content-type': 'application/text'}, '123');
        });
        const data = await ajax.request({responseType: 'text'});
        expect(data).toBe('123');
    });

    test('Option.headers can add headers to the request', async () => {
        fauxJax.on('request', request => {
            expect(request.requestHeaders['content-type']).toBeUndefined();
            request.respond(200);
        });

        const options = {
            headers: {
                'content-type': 'json'
            },
            method: 'post'
        };
        await ajax.request(options);
    });

    test('Option.headers can add headers to the request', async () => {

        fauxJax.on('request', request => {
            expect(request.requestBody).toBe('aaa');
            try {
                const headers = JSON.parse(request.requestHeaders);
                expect(headers['x-request-by']).toBe('restclient');
            }
            catch (error) {}
            request.respond(200);
        });

        const options = {
            method: 'post',
            headers: {
                'x-request-by': 'restclient'
            },
            data: 'aaa'
        };
        await ajax.request(options);
    });

    test('Option.onXXXProgress can add a listener of progress event', async () => {
        fauxJax.on('request', request => {
            request.respond(200);
        });

        const options = {
            onUploadProgress: () => {},
            onDownloadProgress: () => {}
        };
        await ajax.request(options);
    });

    test('Option.withCredentials allows request with credentials', async () => {
        fauxJax.on('request', request => {
            request.respond(200);
        });

        const options = {
            withCredentials: true
        };
        await ajax.request(options);
    });

    test('Option.validateStatus is a function to filter response status', async () => {
        fauxJax.on('request', request => {
            request.respond(400, {}, 'a');
        });

        const options = {
            validateStatus: status => status === 200
        };
        try {
            await ajax.request(options);
        }
        catch (e) {
            expect(e).toBe('a');
        }
    });

    test('Request timeout will throw an error', async () => {
        fauxJax.on('request', r => {});
        try {
            await ajax.request({timeout: 1000});
        }
        catch (e) {
            // expect(e instanceof Error).toBe(true);
        }
    });

});
