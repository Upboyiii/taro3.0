"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@tarojs/components");
const react_native_1 = require("react-native");
const utils_1 = require("../utils");
const classnames_1 = require("classnames");
require("./index.scss");
const Popup = props => {
    const [bem] = (0, utils_1.createNamespace)("popup");
    const closeClick = () => {
        props.onClose && props.onClose();
    };
    const onClickOverlay = () => {
        props.overlayClickable && closeClick();
    };
    const renderClose = () => {
        if (props.closeable) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ style: props.closeStyle, className: (0, classnames_1.default)(bem("close", { [`${props.closePosition}`]: props.closePosition })), hoverStyle: { backgroundColor: "#fff0f2" }, onClick: closeClick }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("plus")), style: { width: (0, utils_1.addUnit)(12), height: (0, utils_1.addUnit)(12) } }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--v", style: { backgroundColor: "#bbb" } }), (0, jsx_runtime_1.jsx)(components_1.View, { className: "plus-item plus-item--h", style: { backgroundColor: "#bbb" } })] })) })));
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
        if (props.position === "right") {
            styles.flex = 1;
        }
        return (
        // @ts-ignore
        (0, jsx_runtime_1.jsxs)(react_native_1.SafeAreaView, Object.assign({ style: styles, className: (0, classnames_1.default)("content") }, { children: [renderClose(), renderHeader(), renderBody(), renderAction()] })));
    };
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
    return ((0, jsx_runtime_1.jsx)(components_1.PageContainer, Object.assign({ show: props.show, duration: 200, 
        // @ts-ignore
        overlayStyle: props.overlayStyle, 
        // @ts-ignore
        customStyle: Object.assign(Object.assign({}, styles), props.customStyle), zIndex: props.zIndex, position: props.position, overlay: props.overlay, onClickOverlay: onClickOverlay }, { children: renderPopup() })));
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
    minHeight: 360,
    maxHeight: 600
};
exports.default = Popup;
//# sourceMappingURL=index.rn.js.map