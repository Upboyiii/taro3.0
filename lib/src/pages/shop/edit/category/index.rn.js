"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@tarojs/components");
const react_native_1 = require("react-native");
const cell_1 = require("@/components/cell");
const classnames_1 = require("classnames");
require("./index.scss");
const GoodsCategory = () => {
    const category = [
        {
            "id": 14753033,
            "pid": -1,
            "name": "金融保险",
            "state": 1
        },
        {
            "id": 4557583,
            "pid": -1,
            "name": "酒店景区",
            "state": 1
        },
        {
            "id": 4516017,
            "pid": -1,
            "name": "食品酒水",
            "state": 1
        },
        {
            "id": 4398497,
            "pid": -1,
            "name": "运动户外",
            "state": 1
        },
        {
            "id": 4342934,
            "pid": -1,
            "name": "话费卡券",
            "state": 1
        },
        {
            "id": 4290039,
            "pid": -1,
            "name": "美妆饰品",
            "state": 1
        },
        {
            "id": 4202833,
            "pid": -1,
            "name": "生活服务",
            "state": 1
        },
        {
            "id": 4173965,
            "pid": -1,
            "name": "滋补保健",
            "state": 1
        },
        {
            "id": 4116302,
            "pid": -1,
            "name": "测试",
            "limit_type": [
                7,
                3,
                2,
                179132
            ],
            "state": 1
        },
        {
            "id": 4066264,
            "pid": -1,
            "name": "汽摩电动",
            "state": 1
        },
        {
            "id": 4044288,
            "pid": -1,
            "name": "母婴用品",
            "state": 1
        },
        {
            "id": 3939340,
            "pid": -1,
            "name": "服装鞋包",
            "state": 1
        },
        {
            "id": 3893718,
            "pid": -1,
            "name": "日用百货",
            "state": 1
        },
        {
            "id": 3817022,
            "pid": -1,
            "name": "文化玩乐",
            "state": 1
        },
        {
            "id": 3750919,
            "pid": -1,
            "name": "数码办公",
            "state": 1
        },
        {
            "id": 3692584,
            "pid": -1,
            "name": "教育培训",
            "state": 1
        },
        {
            "id": 3643856,
            "pid": -1,
            "name": "家用电器",
            "state": 1
        },
        {
            "id": 3586339,
            "pid": -1,
            "name": "家居建材",
            "state": 1
        },
        {
            "id": 3488194,
            "pid": -1,
            "name": "原料设备",
            "state": 1
        },
        {
            "id": 3459000,
            "pid": -1,
            "name": "医疗健康",
            "state": 1
        },
        {
            "id": 3157567,
            "pid": -1,
            "name": "新分类",
            "limit_type": [
                2,
                3,
                7
            ],
            "state": 1
        },
        {
            "id": 2433305,
            "pid": -1,
            "name": "其他商品",
            "limit_type": [
                2,
                3,
                7
            ],
            "state": 1
        }
    ];
    return ((0, jsx_runtime_1.jsx)(react_native_1.SafeAreaView, Object.assign({ style: { flex: 1, backgroundColor: "#f7f8f8" } }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("card", "goods-category") }, { children: [(0, jsx_runtime_1.jsx)(cell_1.default, Object.assign({ contentAlign: "left", borderStyle: { top: "auto", bottom: 0, left: 0 }, style: { paddingTop: 0, paddingBottom: 0 } }, { children: (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "goods-category-selected" }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("goods-category-selected__item", "goods-category-selected__item--active") }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, { className: "goods-category-selected__active" }), "\u9152\u5E97\u666F\u533A"] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("goods-category-selected__item") }, { children: "\u8BF7\u9009\u62E9" }))] })) })), (0, jsx_runtime_1.jsx)(components_1.ScrollView, Object.assign({ className: "goods-category-content", style: { flex: 1, height: 100 }, scrollWithAnimation: true, scrollY: true }, { children: category.map((item, index) => {
                        return ((0, jsx_runtime_1.jsx)(cell_1.default, { border: index !== 0, title: item.name, textStyle: index === 1 ? { color: "#ff2340" } : {}, extra: index === 1 ? ((0, jsx_runtime_1.jsx)(components_1.Radio, { checked: true, color: "#ff3953", 
                                // @ts-ignore
                                style: process.env.TARO_ENV === "rn" ? { transform: [{ scale: 0.75 }] } : { transform: "scale(0.75)" } })) : null }, `goods-category-${item.id}`));
                    }) }))] })) })));
};
exports.default = GoodsCategory;
//# sourceMappingURL=index.rn.js.map