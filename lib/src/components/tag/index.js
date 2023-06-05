"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@tarojs/components");
const utils_1 = require("../utils");
const classnames_1 = require("classnames");
require("./index.scss");
const Tag = props => {
    const [bem] = (0, utils_1.createNamespace)("tag");
    // @ts-ignore
    const onClick = () => {
        !props.disabled && props.onClick && props.onClick();
    };
    const styles = {};
    if (props.color) {
        styles.color = props.dark ? "#ffffff" : props.color;
        if (props.plain) {
            styles.borderColor = props.color;
        }
        else {
            styles.backgroundColor = props.color;
        }
    }
    if (props.textColor) {
        styles.color = props.textColor;
    }
    return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem({
            round: props.round && !props.mark,
            mark: props.mark,
            dark: props.dark && !props.plain,
            [`dark-${props.type}`]: props.dark && !props.plain && props.type,
            plain: props.plain,
            [`plain-${props.type}`]: props.plain && props.type,
            [`${props.type}`]: !props.dark && !props.plain,
            disabled: props.disabled,
            [`${props.size}`]: props.size
        }), props.className), style: Object.assign(Object.assign({}, styles), props.style), onClick: props.onClick }, { children: props.children })));
};
exports.default = Tag;
Tag.defaultProps = {
    type: "default",
    plain: true
};
//# sourceMappingURL=index.js.map