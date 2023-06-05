"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetScroll = exports.scrollTopTo = exports.scrollLeftTo = exports.setScrollTop = exports.getVisibleTop = exports.getVisibleHeight = exports.getElementTop = exports.setRootScrollTop = exports.getRootScrollTop = exports.getScrollTop = void 0;
/* eslint-disable no-plusplus */
const raf_1 = require("../raf");
const system_1 = require("../validate/system");
function isWindow(val) {
    return val === window;
}
function getScrollTop(el) {
    const top = "scrollTop" in el ? el.scrollTop : el.pageYOffset;
    // iOS scroll bounce cause minus scrollTop
    return Math.max(top, 0);
}
exports.getScrollTop = getScrollTop;
function getRootScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
exports.getRootScrollTop = getRootScrollTop;
function setRootScrollTop(value) {
    setScrollTop(window, value);
    // setScrollTop(document.body, value);
}
exports.setRootScrollTop = setRootScrollTop;
// get distance from element top to page top or scroller top
function getElementTop(el, scroller) {
    if (isWindow(el)) {
        return 0;
    }
    const scrollTop = scroller ? getScrollTop(scroller) : getRootScrollTop();
    return el.getBoundingClientRect().top + scrollTop;
}
exports.getElementTop = getElementTop;
function getVisibleHeight(el) {
    if (isWindow(el)) {
        return el.innerHeight;
    }
    return el.getBoundingClientRect().height;
}
exports.getVisibleHeight = getVisibleHeight;
function getVisibleTop(el) {
    if (isWindow(el)) {
        return 0;
    }
    return el.getBoundingClientRect().top;
}
exports.getVisibleTop = getVisibleTop;
function setScrollTop(el, value) {
    if ("scrollTop" in el) {
        el.scrollTop = value;
    }
    else {
        el.scrollTo(el.scrollX, value);
    }
}
exports.setScrollTop = setScrollTop;
let rafId;
function scrollLeftTo(scroller, to, duration) {
    (0, raf_1.cancelRaf)(rafId);
    let count = 0;
    const from = scroller.scrollLeft;
    const frames = duration === 0 ? 1 : Math.round(duration / 16);
    function animate() {
        scroller.scrollLeft += (to - from) / frames;
        if (++count < frames) {
            rafId = (0, raf_1.raf)(animate);
        }
    }
    animate();
}
exports.scrollLeftTo = scrollLeftTo;
function scrollTopTo(scroller, to, duration, callback) {
    let current = getScrollTop(scroller);
    const isDown = current < to;
    const frames = duration === 0 ? 1 : Math.round(duration / 16);
    const step = (to - current) / frames;
    function animate() {
        current += step;
        if ((isDown && current > to) || (!isDown && current < to)) {
            current = to;
        }
        setScrollTop(scroller, current);
        if ((isDown && current < to) || (!isDown && current > to)) {
            (0, raf_1.raf)(animate);
        }
        else if (callback) {
            (0, raf_1.raf)(callback);
        }
    }
    animate();
}
exports.scrollTopTo = scrollTopTo;
const isIOS = (0, system_1.isIOS)();
// hack for iOS12 page scroll
// see: https://developers.weixin.qq.com/community/develop/doc/00044ae90742f8c82fb78fcae56800
function resetScroll() {
    if (isIOS) {
        setRootScrollTop(getRootScrollTop());
    }
}
exports.resetScroll = resetScroll;
//# sourceMappingURL=scroll.js.map