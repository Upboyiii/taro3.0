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
// import "./index.scss"
const Register = () => {
    const [form, setForm] = (0, react_1.useState)({ user: "", msg_code: "" });
    const [error, setError] = (0, react_1.useState)({ user: "", msg_code: "" });
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
    const loginSubmit = () => {
        let vaild = true;
        setError(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            temp.user = verifyReg(form.user, "phone");
            temp.msg_code = verifyReg(form.msg_code, "sms");
            if (!!temp.user) {
                taro_1.default.showToast({ title: temp.user, icon: "none" });
            }
            else if (!!temp.msg_code) {
                taro_1.default.showToast({ title: temp.msg_code, icon: "none" });
            }
            vaild = !(!!temp.user || !!temp.msg_code);
            return temp;
        });
        console.log(vaild, "vaild");
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("sign", { "sign--h5": process.env.TARO_ENV === "h5" }) }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-header" }, { children: (0, jsx_runtime_1.jsx)(components_1.Image, { className: "sign-logo", mode: "aspectFill", src: logo_png_1.default }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-salong" }, { children: "\u73B0\u5728\u6CE8\u518C\uFF0C\u5373\u53EF\u514D\u8D39\u5F00\u5E97" })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "sign-form card" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { type: "tel", className: "sign-form__field", name: "user", titleStyle: { fontWeight: "bold" }, titleRow: true, title: "\u624B\u673A\u53F7\u7801", placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u7801", value: form.user, onChange: (val) => { handleChange(val, "user"); }, onBlur: () => { handleVerifyForm("user"); }, error: !!error.user, errorIcon: false, errorMessage: error.user, errorMessagePosition: "title" }), (0, jsx_runtime_1.jsx)(field_1.default, { border: false, type: "digit", maxlength: 6, className: "sign-form__field", name: "password", titleStyle: { fontWeight: "bold" }, titleRow: true, title: "\u77ED\u4FE1\u9A8C\u8BC1\u7801", placeholder: "\u8BF7\u8F93\u5165\u77ED\u4FE1\u9A8C\u8BC1\u7801", value: form.msg_code, onChange: (val) => { handleChange(val, "msg_code"); }, onBlur: () => { handleVerifyForm("msg_code"); }, error: !!error.msg_code, errorIcon: false, errorMessage: error.msg_code, errorMessagePosition: "title", onRight: handleGetCaptcha, right: (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ style: { lineHeight: "24px", color: !sendSms.canSend || (!!form.user && error.user) || !form.user ? "#999" : "#0080ff" } }, { children: sendSms.canSend ? "获取验证码" : `${sendSms.seconds}s后重新获取` })) })] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-link" }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-link__item", onClick: () => {
                        taro_1.default.navigateTo({ url: '/pages/sign/login/index' });
                    } }, { children: "\u5DF2\u6709\u8D26\u53F7\uFF1F\u767B\u5F55" })) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "sign-action" }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ type: "info", size: "medium", onClick: loginSubmit, disabled: (!!error.user || !!error.msg_code) || !form.user || !form.msg_code }, { children: "\u7ACB\u5373\u6CE8\u518C" })) })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "sign-tips" }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "sign-tips__text" }, { children: "\u6CE8\u518C\u5373\u8868\u793A\u5DF2\u9605\u8BFB\u5E76\u540C\u610F " })), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)("sign-tips__text", "sign-tips__text--link"), onClick: () => {
                            taro_1.default.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/agreement/&title=用户协议` });
                        } }, { children: "\u300A\u7528\u6237\u534F\u8BAE\u300B" })), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)("sign-tips__text", "sign-tips__text--link"), onClick: () => {
                            taro_1.default.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/privacy/&title=隐私政策` });
                        } }, { children: "\u300A\u9690\u79C1\u653F\u7B56\u300B" }))] }))] })));
};
exports.default = Register;
//# sourceMappingURL=index.js.map