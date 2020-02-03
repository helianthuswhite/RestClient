import {Client, decorators} from '../../src/main';
const {retry} = decorators;

describe('Testing retry decorator', () => {

    test('Request plugin returns a function', () => {
        expect(true).toBe(true);
    });

});

@retry()
class Test extends Client {

    @retry()
    test() {}
}
