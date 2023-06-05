"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("../utils");
const eye_png_1 = require("@/assets/components/eye.png");
const eye_closed_png_1 = require("@/assets/components/eye-closed.png");
const warn_png_1 = require("@/assets/components/warn.png");
const close_png_1 = require("@/assets/components/close.png");
const classnames_1 = require("classnames");
require("./index.scss");
const Field = (props) => {
    const [bem] = (0, utils_1.createNamespace)("field");
    const [inputValue, SetInputValue] = (0, react_1.useState)("");
    const [inputFocus, setInputFocus] = (0, react_1.useState)(!!props.focus);
    const getModelValue = () => { var _a; return String((_a = props.value) !== null && _a !== void 0 ? _a : ""); };
    (0, react_1.useEffect)(() => {
        SetInputValue(props.value);
    }, [props.value]);
    (0, react_1.useEffect)(() => {
        if (inputValue) {
            updateValue(getModelValue());
        }
    }, [inputValue]);
    const updateValue = (value, trigger = "onChange") => {
        let val = value;
        if (props.type === "digit" || props.type === "tel") {
            val = (0, utils_1.formatNumber)(val, false, false);
        }
        if (props.type === "number") {
            val = (0, utils_1.formatNumber)(val, true, true);
        }
        if (props.type === "tel" && !props.formatter) {
            const regTel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
            const regNumber = /[^-0-9]/g;
            val = !regTel.test(val) && val.length > 11 ? val.substring(0, 11) : val.replace(regNumber, "");
        }
        if (props.type === "idcard" && !props.formatter) {
            const regTel = /^(\d{18}|\d{17}Xx)$/;
            const regNumber = /[^-0-9Xx]/g;
            val = !regTel.test(val) && val.length > 18 ? val.substring(0, 18) : val.replace(regNumber, "");
        }
        // if (isDef(props.maxlength) && val.length > +props.maxlength) {
        //   val = val.slice(0, Number(props.maxlength));
        // }
        if (props.formatter && trigger === props.formatTrigger) {
            val = props.formatter(val);
        }
        SetInputValue(val);
        props.onChange && props.onChange(val);
    };
    const maxLength = type => {
        if (type === "tel")
            return 11;
        if (type === "idcard")
            return 18;
        return props.maxlength;
    };
    const handleFocus = (e) => {
        setInputFocus(true);
        props.onFocus && props.onFocus(e);
    };
    const handleBlur = e => {
        setInputFocus(false);
        props.onBlur && props.onBlur(e);
    };
    const handleChange = e => {
        let val = e.target.value;
        if (!!maxLength && val.length > Number(maxLength)) {
            val = val.slice(0, Number(maxLength));
        }
        updateValue(val, "onChange");
    };
    // 是否显示内边框
    const renderBorder = () => {
        if (props.border) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("border")), style: props.borderStyle }));
        }
        return null;
    };
    // 左侧图标
    const renderIcon = () => {
        if (props.icon) {
            const iconSize = () => {
                if (props.iconSize) {
                    return { width: (0, utils_1.addUnit)(props.iconSize), height: (0, utils_1.addUnit)(props.iconSize) };
                }
                return {};
            };
            return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: typeof props.icon !== "string" && (0, react_1.isValidElement)(props.icon) ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("icon"), props.iconClass), style: props.iconStyle, onClick: props.onIcon }, { children: props.icon }))) : ((0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("icon", { image: true }), props.iconClass), style: Object.assign(Object.assign({}, iconSize()), props.iconStyle), 
                    // @ts-ignore
                    src: props.icon, mode: "aspectFill", onClick: props.onIcon })) }));
        }
        return null;
    };
    // 标题
    const titleStyle = () => {
        if (props.titleWidth && !props.titleRow) {
            return { width: (0, utils_1.addUnit)(props.titleWidth) };
        }
        return {};
    };
    const renderDesc = () => {
        if (props.desc) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("desc", {
                    row: props.titleRow,
                    [`${props.size}`]: props.size,
                    [`${props.titleAlign}`]: props.titleAlign
                }), props.descClass), style: props.descStyle }, { children: props.desc })));
        }
        return null;
    };
    const renderTitle = () => {
        if (props.title) {
            return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("title", { row: props.titleRow }), props.titleClass), style: Object.assign({}, titleStyle()) }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("label", {
                            error: props.error,
                            disabled: props.disabled,
                            [`${props.size}`]: props.size,
                            [`${props.titleAlign}`]: props.titleAlign
                        })), style: props.titleStyle }, { children: [props.required && (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("required")) }, { children: "*" })), props.title, props.colon && "："] })), renderDesc(), props.errorMessagePosition === "title" && props.titleRow ? renderMessage() : null] })));
        }
        return null;
    };
    // 是否显示清除按钮
    const showClear = (0, react_1.useMemo)(() => {
        if (props.clearable && !props.readonly && !props.disabled && inputValue.length > 0) {
            return props.clearTrigger === "always" || (props.clearTrigger === "focus" && inputFocus);
        }
        return false;
    }, [props.clearTrigger, inputValue, inputFocus]);
    const handleClear = () => {
        updateValue("");
        props.onClear && props.onClear();
        // setInputFocus(true);
    };
    const renderClear = () => {
        if (!showClear)
            return null;
        return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("clear")), onTouchStart: handleClear }, { children: (0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("clear-icon")), src: close_png_1.default, mode: "aspectFill" }) })));
    };
    // 错误提示图标
    const renderErrorIcon = () => {
        if (!props.error || !props.errorIcon)
            return null;
        return ((0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("error-icon")), src: warn_png_1.default, mode: "aspectFill" }));
    };
    // type = "password" 的显隐密码
    const [password, setPassword] = (0, react_1.useState)(props.type === "password");
    (0, react_1.useEffect)(() => {
        setPassword(props.type === "password");
    }, [props.type]);
    const onEyeIcon = () => {
        setPassword(preState => {
            return !preState;
        });
    };
    const renderEyeIcon = () => {
        if (props.type !== "password")
            return null;
        return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("eye", { active: !password })), onClick: onEyeIcon }, { children: (0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("eye-icon")), src: !password ? eye_closed_png_1.default : eye_png_1.default, mode: "aspectFill" }) })));
    };
    // 右侧额外信息
    const renderRight = () => {
        if (props.right) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("right"), props.rightClass), style: props.rightStyle, onClick: props.onRight }, { children: props.right })));
        }
        return null;
    };
    // 字数限制提示
    const renderWordLimit = () => {
        const { value, showWordLimit, maxlength } = props;
        if (showWordLimit && maxlength) {
            const count = (value ? `${value}` : "").length;
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("word-limit", { textarea: props.type === "textarea" })) }, { children: (0, jsx_runtime_1.jsxs)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("word-num")) }, { children: [count, "/", maxlength] })) })));
        }
        return null;
    };
    // 输入框下面的错误提示文字
    const renderMessage = () => {
        const message = props.errorMessage && props.error;
        if (message) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("error-message", {
                    [`${props.inputAlign}`]: props.inputAlign,
                    title: props.errorMessagePosition === "title" && props.titleRow
                })) }, { children: props.errorMessage })));
        }
        return null;
    };
    // 额外的提示信息
    const renderIntro = () => {
        if (props.intro) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("intro", {
                    [`${props.inputAlign}`]: props.inputAlign,
                    [`${props.introPosition}`]: props.introPosition
                })) }, { children: props.intro })));
        }
        return null;
    };
    // 箭头
    const renderArrow = () => {
        if (props.arrow) {
            return ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("arrow", { [`${props.arrowDirection}`]: props.arrowDirection, [`${props.size}`]: props.size })) }));
        }
        return null;
    };
    // textarea 设置最大高度和最小高度
    const adjustSize = (0, react_1.useMemo)(() => {
        if (!(props.type === "textarea" && props.autosize)) {
            return props.inputStyle;
        }
        if ((0, utils_1.isObject)(props.autosize)) {
            const { maxHeight, minHeight } = props.autosize;
            const style = Object.assign({}, props.inputStyle);
            if (maxHeight) {
                style.maxHeight = (0, utils_1.addUnit)(maxHeight);
            }
            if (minHeight) {
                style.minHeight = (0, utils_1.addUnit)(minHeight);
            }
            return style;
        }
    }, [props.type, props.autosize]);
    const renderInput = () => {
        var _a, _b, _c;
        const { type, error, errorInput, disabled, readonly } = props;
        const inputFontSize = () => {
            if (props.size === "large") {
                return { fontSize: (0, utils_1.addUnit)(16) };
            }
            else if (props.size === "small") {
                return { fontSize: (0, utils_1.addUnit)(12) };
            }
            return {};
        };
        const controlClass = bem("input", {
            disabled,
            readonly,
            text: !props.input,
            error: props.error && props.errorInput,
            "min-height": props.type === "textarea" && !props.autosize,
            textarea: props.type === "textarea",
            [`${props.inputAlign}`]: props.inputAlign,
            [`${props.size}`]: props.size
        });
        const inputType = type => {
            if (type === "tel")
                return "number";
            if (type === "password" || type === "textarea")
                return "text";
            return type;
        };
        const attribute = {
            type: inputType(props.type),
            name: props.name,
            placeholder: props.placeholder,
            placeholderStyle: props.placeholderStyle,
            placeholderClass: props.placeholderClass,
            disabled: props.disabled || props.readonly,
            maxlength: maxLength(props.type),
            // focus: inputFocus,
            cursorSpacing: props.cursorSpacing,
            cursor: props.cursor,
            selectionStart: props.selectionStart,
            selectionEnd: props.selectionEnd,
            adjustPosition: props.adjustPosition,
            holdKeyboard: props.holdKeyboard,
            onInput: handleChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onConfirm: props.onConfirm,
            onKeyboardHeightChange: props.onKeyboardHeightChange,
            nativeProps: props.nativeProps,
            className: (0, classnames_1.default)(controlClass)
        };
        if (!props.input)
            return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(controlClass), style: Object.assign(Object.assign(Object.assign({ color: props.color }, inputFontSize()), props.inputStyle), { textAlign: `${(_a = props.inputAlign) !== null && _a !== void 0 ? _a : "left"}` }) }, { children: props.value || props.children })));
        if (type === "textarea") {
            return ((0, jsx_runtime_1.jsx)(components_1.Textarea, Object.assign({}, attribute, { value: inputValue, 
                // @ts-ignore
                autoHeight: props.autoHeight, fixed: props.fixed, showConfirmBar: props.showConfirmBar, disableDefaultPadding: props.disableDefaultPadding, onLineChange: props.onLineChange, style: Object.assign({ color: props.color, textAlign: `${(_b = props.inputAlign) !== null && _b !== void 0 ? _b : "left"}` }, adjustSize) })));
        }
        else {
            return ((0, jsx_runtime_1.jsx)(components_1.Input, Object.assign({}, attribute, { value: inputValue, password: password, placeholderTextColor: error && errorInput ? "#ff3447" : props.placeholderTextColor, confirmType: props.confirmType, confirmHold: props.confirmHold, style: Object.assign(Object.assign(Object.assign({ color: props.color }, inputFontSize()), props.inputStyle), { textAlign: `${(_c = props.inputAlign) !== null && _c !== void 0 ? _c : "left"}` }) })));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ style: props.style, hoverStyle: !!props.clickable ? { backgroundColor: "#f9fafa" } : {}, className: (0, classnames_1.default)(bem({
            [`${props.align}`]: props.align,
            [`${props.size}`]: props.size,
            clickable: props.clickable,
            pill: props.pill,
            "pill-textarea": props.pill && props.textarea,
            hairline: props.pill && props.hairline,
            wrap: props.titleRow
        }), props.className), onClick: props.onClick }, { children: [renderBorder(), renderIcon(), renderTitle(), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("body", { wrap: props.titleRow })) }, { children: [props.introPosition === "top" ? renderIntro() : null, (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("control-wrapper", { start: props.type === "textarea" })), onClick: props.onClickInput }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("control")) }, { children: renderInput() })), props.type !== "textarea" ? renderWordLimit() : null, renderClear(), renderErrorIcon(), renderEyeIcon(), renderRight(), renderArrow()] })), props.type === "textarea" ? renderWordLimit() : null, !(props.errorMessagePosition === "title" && props.titleRow) ? renderMessage() : null, props.introPosition === "bottom" ? renderIntro() : null] }))] })));
};
Field.defaultProps = {
    border: true,
    value: "",
    type: "text",
    input: true,
    clearTrigger: "always",
    formatTrigger: "onChange",
    confirmType: "done",
    introPosition: "top",
    errorMessagePosition: "content",
    maxlength: 140,
    adjustPosition: true,
    errorIcon: true,
    arrowDirection: "right"
};
exports.default = Field;
//# sourceMappingURL=index.js.map