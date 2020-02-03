/**
 * Plugin Object to deal with plugins.
 *
 * @file src/plugin.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import Plugin from 'plugin';

export default class implements Plugin {
    index = 0;

    source: any = null;

    stack: Function[] = [];

    constructor(plugins: Array<Function> = []) {
        this.stack = plugins;
    }

    /**
     * push handler to stack
     * @param fn function to handle source
     */
    use(fn: Function): this {
        if (typeof fn !== 'function') {
            throw new Error('The plugin should be a function.');
        }

        this.stack.push(fn);

        return this;
    }

    /**
     * remove the index plugin
     * @param index the sequense of a plugin
     */
    abort(index?: number): this {
        if (index) {
            this.stack.splice(index, 1);
        } else {
            this.stack.pop();
        }

        return this;
    }

    /**
     * start execute plugins
     * @param source resource to be handled
     */
    handle(source: any): void {
        this.index = 0;
        this.source = source;

        const next = (err?: Error): void => {
            const fn = this.stack[this.index++];

            if (!fn) {
                return;
            }

            this.__call(fn, next, err);
        };

        next();
    }


    /**
     * execute every plugin funciton
     * @param fn the plugin funciton
     * @param err error
     * @param next next plugin function
     */
    __call(fn: Function, next: Function, err?: Error): void {
        //  catch error to next
        try {
            if (err && fn.length === 3) {
                fn(err, this.source, next);
                return;
            }
            if (!err && fn.length < 3) {
                fn(this.source, next);
                return;
            }
        } catch (e) {
            err = e;    //  eslint-disable-line
        }

        next(err);
    }
}
