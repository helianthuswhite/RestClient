/**
 * Main entry
 *
 * @file src/index.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */
import { Options } from '../ajax';
declare const _default: {
    request: () => (req: Options, next: Function) => void;
    retry: () => (res: Options, next: Function) => void;
    timeout: (condition: Function, times: number) => (res: Response, next: Function) => Promise<void>;
};
export default _default;