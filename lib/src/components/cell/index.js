"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("../utils");
const classnames_1 = require("classnames");
require("./index.scss");
const Cell = props => {
    const [bem] = (0, utils_1.createNamespace)("cell");
    const onClick = (e) => {
        props.onClick && props.onClick(e);
    };
    const renderBorder = () => {
        if (props.border || props.divider) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("border", { hasicon: props.icon && props.border })), style: props.borderStyle }));
        }
        return null;
    };
    const renderIcon = () => {
        const iconSize = () => {
            if (props.iconSize) {
                return { width: (0, utils_1.addUnit)(props.iconSize), height: (0, utils_1.addUnit)(props.iconSize) };
            }
            return {};
        };
        if (props.icon) {
            return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: typeof props.icon !== "string" && (0, react_1.isValidElement)(props.icon) ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("icon"), props.iconClass), style: props.iconStyle }, { children: props.icon }))) : ((0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("icon", { image: true, round: props.iconRound }), props.iconClass), style: Object.assign(Object.assign({}, iconSize()), props.iconStyle), 
                    // @ts-ignore
                    src: props.icon, mode: "aspectFill" })) }));
        }
        return null;
    };
    const renderLabel = () => {
        if (props.label) {
            return ((0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("label"), props.labelClass), style: props.labelStyle }, { children: props.label })));
        }
        return null;
    };
    const renderTitle = () => {
        var _a;
        const hasChildren = process.env.TARO_ENV === "rn" ? Object.keys((_a = props.children) !== null && _a !== void 0 ? _a : {}).length > 0 : !!props.children;
        const hasContent = !!props.content || hasChildren;
        if (props.title) {
            return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("title", { full: !hasContent }), props.titleClass), style: props.titleStyle }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("text", { [`${props.size}`]: props.size })), style: props.textStyle }, { children: props.title })), renderLabel()] })));
        }
        return null;
    };
    const renderContent = () => {
        var _a;
        const hasChildren = process.env.TARO_ENV === "rn" ? Object.keys((_a = props.children) !== null && _a !== void 0 ? _a : {}).length > 0 : !!props.children;
        const hasContent = !!props.content || hasChildren;
        if (hasContent) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ style: props.contentStyle, className: (0, classnames_1.default)(bem("content", { [`${props.contentAlign}`]: props.contentAlign, [`${props.size}`]: props.size }), props.contentClass) }, { children: hasChildren ? props.children : props.content })));
        }
    };
    const renderExtra = () => {
        if (props.extra) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("extra", { [`${props.size}`]: props.size }), props.extraClass), style: props.extraStyle }, { children: props.extra })));
        }
        return null;
    };
    const onRightClick = e => {
        if (props.onRight) {
            e.stopPropagation();
            props.onRight();
        }
    };
    const renderRight = () => {
        if (props.rightIcon) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("right-icon"), props.rightClass), style: props.rightStyle, onClick: onRightClick }, { children: props.rightIcon })));
        }
        return null;
    };
    const renderArrow = () => {
        if (props.arrow) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("arrow", { [`${props.arrowDirection}`]: props.arrowDirection, [`${props.size}`]: props.size })) }));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ style: props.style, hoverStyle: !!props.clickable ? { backgroundColor: "#f9fafa" } : {}, className: (0, classnames_1.default)(bem({
            [`${props.align}`]: props.align,
            [`${props.size}`]: props.size,
            divider: props.divider,
            clickable: props.clickable
        }), props.className), onClick: onClick }, { children: [renderBorder(), renderIcon(), renderTitle(), renderContent(), renderExtra(), renderRight(), renderArrow()] })));
};
Cell.defaultProps = {
    border: true,
    align: "center",
    contentAlign: "right",
    arrowDirection: "right",
    iconRound: true
};
exports.default = Cell;
//# sourceMappingURL=index.js.map