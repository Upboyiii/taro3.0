"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const cell_1 = require("@/components/cell");
const tag_1 = require("@/components/tag");
require("./index.scss");
const My = () => {
    return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "cards" }, { children: (0, jsx_runtime_1.jsx)(cell_1.default, { border: false, 
                    // icon="https://img14.360buyimg.com/pop/jfs/t1/138480/1/24677/141681/61a239e4Effd6e2ab/ea09bd3fbcc6270b.jpg"
                    // iconSize={44}
                    iconStyle: { marginRight: (0, utils_1.addUnit)(12) }, icon: (0, jsx_runtime_1.jsx)(components_1.View, { style: {
                            width: (0, utils_1.addUnit)(4),
                            height: (0, utils_1.addUnit)(36),
                            backgroundColor: "#e5e5e5",
                            borderRadius: (0, utils_1.addUnit)(4)
                        } }), title: "\u5F69\u8C5A", textStyle: { fontSize: (0, utils_1.addUnit)(16), fontWeight: "bold" }, label: "15576856006", size: "large", onClick: () => {
                        taro_1.default.navigateTo({ url: "/pages/my/info/index" });
                    }, style: { paddingRight: (0, utils_1.addUnit)(24) } }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card" }, { children: (0, jsx_runtime_1.jsx)(cell_1.default, { border: false, icon: "https://t10.baidu.com/it/u=3105518379,1723849651&fm=58", iconSize: 44, title: "\u8FD9\u662F\u4E00\u4E2A\u5F88\u5E97\u94FA\u540D\u5B57", textStyle: { fontSize: (0, utils_1.addUnit)(16), fontWeight: "bold", marginBottom: (0, utils_1.addUnit)(4) }, label: (0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "primary", size: "small", plain: false }, { children: "\u4E3B\u5E97" })), size: "large", extra: (0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ round: true, size: "large", textColor: "#333" }, { children: "\u5207\u6362\u5E97\u94FA" })), arrow: true, onClick: () => {
                        taro_1.default.navigateTo({ url: "/pages/store/list/index" });
                    } }) }))] }));
};
exports.default = My;
//# sourceMappingURL=index.js.map