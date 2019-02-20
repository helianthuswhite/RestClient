import Plugin from '../src/plugin';

describe('Testing Plugin Class', () => {

    let plugin;

    beforeEach(() => (plugin = new Plugin));

    test('plugin.use recevie a function as param', () => {
        expect(plugin.use).toThrowError()
    });

    test('plugin.abort can remove a plugin by index', () => {
        expect(plugin.use(() => {}).use(() => {}).abort(1).stack.length).toBe(1);
    });

    test('errors will be passed to next plugin', () => {
        plugin.use(() => {
            throw Error('error');
        }).use((e, d, next) => {
            expect(e instanceof Error).toBe(true);
            expect(d).toBe('d');
            next();
        }).handle('d');
    });

    test('params will be passed to next plugin', () => {
        plugin.use((d) => {
            expect(d).toBe('d');
        }).handle('d');
    });

});