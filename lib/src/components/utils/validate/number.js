"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNaN = exports.isNumeric = void 0;
function isNumeric(val) {
    // return /^\d+(\.\d+)?$/.test(val);
    return /^[-]?\d+(\.\d+)?$/.test(val); // 包含复数
}
exports.isNumeric = isNumeric;
function isNaN(val) {
    if (Number.isNaN) {
        return Number.isNaN(val);
    }
    // eslint-disable-next-line no-self-compare
    return val !== val;
}
exports.isNaN = isNaN;
//# sourceMappingURL=number.js.map