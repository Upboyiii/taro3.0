"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("../utils");
const loading_1 = require("../loading");
const classnames_1 = require("classnames");
require("./index.scss");
const OwlButton = props => {
    const [bem] = (0, utils_1.createNamespace)("button");
    const classes = (0, classnames_1.default)(props.className, bem([
        props.type,
        props.size,
        {
            [`${props.shape}`]: props.shape,
            [`tinge-${props.type}`]: props.tinge,
            plain: props.plain || props.hairline,
            loading: props.loading,
            disabled: props.disabled,
            hairline: props.hairline
        }
    ]));
    const style = () => {
        const styles = {};
        if (props.color) {
            if (!props.plain && !props.hairline) {
                styles.backgroundColor = props.color;
            }
        }
        return styles;
    };
    const onClick = event => {
        if (props.loading || props.disabled)
            return;
        if (props.onClick)
            props.onClick(event);
    };
    const onGetUserInfo = event => {
        props.onGetUserInfo && props.onGetUserInfo(event);
    };
    const onContact = event => {
        props.onContact && props.onContact(event);
    };
    const onGetPhoneNumber = event => {
        props.onGetPhoneNumber && props.onGetPhoneNumber(event);
    };
    const onError = event => {
        props.onError && props.onError(event);
    };
    const onOpenSetting = event => {
        props.onOpenSetting && props.onOpenSetting(event);
    };
    const onGetAuthorize = event => {
        props.onGetAuthorize && props.onGetAuthorize(event);
    };
    const renderBorder = () => {
        if ((props.plain || props.hairline) && props.type !== "text") {
            const styles = {};
            if (props.color) {
                styles.borderColor = props.color;
            }
            return ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("border", {
                    hairline: props.hairline,
                    [`hairline-${props.shape}`]: props.shape && props.hairline && !props.plain,
                    [`${props.shape}`]: props.shape && !props.hairline,
                    [`${props.type}`]: props.type
                })), style: styles }));
        }
        return null;
    };
    const renderButton = () => {
        if (!props.loading && !props.disabled) {
            if (process.env.TARO_ENV === "h5") {
                return (0, jsx_runtime_1.jsx)(components_1.Button, { className: (0, classnames_1.default)(bem("wxbutton")) });
            }
            else {
                return ((0, jsx_runtime_1.jsx)(components_1.Button, { className: (0, classnames_1.default)(bem("wxbutton")), lang: props.lang, formType: props.formType, openType: props.openType, scope: props.scope, sessionFrom: props.sessionFrom, sendMessageTitle: props.sendMessageTitle, sendMessagePath: props.sendMessagePath, sendMessageImg: props.sendMessageImg, showMessageCard: props.showMessageCard, appParameter: props.appParameter, onGetAuthorize: onGetAuthorize, onGetUserInfo: onGetUserInfo, onClick: onClick, onGetPhoneNumber: onGetPhoneNumber, onOpenSetting: onOpenSetting, onError: onError, onContact: onContact }));
            }
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
        if (props.loading) {
            return ((0, jsx_runtime_1.jsx)(loading_1.default, { className: (0, classnames_1.default)(bem("loading")), size: props.loadingSize, type: props.loadingType, color: props.type === "default" ? undefined : "" }));
        }
        if (props.icon) {
            return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: typeof props.icon !== "string" && (0, react_1.isValidElement)(props.icon) ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("icon", props.iconPosition)), style: props.iconStyle }, { children: props.icon }))) : ((0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("icon", { image: true })), style: Object.assign(Object.assign({}, iconSize()), props.iconStyle), 
                    // @ts-ignore
                    src: props.icon, mode: "aspectFill" })) }));
        }
        return null;
    };
    const renderText = () => {
        const styles = {};
        if (props.color) {
            styles.color = props.plain || props.hairline ? props.color : "#ffffff";
        }
        if (props.textColor) {
            styles.color = props.textColor;
        }
        let text = props.loading ? props.loadingText : (props.children || props.text);
        if (text) {
            return ((0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("text", {
                    [`plain-${props.type}`]: (props.plain || props.hairline || props.tinge) && props.type !== "text",
                    [`${props.size}`]: props.size,
                    [`${props.type}`]: props.type === "text" || props.type === "default"
                })) }, { children: text })));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: classes, style: Object.assign(Object.assign({}, style), props.style), onClick: (e) => { onClick(e); } }, { children: [renderBorder(), renderButton(), props.iconPosition === "left" && renderIcon(), renderText(), props.iconPosition === "right" && renderIcon()] })));
};
OwlButton.defaultProps = {
    type: "default",
    size: "normal",
    shape: "round",
    iconPosition: "left"
};
exports.default = OwlButton;
//# sourceMappingURL=index.js.map