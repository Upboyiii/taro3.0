"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doubleRaf = exports.cancelRaf = exports.raf = void 0;
/* eslint-disable @typescript-eslint/unbound-method */
const _1 = require(".");
const root = (_1.inBrowser ? window : global);
let prev = Date.now();
function rafPolyfill(fn) {
    const curr = Date.now();
    const ms = Math.max(0, 16 - (curr - prev));
    const id = setTimeout(fn, ms);
    prev = curr + ms;
    return id;
}
function raf(fn) {
    const requestAnimationFrame = root.requestAnimationFrame || rafPolyfill;
    return requestAnimationFrame.call(root, fn);
}
exports.raf = raf;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function cancelRaf(id) {
    const cancelAnimationFrame = root.cancelAnimationFrame || root.clearTimeout;
    cancelAnimationFrame.call(root, id);
}
exports.cancelRaf = cancelRaf;
// double raf for animation
function doubleRaf(fn) {
    raf(() => {
        raf(fn);
    });
}
exports.doubleRaf = doubleRaf;
//# sourceMappingURL=raf.js.map