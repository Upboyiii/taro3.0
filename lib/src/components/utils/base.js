"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = exports.isPromise = exports.isFunction = exports.isDef = exports.inBrowser = exports.extend = exports.noop = void 0;
function noop() { }
exports.noop = noop;
exports.extend = Object.assign;
exports.inBrowser = typeof window !== "undefined";
function isDef(val) {
    return val !== undefined && val !== null;
}
exports.isDef = isDef;
function isFunction(val) {
    return typeof val === "function";
}
exports.isFunction = isFunction;
function isPromise(val) {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
}
exports.isPromise = isPromise;
function isObject(val) {
    return val !== null && typeof val === "object";
}
exports.isObject = isObject;
//# sourceMappingURL=base.js.map