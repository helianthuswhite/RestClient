/**
 * Provide the use decorator to use a plugin
 *
 * @file src/decorators/use.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import { PluginType } from 'decorator';
import { Options } from 'ajax';

/* eslint-disable arrow-body-style */
export default (type: PluginType, plugin: Function | Array<Function>, sequence?: number): any => {
    return (target: any, key?: string, descriptor?: PropertyDescriptor): any => {
        if (['req', 'request', 'res', 'response'].indexOf(type) === -1) {
            throw new Error('Plugin type is valid!');
        }

        const pluginType = type === 'req' || type === 'request' ? 'requestPlugins' : 'responsePlugins';
        const targetPlugins = typeof plugin === 'function' ? [plugin] : [...plugin];

        if (typeof target === 'function') {
            return class extends target {
                constructor(config?: Options) {
                    super(config);

                    this[pluginType].splice(sequence || this[pluginType].length, 0, ...targetPlugins);
                }
            };
        }

        if (target[`__${key}__${pluginType}`]) {
            target[`__${key}__${pluginType}`].push({plugins: targetPlugins, sequence});
        } else {
            Object.defineProperty(target, `__${key}__${pluginType}`, {
                value: [{plugins: targetPlugins, sequence}]
            });
        }

        const fn = descriptor.value;
        Object.defineProperty(descriptor, 'value', {
            value(...args: Array<Function>[]): Function {
                return target.__decoratorMiddleware.apply(this, [fn, `__${key}__`, ...args]);
            }
        });

        return undefined;
    };
};
