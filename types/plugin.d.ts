/**
 * Plugin Object to deal with plugins.
 *
 * @file src/plugin.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */
export default class Plugin {
    index: number;
    source: any;
    stack: Function[];
    constructor(plugins?: Array<Function>);
    /**
     * push handler to stack
     * @param fn function to handle source
     */
    use(fn: Function): this;
    /**
     * remove the index plugin
     * @param index the sequense of a plugin
     */
    abort(index?: number): this;
    /**
     * start execute plugins
     * @param source resource to be handled
     */
    handle(source: any): void;
    /**
     * execute every plugin funciton
     * @param fn the plugin funciton
     * @param err error
     * @param next next plugin function
     */
    __call(fn: Function, next: Function, err?: Error): void;
}