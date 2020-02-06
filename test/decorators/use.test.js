import {Client, decorators} from '../../src/main';
const {use} = decorators;

@use('request', (req, next) => {next()})
class Test extends Client {
    test() {}
}

describe('Testing timeout decorator', () => {
    const client = new Test();

    test('Request plugin returns a function', () => {
        expect(client.requestPlugins.length).toBe(2);
    });

});
