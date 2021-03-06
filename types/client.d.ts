/**
 * Abstract class
 *
 * @file src/client.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */
import { TSObject, Ajax } from './ajax';
export class Client extends Ajax {
    __bulkRequest(url: string, method: string, config?: {}, querys?: TSObject, data?: TSObject): Promise<unknown>;
    head(url: string, config?: {}): Promise<unknown>;
    options(url: string, config?: {}): Promise<unknown>;
    patch(url: string, data?: TSObject, config?: {}): Promise<unknown>;
    get(url: string, querys?: TSObject, config?: {}): Promise<unknown>;
    delete(url: string, querys?: TSObject, config?: {}): Promise<unknown>;
    post(url: string, data?: TSObject, config?: {}): Promise<unknown>;
    put(url: string, data?: TSObject, config?: {}): Promise<unknown>;
    __decoratorMiddleware(fn: Function, key: string, ...args: Array<any>[]): any;
}