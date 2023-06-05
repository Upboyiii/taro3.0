"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padZero = exports.camelize = void 0;
const camelizeRE = /-(\w)/g;
function camelize(str) {
    return str.replace(camelizeRE, (_, c) => c.toUpperCase());
}
exports.camelize = camelize;
function padZero(num, targetLength = 2) {
    let str = `${num}`;
    while (str.length < targetLength) {
        str = `0${str}`;
    }
    return str;
}
exports.padZero = padZero;
//# sourceMappingURL=string.js.map