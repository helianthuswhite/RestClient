import response from '../../src/plugins/response';
import Plugin from '../../src/plugin';

describe('Testing response plugin', () => {

    test('Response plugin returns a function', () => {
        expect(response() instanceof Function).toBe(true);
    });

    test('Response plugin recevies param from Plugin pool', () => {
        const plugin = new Plugin();
        plugin.use(response())
        .use(res => expect(res.data).toEqual({}))
        .handle({data: '{}'});

        plugin.handle({data: {}});
    });

});