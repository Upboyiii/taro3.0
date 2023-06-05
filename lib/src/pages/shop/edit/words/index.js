"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const cell_1 = require("@/components/cell");
const button_1 = require("@/components/button");
const classnames_1 = require("classnames");
require("./index.scss");
const WordsList = () => {
    const temp = [
        {
            "id": 101,
            "is_multi_row": true,
            "is_required": false,
            "is_single": false,
            "name": "文本",
            "type": 1
        },
        {
            "id": 102,
            "is_multi_row": false,
            "is_required": false,
            "is_single": false,
            "name": "身份证号",
            "type": 6
        },
        {
            "id": 103,
            "is_multi_row": false,
            "is_required": false,
            "is_single": true,
            "name": "手机号码",
            "type": 8
        },
        {
            "id": 104,
            "is_multi_row": false,
            "is_required": false,
            "is_single": true,
            "name": "图片",
            "type": 7
        },
        {
            "id": 105,
            "is_multi_row": false,
            "is_required": false,
            "is_single": false,
            "name": "日期",
            "type": 4
        },
        {
            "id": 106,
            "is_multi_row": false,
            "is_required": false,
            "is_single": false,
            "name": "时间",
            "type": 5
        }
    ];
    const statciWordTypeList = ['文本', '数字', '邮件', '日期', '时间', '身份证', '图片', '手机号码'];
    // @ts-ignore
    const init = {
        id: 0,
        name: "留言",
        type: 1,
        is_multi_row: false,
        is_required: false,
        is_single: false //是 (只需要用户填1次) 否 (根据购买数量填写,买N张门票需要填写N个身份证)
    };
    // @ts-ignore
    const [goodsWordList, setGoodsWordList] = (0, react_1.useState)(temp);
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "flex-page", style: { flex: 1 } }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ style: { flex: 1, height: "100%" } }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card", style: { marginTop: (0, utils_1.addUnit)(12) } }, { children: goodsWordList.map((item, index) => {
                        return ((0, jsx_runtime_1.jsx)(cell_1.default, { border: index !== 0, title: item.name, extra: statciWordTypeList[item.type - 1], clickable: true, arrow: true, onClick: () => {
                                taro_1.default.navigateTo({
                                    url: "pages/shop/edit/words/edit/index"
                                });
                            } }, item.id));
                    }) })) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("safe-area-inset-bottom") }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "bottom-bar" }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ style: { width: "70%" }, type: "info", onClick: () => {
                            taro_1.default.navigateTo({
                                url: "pages/shop/edit/words/edit/index"
                            });
                        } }, { children: "\u6DFB\u52A0\u7559\u8A00" })) })) }))] })));
};
exports.default = WordsList;
//# sourceMappingURL=index.js.map