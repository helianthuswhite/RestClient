/**
 * types
 *
 * @file types/ajax.d.ts
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import {TSObject, MethodPlugin} from './ajax';

export type ParseHeaders = (headers: string) => TSObject;

export type Extend = (...args: Array<Object>) => TSObject;

export type IsObject = (obj: any) => boolean;

export type IsUndefined = (obj: any) => boolean;

export type GetQuery = (obj: TSObject) => string;

export type GenerateRequestId = () => string;

export type GetUTCTime = (date: Date) => string;

export type PromiseRace = (promise: Function, n: number) => Promise<any>;

export type GetPlugins = (base: Array<Function>, extra: Array<MethodPlugin>) => Array<Function>;
