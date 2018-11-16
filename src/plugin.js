/**
 * Plugin Object to deal with plugins.
 *
 * @file src/plugin.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

export default class Plugin {
    constructor() {
        this.stack = [];
        this.index = 0;
        this.options = null;
    }

    //  use a plugin
    use(fn) {
        if (typeof fn !== 'function') {
            throw new Error('The plugin should be a function.');
        }

        this.stack.push(fn);

        return this;
    }

    //  remove a plugin by index
    abort(index) {
        if (index) {
            this.stack.splice(index, 1);
        } else {
            this.stack.pop();
        }

        return this;
    }

    //  hanlde plugins in order
    handle(options) {
        this.index = 0;
        this.options = options;

        const next = (err) => {
            const fn = this.stack[this.index++];

            if (!fn) {
                return;
            }

            this.__call(fn, err, next);
        };

        next();
    }

    __call(fn, err, next) {
        //  catch error to next
        try {
            if (err && fn.length === 3) {
                fn(err, this.options, next);
                return;
            }
            if (!err && fn.length < 3) {
                fn(this.options, next);
                return;
            }
        } catch (e) {
            /*  eslint-disable */
            err = e;
            /*  eslint-enable */
        }

        next(err);
    }
}
