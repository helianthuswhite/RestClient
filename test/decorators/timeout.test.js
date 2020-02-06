import {Client, decorators} from '../../src/main';
const {timeout} = decorators;

class Test extends Client {
    @timeout(1000)
    test() {}
}

describe('Testing timeout decorator', () => {
    const client = new Test();

    test('Request plugin returns a function', () => {
        client.requestPlugins.push((req, next) => {
            expect(req.timeout).toBe(1000);
            next();
        });
        client.get('/test');
    });

});
