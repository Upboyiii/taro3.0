"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNumber = exports.formatNumber = exports.range = void 0;
/* eslint-disable prefer-destructuring */
function range(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
exports.range = range;
function trimExtraChar(value, char, regExp) {
    const index = value.indexOf(char);
    if (index === -1) {
        return value;
    }
    if (char === "-" && index !== 0) {
        return value.slice(0, index);
    }
    return value.slice(0, index + 1) + value.slice(index).replace(regExp, "");
}
function formatNumber(value, allowDot = true, allowMinus = true) {
    if (allowDot) {
        value = trimExtraChar(value, ".", /\./g);
    }
    else {
        // eslint-disable-next-line prefer-destructuring
        value = value.split(".")[0];
        // value = value.replace(/\./g, "");
    }
    if (allowMinus) {
        value = trimExtraChar(value, "-", /-/g);
    }
    else {
        value = value.replace(/-/, "");
    }
    const regExp = allowDot ? /[^-0-9.]/g : /[^-0-9]/g;
    return value.replace(regExp, "");
}
exports.formatNumber = formatNumber;
// add num and avoid float number
function addNumber(num1, num2) {
    const cardinal = 10 ** 10;
    return Math.round((num1 + num2) * cardinal) / cardinal;
}
exports.addNumber = addNumber;
//# sourceMappingURL=number.js.map