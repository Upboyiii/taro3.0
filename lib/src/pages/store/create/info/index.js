"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const taro_1 = require("@tarojs/taro");
const utils_1 = require("@/components/utils");
const field_1 = require("@/components/field");
const button_1 = require("@/components/button");
const classnames_1 = require("classnames");
require("../index/index.scss");
const CreateInfo = () => {
    const [bem] = (0, utils_1.createNamespace)("store", "create");
    // @ts-ignore
    const [storeForm, seSstoreForm] = (0, react_1.useState)({
        chain: 1,
        loc: [],
        name: "",
        logo: "",
        store_data: {
            county_id: "",
            phone: "",
            address: ""
        },
        type: null,
        type_ids: [] // 副业
    });
    return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header-title")) }, { children: "\u5E97\u94FA\u4FE1\u606F" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header-desc")) }, { children: "3\u6B65\u6781\u901F\u5F00\u5E97" }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("title")) }, { children: "\u586B\u5199\u5E97\u94FA\u76F8\u5173\u4FE1\u606F" })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("card", bem()) }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { className: (0, classnames_1.default)(bem("field")), title: "\u5E97\u94FA\u540D\u79F0", value: storeForm.name, placeholder: "\u8BF7\u8F93\u5165\u5E97\u94FA\u540D\u79F0\uFF0C\u5EFA\u8BAE10\u5B57\u4EE5\u5185" }), (0, jsx_runtime_1.jsx)(field_1.default, { className: (0, classnames_1.default)(bem("field")), type: "tel", title: "\u8054\u7CFB\u7535\u8BDD", value: storeForm.store_data.phone, placeholder: "\u8BF7\u8F93\u5165\u8054\u7CFB\u7535\u8BDD" }), (0, jsx_runtime_1.jsx)(field_1.default, { className: (0, classnames_1.default)(bem("field")), title: "\u6240\u5C5E\u533A\u57DF", value: storeForm.store_data.phone, placeholder: "\u9009\u62E9\u7701/\u5E02/\u533A/\u53BF", 
                        // size="large"
                        readonly: true, arrow: true, clickable: true }), (0, jsx_runtime_1.jsx)(field_1.default, { className: (0, classnames_1.default)(bem("field")), title: "\u8BE6\u7EC6\u5730\u5740", type: "textarea", value: storeForm.store_data.address, placeholder: "\u8BF7\u586B\u8BE6\u7EC6\u5730\u5740\uFF08\u52FF\u91CD\u590D\u586B\u5199\u7701\u5E02\u533A\u4FE1\u606F\uFF09" })] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("safe-area-inset-bottom") }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "bottom-bar" }, { children: [(0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ type: "info", size: "medium", style: { width: "70%" } }, { children: "\u540C\u610F\u534F\u8BAE\u5E76\u5F00\u5E97" })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("tips")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("tips-text")) }, { children: "\u5F00\u5E97\u5373\u4EE3\u8868\u4F60\u5DF2\u540C\u610F" })), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("tips-text", "link")), onClick: () => {
                                        taro_1.default.navigateTo({ url: `/pages/webView/index?url=http://www.mall.com/rule/service/&title=彩豚软件服务协议` });
                                    } }, { children: "\u300A\u5F69\u8C5A\u8F6F\u4EF6\u670D\u52A1\u534F\u8BAE\u300B" }))] }))] })) }))] }));
};
exports.default = CreateInfo;
//# sourceMappingURL=index.js.map