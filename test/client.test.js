import Client from '../src/client';

describe('Testing Client Class', () => {

    const client = new Client();

    test('Client instance have four restful methods', () => {
        expect(client.get() instanceof Promise).toBe(true);
        expect(client.put() instanceof Promise).toBe(true);
        expect(client.post() instanceof Promise).toBe(true);
        expect(client.delete() instanceof Promise).toBe(true);
    });

});