"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kebabCase = exports.unitToPx = exports.getZIndexStyle = exports.getSizeStyle = exports.addUnit = void 0;
const __1 = require("..");
const number_1 = require("../validate/number");
function addUnit(value) {
    if (!(0, __1.isDef)(value)) {
        return undefined;
    }
    value = String(value);
    if (process.env.TARO_ENV === "h5") {
        return (0, number_1.isNumeric)(value) ? `${+value / 20}rem` : value;
    }
    else if (process.env.TARO_ENV === "weapp") {
        return (0, number_1.isNumeric)(value) ? `${+value * 2}rpx` : value;
    }
    else if (process.env.TARO_ENV === "rn") {
        // @ts-ignore
        return +value;
    }
    else {
        return (0, number_1.isNumeric)(value) ? `${value}px` : value;
    }
}
exports.addUnit = addUnit;
function getSizeStyle(originSize) {
    if ((0, __1.isDef)(originSize)) {
        const size = addUnit(originSize);
        return {
            width: size,
            height: size
        };
    }
    return {};
}
exports.getSizeStyle = getSizeStyle;
function getZIndexStyle(zIndex) {
    const style = {};
    if (zIndex !== undefined) {
        style.zIndex = +zIndex;
    }
    return style;
}
exports.getZIndexStyle = getZIndexStyle;
// cache
let rootFontSize;
function getRootFontSize() {
    if (!rootFontSize) {
        const doc = document.documentElement;
        const fontSize = doc.style.fontSize || window.getComputedStyle(doc).fontSize;
        rootFontSize = parseFloat(fontSize);
    }
    return rootFontSize;
}
function convertRem(value) {
    value = value.replace(/rem/g, "");
    return +value * getRootFontSize();
}
function convertVw(value) {
    value = value.replace(/vw/g, "");
    return (+value * window.innerWidth) / 100;
}
function convertVh(value) {
    value = value.replace(/vh/g, "");
    return (+value * window.innerHeight) / 100;
}
function unitToPx(value) {
    if (typeof value === "number") {
        return value;
    }
    if (__1.inBrowser) {
        if (value.indexOf("rem") !== -1) {
            return convertRem(value);
        }
        if (value.indexOf("vw") !== -1) {
            return convertVw(value);
        }
        if (value.indexOf("vh") !== -1) {
            return convertVh(value);
        }
    }
    return parseFloat(value);
}
exports.unitToPx = unitToPx;
function kebabCase(str) {
    return str
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "");
}
exports.kebabCase = kebabCase;
//# sourceMappingURL=unit.js.map