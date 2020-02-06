import retry from '../../src/plugins/retry';
import Plugin from '../../src/plugin';

describe('Testing retry plugin', () => {

    test('Retry plugin returns a function', () => {
        expect(retry() instanceof Function).toBe(true);
    });

    test('Rety plugin recevies param from Plugin pool', () => {
        const plugin = new Plugin();
        plugin.use(retry())
        .use(req => expect(req.data).toEqual({}))
        .handle({data: {}});

        plugin.use(() => retry(res => res.status === 200, 1000)({
            status: 200,
            config: {
                validateStatus: status => status === 200
            }
        }))
        .use(req => expect(req.data).toEqual({}))
        .handle({data: {}});
    });

});
