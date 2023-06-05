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
require("./index.scss");
const Login = () => {
    const [type, setType] = (0, react_1.useState)(1);
    const [form, setForm] = (0, react_1.useState)({ user: "", pass: "" });
    const [error, setError] = (0, react_1.useState)({ user: "", pass: "" });
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
        return "";
    };
    const verifyForm = (val, mode) => {
        if (type === 2) {
            setError(prev => {
                let temp = JSON.parse(JSON.stringify(prev));
                let tempType = mode === "user" ? "phone" : mode === "pass" ? "sms" : "";
                temp[mode] = verifyReg(val, tempType);
                return temp;
            });
        }
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
    const loginType = type => {
        setForm({ user: "", pass: "" });
        setError({ user: "", pass: "" });
        setType(type);
    };
    const loginSubmit = () => {
        let vaild = true;
        setError(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            temp.user = !form.user;
            temp.pass = !form.pass;
            if (type === 2) {
                temp.user = verifyReg(form.user, "phone");
                temp.pass = verifyReg(form.pass, "sms");
                if (!!temp.user) {
                    taro_1.default.showToast({ title: temp.user, icon: "none" });
                }
                else if (!!temp.pass) {
                    taro_1.default.showToast({ title: temp.pass, icon: "none" });
                }
            }
            vaild = !(!!temp.user || !!temp.pass);
            return temp;
        });
        console.log(vaild, "vaild");
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("sign", { "sign--h5": process.env.TARO_ENV === "h5" }) }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-header" }, { children: (0, jsx_runtime_1.jsx)(components_1.Image, { className: "sign-logo", mode: "aspectFill", src: logo_png_1.default }) })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "sign-tabs" }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("sign-tabs__item", { "sign-tabs__item--active": type === 1 }), onClick: () => { loginType(1); } }, { children: "\u5BC6\u7801\u767B\u5F55" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("sign-tabs__item", { "sign-tabs__item--active": type === 2 }), onClick: () => { loginType(2); } }, { children: "\u9A8C\u8BC1\u7801\u767B\u5F55" }))] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "sign-form card" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { type: type === 1 ? "text" : "tel", className: "sign-form__field", name: "user", titleStyle: { fontWeight: "bold" }, titleRow: true, title: type === 1 ? "用户名/邮箱/手机号码" : "手机号码", placeholder: type === 1 ? "用户名/邮箱/手机号码" : "手机号码", value: form.user, onChange: (val) => { handleChange(val, "user"); }, onBlur: () => { handleVerifyForm("user"); }, error: !!error.user, errorIcon: false, errorMessage: error.user, errorMessagePosition: "title" }), (0, jsx_runtime_1.jsx)(field_1.default, { border: false, type: type === 1 ? "password" : "digit", maxlength: type === 1 ? 99 : 6, className: "sign-form__field", name: "password", titleStyle: { fontWeight: "bold" }, titleRow: true, title: type === 1 ? "登录密码" : "短信验证码", placeholder: type === 1 ? "请输入密码" : "请输入短信验证码", value: form.pass, onChange: (val) => { handleChange(val, "pass"); }, onBlur: () => { handleVerifyForm("pass"); }, error: !!error.pass, errorIcon: false, errorMessage: error.pass, errorMessagePosition: "title", onRight: handleGetCaptcha, right: type === 2 && ((0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ style: { lineHeight: "24px", color: !sendSms.canSend || (!!form.user && error.user) || !form.user ? "#999" : "#0080ff" } }, { children: sendSms.canSend ? "获取验证码" : `${sendSms.seconds}s后重新获取` }))) })] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "sign-link" }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-link__item", onClick: () => {
                            taro_1.default.navigateTo({ url: '/pages/sign/findpass/index' });
                        } }, { children: "\u5FD8\u8BB0\u5BC6\u7801" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-link__sep" }, { children: "|" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-link__item", onClick: () => {
                            taro_1.default.navigateTo({ url: '/pages/sign/register/index' });
                        } }, { children: "\u514D\u8D39\u6CE8\u518C" }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-action" }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ type: "info", size: "medium", onClick: loginSubmit, disabled: (!!error.user || !!error.pass) || !form.user || !form.pass }, { children: "\u7ACB\u5373\u767B\u5F55" })) })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "sign-tips" }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "sign-tips__text" }, { children: "\u767B\u5F55\u5373\u8868\u793A\u5DF2\u9605\u8BFB\u5E76\u540C\u610F" })), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)("sign-tips__text", "sign-tips__text--link"), onClick: () => {
                            taro_1.default.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/agreement/&title=用户协议` });
                        } }, { children: "\u300A\u7528\u6237\u534F\u8BAE\u300B" })), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)("sign-tips__text", "sign-tips__text--link"), onClick: () => {
                            taro_1.default.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/privacy/&title=隐私政策` });
                        } }, { children: "\u300A\u9690\u79C1\u653F\u7B56\u300B" }))] }))] })));
};
exports.default = Login;
//# sourceMappingURL=index.js.map