"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIOS = exports.isAndroid = void 0;
const base_1 = require("../base");
function isAndroid() {
    return base_1.inBrowser ? /android/.test(window.navigator.userAgent.toLowerCase()) : false;
}
exports.isAndroid = isAndroid;
function isIOS() {
    return base_1.inBrowser ? /ios|iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) : false;
}
exports.isIOS = isIOS;
//# sourceMappingURL=system.js.map