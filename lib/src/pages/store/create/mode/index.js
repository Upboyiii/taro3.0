"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const taro_1 = require("@tarojs/taro");
const utils_1 = require("@/components/utils");
const cell_1 = require("@/components/cell");
const classnames_1 = require("classnames");
require("../index/index.scss");
const CreateMode = () => {
    const [bem] = (0, utils_1.createNamespace)("store", "create");
    return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header-title")) }, { children: "\u5E97\u94FA\u6A21\u5F0F" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header-desc")) }, { children: "3\u6B65\u6781\u901F\u5F00\u5E97" }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("title")) }, { children: "\u9009\u62E9\u5E97\u94FA\u6A21\u5F0F" })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("card", bem()) }, { children: [(0, jsx_runtime_1.jsx)(cell_1.default, { className: (0, classnames_1.default)(bem("item")), style: { paddingTop: (0, utils_1.addUnit)(24), paddingRight: (0, utils_1.addUnit)(24), paddingBottom: (0, utils_1.addUnit)(24), paddingLeft: (0, utils_1.addUnit)(24) }, border: false, title: "\u5355\u5E97\u7248", textStyle: { fontSize: (0, utils_1.addUnit)(24), lineHeight: (0, utils_1.addUnit)(28), fontWeight: "bold", marginBottom: (0, utils_1.addUnit)(8) }, label: "\u9002\u7528\u5355\u4E2A\u7F51\u5E97\u7684\u5546\u5BB6", labelStyle: { fontSize: (0, utils_1.addUnit)(14) }, arrow: true, clickable: true, onClick: () => {
                            taro_1.default.navigateTo({
                                url: "/pages/store/create/info/index?mode=" + 1
                            });
                        } }), (0, jsx_runtime_1.jsx)(cell_1.default, { className: (0, classnames_1.default)(bem("item")), style: { paddingTop: (0, utils_1.addUnit)(24), paddingRight: (0, utils_1.addUnit)(24), paddingBottom: (0, utils_1.addUnit)(24), paddingLeft: (0, utils_1.addUnit)(24) }, title: "\u591A\u5E97\u7248", textStyle: { fontSize: (0, utils_1.addUnit)(24), lineHeight: (0, utils_1.addUnit)(28), fontWeight: "bold", marginBottom: (0, utils_1.addUnit)(8) }, label: "\u9002\u7528\u591A\u5BB6\u7F51\u5E97\u7684\u8FDE\u9501\u5546\u5BB6", labelStyle: { fontSize: (0, utils_1.addUnit)(14) }, borderStyle: { left: (0, utils_1.addUnit)(24) }, arrow: true, clickable: true, onClick: () => {
                            taro_1.default.navigateTo({
                                url: "/pages/store/create/info/index?mode=" + 2
                            });
                        } })] }))] }));
};
exports.default = CreateMode;
//# sourceMappingURL=index.js.map