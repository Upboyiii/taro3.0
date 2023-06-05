"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@tarojs/components");
const taro_1 = require("@tarojs/taro");
const utils_1 = require("@/components/utils");
const cell_1 = require("@/components/cell");
const classnames_1 = require("classnames");
require("./index.scss");
const typeList = [
    {
        "id": 2,
        "pid": -1,
        "name": "行业类别",
        "logo": "https://t10.baidu.com/it/u=3105518379,1723849651&fm=58",
        "children": [
            {
                "id": 4,
                "pid": 2,
                "name": "景区",
                "logo": "https://t12.baidu.com/it/u=2944858655,3260611328&fm=58",
                "note": "这是景区的介绍，不是很多很多哦"
            },
            {
                "id": 5,
                "pid": 2,
                "name": "酒店",
                "logo": "https://t12.baidu.com/it/u=3165178178,1926556480&fm=58",
                "note": "酒店介绍项目 "
            },
            {
                "id": 2850317,
                "pid": 2,
                "name": "餐饮",
                "logo": "https://t11.baidu.com/it/u=265704898,674087460&fm=58"
            },
            {
                "id": 4115179,
                "pid": 2,
                "name": "商城",
                "logo": "https://t10.baidu.com/it/u=3844842414,292040484&fm=58",
                "note": "展示、出售商品"
            }
        ]
    }
];
const CreateStore = () => {
    const [bem] = (0, utils_1.createNamespace)("store", "create");
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header-title")) }, { children: "\u521B\u5EFA\u5E97\u94FA" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("header-desc")) }, { children: "3\u6B65\u6781\u901F\u5F00\u5E97" }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("title")) }, { children: "\u9009\u62E9\u4E3B\u8425\u7C7B\u76EE" })), typeList.map((group, index) => {
                if (!group.children || group.children.length === 0)
                    return null;
                return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("card", bem()) }, { children: [typeList.length > 1 ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-header card-header--border" }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-header__title" }, { children: group.name })) }))) : null, (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("list")) }, { children: group.children.map((item, idx) => {
                                var _a;
                                return ((0, jsx_runtime_1.jsx)(cell_1.default, { border: idx == 0, className: (0, classnames_1.default)(bem("item")), style: { paddingRight: (0, utils_1.addUnit)(20) }, borderStyle: { left: (0, utils_1.addUnit)(76) }, icon: item.logo, iconStyle: { width: (0, utils_1.addUnit)(48), height: (0, utils_1.addUnit)(48), borderRadius: (0, utils_1.addUnit)(8) }, title: item.name, label: (_a = item.note) !== null && _a !== void 0 ? _a : "-", size: "large", arrow: true, clickable: true, onClick: () => {
                                        taro_1.default.navigateTo({
                                            url: "/pages/store/create/mode/index?type=" + item.id
                                        });
                                    } }, `item-${index}-${idx}`));
                            }) }))] }), `group-${index}`));
            })] }));
};
exports.default = CreateStore;
//# sourceMappingURL=index.js.map