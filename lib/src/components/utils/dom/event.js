"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventDefault = exports.stopPropagation = void 0;
function stopPropagation(event) {
    event.stopPropagation();
}
exports.stopPropagation = stopPropagation;
function preventDefault(event, isStopPropagation) {
    /* istanbul ignore else */
    if (typeof event.cancelable !== "boolean" || event.cancelable) {
        event.preventDefault();
    }
    if (isStopPropagation) {
        stopPropagation(event);
    }
}
exports.preventDefault = preventDefault;
//# sourceMappingURL=event.js.map