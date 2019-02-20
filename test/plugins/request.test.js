import request from '../../src/plugins/request';
import Plugin from '../../src/plugin';

describe('Testing request plugin', () => {

    test('Request plugin returns a function', () => {
        expect(request() instanceof Function).toBe(true);
    });

    test('Request plugin recevies param from Plugin pool', () => {
        const plugin = new Plugin();
        plugin.use(request())
        .use(req => expect(req.data).toEqual({}))
        .handle({data: {}});
    });

});