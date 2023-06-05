"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const button_1 = require("@/components/button");
require("./index.scss");
const Dashboard = () => {
    return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "flex-page", style: { flex: 1 } }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card", style: { padding: 32, marginTop: 12 } }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ type: "info", onClick: () => {
                    taro_1.default.navigateTo({
                        url: 'pages/shop/edit/index'
                    });
                } }, { children: "\u6DFB\u52A0\u7559\u8A00" })) })) })));
};
exports.default = Dashboard;
//# sourceMappingURL=index.js.map