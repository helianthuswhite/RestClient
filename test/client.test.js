import Client from '../src/client';
import use from '../src/decorators/use';

class Test extends Client {
    @use('request', (req, next) => {next()})
    testGet(...args) {
        return this.get(...args);
    }
}

describe('Testing Client Class', () => {

    const client = new Test();

    test('Client instance have six restful methods', () => {
        expect(client.get('/test', {test: 1}) instanceof Promise).toBe(true);
        expect(client.put('/test', {test: 1}) instanceof Promise).toBe(true);
        expect(client.options('/test', {test: 1}) instanceof Promise).toBe(true);
        expect(client.post('/test', {test: 1}) instanceof Promise).toBe(true);
        expect(client.delete('/test', {test: 1}) instanceof Promise).toBe(true);
        expect(client.head('/test', {test: 1}) instanceof Promise).toBe(true);
        expect(client.patch('/test', {test: 1}) instanceof Promise).toBe(true);
    });

    test('Use a decorator on the method', () => {
        expect(client.testGet('/test', {test: 1}) instanceof Promise).toBe(true);
    });
});
