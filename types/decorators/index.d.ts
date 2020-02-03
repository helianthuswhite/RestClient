/**
 * Main entry
 *
 * @file src/index.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */
declare const _default: {
    use: (type: import("../decorator").PluginType, plugin: Function | Function[], sequence?: number) => any;
    retry: (condition?: Function, times?: number, timeout?: number) => (target: any, key?: string, descriptor?: PropertyDescriptor) => void;
    timeout: (timeout?: number) => (target: any, key?: string, descriptor?: PropertyDescriptor) => void;
};
export default _default;