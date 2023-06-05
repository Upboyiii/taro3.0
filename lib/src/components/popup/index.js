"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// @ts-ignore
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("../utils");
const classnames_1 = require("classnames");
require("./index.scss");
const Popup = props => {
    const [bem] = (0, utils_1.createNamespace)("popup");
    (0, react_1.useEffect)(() => {
        if (process.env.TARO_ENV === "h5") {
            let ele = document.querySelector(".taro_page");
            if (ele) {
                if (props.show) {
                    ele.setAttribute("style", "overflow:hidden");
                }
                else {
                    ele.setAttribute("style", "");
                }
            }
        }
    }, [props.show]);
    const closeClick = () => {
        props.onClose && props.onClose();
    };
    const onClickOverlay = () => {
        props.overlayClickable && closeClick();
    };
    const renderOverlay = () => {
        if (props.overlay) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("overlay", { in: props.show })), style: props.overlayStyle, onClick: onClickOverlay }));
        }
        return null;
    };
    const renderClose = () => {
        if (props.closeable) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ style: props.closeStyle, className: (0, classnames_1.default)(bem("close", { [`${props.closePosition}`]: props.closePosition })), onClick: closeClick }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("plus")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--v" }), (0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--h" })] })) })));
        }
        return null;
    };
    const renderHeader = () => {
        const hasHeader = props.title || props.desc;
        if (hasHeader) {
            return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header", { [`${props.headerAlign}`]: props.headerAlign })) }, { children: [props.title ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("title")), style: props.titleStyle }, { children: props.title }))) : null, props.desc ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("desc")), style: props.descStyle }, { children: props.desc }))) : null, props.headerBorder ? (0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("border", "header")) }) : null] })));
        }
        return null;
    };
    const renderBody = () => {
        let styles = {};
        if (props.position !== "right") {
            if (props.minHeight) {
                styles.minHeight = (0, utils_1.addUnit)(props.minHeight);
            }
            if (props.maxHeight) {
                styles.maxHeight = (0, utils_1.addUnit)(props.maxHeight);
            }
        }
        return ((0, jsx_runtime_1.jsx)(components_1.ScrollView, Object.assign({ style: styles, className: (0, classnames_1.default)(bem("body")), scrollWithAnimation: true, scrollY: true }, { children: props.children })));
    };
    const renderAction = () => {
        if (props.action) {
            return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("action"), props.actionClass) }, { children: [props.actionBorder ? (0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("border", "action")) }) : null, props.action ? props.action : null] })));
        }
        return null;
    };
    const renderPopup = () => {
        let styles = {};
        if (props.round) {
            if (props.position === "bottom" || props.position === "center") {
                styles.borderTopLeftRadius = (0, utils_1.addUnit)(16);
                styles.borderTopRightRadius = (0, utils_1.addUnit)(16);
            }
            if (props.position === "top" || props.position === "center") {
                styles.borderBottomLeftRadius = (0, utils_1.addUnit)(16);
                styles.borderBottomRightRadius = (0, utils_1.addUnit)(16);
            }
        }
        return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("content", { round: props.round, [`${props.position}`]: props.position }), {
                "safe-area-bottom": props.position === "bottom" || props.position === "right",
                "safe-area-inset-top": props.position === "bottom" || props.position === "right"
            }), style: Object.assign(Object.assign({}, styles), props.customStyle) }, { children: [renderClose(), renderHeader(), renderBody(), renderAction()] })));
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem({ open: props.show })), style: { zIndex: props.zIndex } }, { children: [renderOverlay(), renderPopup()] })));
};
Popup.defaultProps = {
    position: "bottom",
    zIndex: 1000,
    round: true,
    overlay: true,
    overlayClickable: true,
    closeable: true,
    closePosition: "top-right",
    headerAlign: "center",
    minHeight: 320,
    maxHeight: 600
};
exports.default = Popup;
//# sourceMappingURL=index.js.map