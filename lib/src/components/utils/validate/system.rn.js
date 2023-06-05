"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIOS = exports.isAndroid = void 0;
const react_native_1 = require("react-native");
function isAndroid() {
    return react_native_1.Platform.OS == "android";
}
exports.isAndroid = isAndroid;
function isIOS() {
    return react_native_1.Platform.OS == "ios";
}
exports.isIOS = isIOS;
//# sourceMappingURL=system.rn.js.map