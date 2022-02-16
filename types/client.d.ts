/**
 * Abstract class
 *
 * @file src/client.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */
import { TSObject, Ajax, Options } from './ajax';
export class Client extends Ajax {
    __bulkRequest(url: string, method: string, config?: Options | TSObject, querys?: TSObject, data?: TSObject): Promise<unknown>;
    head(url: string, config?: Options | TSObject): Promise<unknown>;
    options(url: string, config?: Options | TSObject): Promise<unknown>;
    patch(url: string, data?: TSObject, config?: Options | TSObject): Promise<unknown>;
    get(url: string, querys?: TSObject, config?: Options | TSObject): Promise<unknown>;
    delete(url: string, querys?: TSObject, config?: Options | TSObject): Promise<unknown>;
    post(url: string, data?: TSObject, config?: Options | TSObject): Promise<unknown>;
    put(url: string, data?: TSObject, config?: Options | TSObject): Promise<unknown>;
    __decoratorMiddleware(fn: Function, key: string, ...args: Array<any>[]): any;
}
