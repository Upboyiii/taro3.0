"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const logo_png_1 = require("@/assets/logo.png");
const field_1 = require("@/components/field");
const button_1 = require("@/components/button");
const classnames_1 = require("classnames");
require("../login/index.scss");
const FindPass = () => {
    const [form, setForm] = (0, react_1.useState)({ user: "", msg_code: "", pass: "" });
    const [error, setError] = (0, react_1.useState)({ user: "", msg_code: "", pass: "" });
    const verifyReg = (val, type) => {
        let reg;
        if (type === "phone") {
            reg = /^1[3456789]\d{9}$/;
            if (!reg.test(val)) {
                return "请输入正确的手机号码";
            }
        }
        if (type === "sms") {
            reg = /^\d{6}$/;
            if (!reg.test(val)) {
                return "请输入6位数短信验证码";
            }
        }
        if (type === "pass") {
            reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
            if (!reg.test(val)) {
                return "请输入8-16位数字和字母组合密码";
            }
        }
        return "";
    };
    const verifyForm = (val, mode) => {
        setError(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            let tempType = mode === "user" ? "phone" : mode === "msg_code" ? "sms" : "pass";
            temp[mode] = verifyReg(val, tempType);
            return temp;
        });
    };
    const handleChange = (val, mode) => {
        setForm(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            temp[mode] = val;
            return temp;
        });
        verifyForm(val, mode);
    };
    const handleVerifyForm = type => {
        verifyForm(form[type], type);
    };
    const [sendSms, getSendSms] = (0, react_1.useState)({
        isGetting: false,
        canSend: true,
        seconds: 60
    });
    const handleGetCaptcha = () => {
        if (!(!sendSms.canSend || (!!form.user && error.user) || !form.user)) {
            getSendSms(prev => {
                let temp = JSON.parse(JSON.stringify(prev));
                temp.canSend = false;
                return temp;
            });
            console.log("获取验证码");
        }
    };
    const btnSubmit = () => {
        let vaild = true;
        setError(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            temp.user = verifyReg(form.user, "phone");
            temp.msg_code = verifyReg(form.msg_code, "sms");
            temp.pass = verifyReg(form.pass, "pass");
            if (!!temp.user) {
                taro_1.default.showToast({ title: temp.user, icon: "none" });
            }
            else if (!!temp.msg_code) {
                taro_1.default.showToast({ title: temp.msg_code, icon: "none" });
            }
            else if (!!temp.pass) {
                taro_1.default.showToast({ title: temp.pass, icon: "none" });
            }
            vaild = !(!!temp.user || !!temp.msg_code || !!temp.pass);
            return temp;
        });
        console.log(vaild, "vaild");
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("sign", { "sign--h5": process.env.TARO_ENV === "h5" }) }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-header" }, { children: (0, jsx_runtime_1.jsx)(components_1.Image, { className: "sign-logo", mode: "aspectFill", src: logo_png_1.default }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-salong" }, { children: "\u627E\u56DE\u5BC6\u7801" })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "sign-form card" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { type: "tel", className: "sign-form__field", name: "user", titleStyle: { fontWeight: "bold" }, titleRow: true, title: "\u624B\u673A\u53F7\u7801", placeholder: "\u6CE8\u518C\u65F6\u586B\u5199\u7684\u624B\u673A\u53F7\u7801", value: form.user, onChange: (val) => { handleChange(val, "user"); }, onBlur: () => { handleVerifyForm("user"); }, error: !!error.user, errorIcon: false, errorMessage: error.user, errorMessagePosition: "title" }), (0, jsx_runtime_1.jsx)(field_1.default, { type: "digit", maxlength: 6, className: "sign-form__field", name: "password", titleStyle: { fontWeight: "bold" }, titleRow: true, title: "\u77ED\u4FE1\u9A8C\u8BC1\u7801", placeholder: "\u8BF7\u8F93\u5165\u77ED\u4FE1\u9A8C\u8BC1\u7801", value: form.msg_code, onChange: (val) => { handleChange(val, "msg_code"); }, onBlur: () => { handleVerifyForm("msg_code"); }, error: !!error.msg_code, errorIcon: false, errorMessage: error.msg_code, errorMessagePosition: "title", onRight: handleGetCaptcha, right: (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ style: { lineHeight: "24px", color: !sendSms.canSend || (!!form.user && error.user) || !form.user ? "#999" : "#0080ff" } }, { children: sendSms.canSend ? "获取验证码" : `${sendSms.seconds}s后重新获取` })) }), (0, jsx_runtime_1.jsx)(field_1.default, { border: false, type: "password", className: "sign-form__field", name: "password", maxlength: 16, titleStyle: { fontWeight: "bold" }, titleRow: true, title: "\u8BBE\u7F6E\u65B0\u5BC6\u7801", placeholder: "8-16\u4F4D\u5FC5\u987B\u5305\u542B\u5B57\u6BCD\u548C\u6570\u5B57", value: form.pass, onChange: (val) => { handleChange(val, "pass"); }, onBlur: () => { handleVerifyForm("pass"); }, error: !!error.pass, errorIcon: false, errorMessage: error.pass, errorMessagePosition: "title" })] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-link" }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-link__item", onClick: () => {
                        taro_1.default.navigateTo({ url: '/pages/sign/login/index' });
                    } }, { children: "\u8FD4\u56DE\u767B\u5F55" })) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-action" }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ type: "info", size: "medium", onClick: btnSubmit, disabled: (!!error.user || !!error.msg_code || !!error.pass) || !form.user || !form.msg_code || !form.pass }, { children: "\u786E\u8BA4\u4FEE\u6539" })) }))] })));
};
exports.default = FindPass;
//# sourceMappingURL=index.js.map