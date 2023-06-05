"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const field_1 = require("@/components/field");
const cell_1 = require("@/components/cell");
const button_1 = require("@/components/button");
require("./index.scss");
const WordsEdit = () => {
    const statciWordTypeList = ['文本', '数字', '邮件', '日期', '时间', '身份证', '图片', '手机号码'];
    const init = {
        id: 0,
        name: "",
        type: 1,
        is_multi_row: false,
        is_required: false,
        is_single: false //是 (只需要用户填1次) 否 (根据购买数量填写,买N张门票需要填写N个身份证)
    };
    // @ts-ignore
    const [goodsWordId, setGoodsWordId] = (0, react_1.useState)(100);
    // @ts-ignore
    const [goodsWordForm, setGoodsWordForm] = (0, react_1.useState)(init);
    const handleChange = (val, mode) => {
        setGoodsWordForm(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            temp[mode] = val;
            return temp;
        });
    };
    const saveWords = () => {
    };
    const removeWords = () => {
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card", style: { marginTop: (0, utils_1.addUnit)(12), marginBottom: (0, utils_1.addUnit)(16) } }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { title: "\u7559\u8A00\u6807\u9898", inputAlign: "right", placeholder: "\u4E0D\u8D85\u8FC75\u4E2A\u5B57", maxlength: 5, value: goodsWordForm.name, onChange: (val) => { handleChange(val, "name"); } }), (0, jsx_runtime_1.jsx)(components_1.Picker, Object.assign({ mode: "selector", range: statciWordTypeList, onChange: (e) => {
                            handleChange(+e.detail.value + 1, "type");
                        } }, { children: (0, jsx_runtime_1.jsx)(cell_1.default, { border: false, title: "\u7559\u8A00\u683C\u5F0F", content: statciWordTypeList[goodsWordForm.type - 1], arrow: true }) }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card", style: { marginBottom: (0, utils_1.addUnit)(6) } }, { children: (0, jsx_runtime_1.jsx)(cell_1.default, { border: false, title: "\u5FC5\u586B\u7559\u8A00", content: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: goodsWordForm.is_required, onChange: (e) => {
                            handleChange(e.detail.value, "is_required");
                        } }), style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-tips" }, { children: "\u82E5\u5F00\u542F\uFF0C\u4E70\u5BB6\u4E0D\u8F93\u5165\u7559\u8A00\u5219\u65E0\u6CD5\u7EE7\u7EED\u8D2D\u4E70\u5546\u54C1" })), goodsWordForm.type === 1 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card", style: { marginBottom: (0, utils_1.addUnit)(6) } }, { children: (0, jsx_runtime_1.jsx)(cell_1.default, { border: false, title: "\u652F\u6301\u591A\u884C\u7559\u8A00", content: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: goodsWordForm.is_multi_row, onChange: (e) => {
                                    handleChange(e.detail.value, "is_multi_row");
                                } }), style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-tips" }, { children: "\u82E5\u5F00\u542F\uFF0C\u7559\u8A00\u8F93\u5165\u6846\u80FD\u8F93\u5165\u591A\u884C\u5185\u5BB9" }))] })) : null, (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card", style: { marginBottom: (0, utils_1.addUnit)(6) } }, { children: (0, jsx_runtime_1.jsx)(cell_1.default, { border: false, title: "\u591A\u6B21\u586B\u5199\u7559\u8A00", content: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: goodsWordForm.is_single, onChange: (e) => {
                            handleChange(e.detail.value, "is_single");
                        } }), style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-tips" }, { children: "\u82E5\u5F00\u542F\uFF0C\u7559\u8A00\u5C06\u7531\u5546\u54C1\u8D2D\u4E70\u7684\u6570\u91CF\u51B3\u5B9A\u586B\u5199\u7684\u6B21\u6570" })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "bottom-bar" }, { children: [(0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ style: { width: "70%" }, type: "info", onClick: saveWords }, { children: "\u4FDD\u5B58" })), (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ style: { width: "70%", marginTop: (0, utils_1.addUnit)(20) }, plain: true, type: "primary", onClick: removeWords }, { children: "\u5220\u9664" }))] }))] }));
};
exports.default = WordsEdit;
//# sourceMappingURL=index.js.map