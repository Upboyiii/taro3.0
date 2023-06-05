"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const tag_1 = require("@/components/tag");
const classnames_1 = require("classnames");
require("../list/index.scss");
// 认证类型
const certTypes = { 1: "个人", 2: "企业", 3: "个体户", 4: "政府及事业单位", 5: "其他组织" };
const storeState = { 0: "店铺还未初始化", 1: "正常", 2: "打烊", 3: "停用", 4: "初始化异常", 5: "其他组织" };
const delStates = { 1: "等待删除", 2: "删除中", 3: "删除错误", 4: "已删除" };
const storeList = [
    {
        "coid": 836522,
        "store_id": 982410,
        "name": "这个门店的名字可以很长很长不类",
        "logo": "https://t10.baidu.com/it/u=3105518379,1723849651&fm=58",
        "type_class_name": [
            "景区",
            "酒店"
        ],
        "chain": 2,
        "mode": 1,
        "cert_type": 1,
        "state": 1,
        "store_state": 1,
        "is_duty": true
    },
    {
        "coid": 836522,
        "store_id": 2848025,
        "name": "分店2",
        "logo": "https://t12.baidu.com/it/u=2944858655,3260611328&fm=58",
        "type_class_name": [
            "景区",
            "酒店"
        ],
        "chain": 2,
        "mode": 2,
        "state": 1,
        "store_state": 1,
        "init_msg": "创建页面信息",
        "is_duty": true
    },
    {
        "coid": 836522,
        "store_id": 46396791,
        "name": "优乐美奶茶",
        "logo": "https://t12.baidu.com/it/u=3165178178,1926556480&fm=58",
        "type_class_name": [
            "景区",
            "酒店"
        ],
        "chain": 2,
        "mode": 2,
        "state": 1,
        "store_state": 1
    }
];
const StoreList = () => {
    const [bem] = (0, utils_1.createNamespace)("item", "store");
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: storeList.map((item, index) => {
            var _a;
            return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("card", bem()), style: index === 0 ? { marginTop: (0, utils_1.addUnit)(12) } : {} }, { children: [(0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("image")), 
                        // @ts-ignore
                        src: item.logo, mode: "aspectFill" }), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("content")) }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("name")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("title")) }, { children: item.name })), index === 0 && (0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ size: "small", className: (0, classnames_1.default)(bem("current")), plain: false, type: "primary" }, { children: "\u5F53\u524D\u5E97\u94FA" }))] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("auth")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "text-gray", style: { fontSize: (0, utils_1.addUnit)(12) } }, { children: "\u4E3B\u4F53\u4FE1\u606F\uFF1A" })), item.cert_type > 0 ? ((0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "text-success", style: { fontSize: (0, utils_1.addUnit)(12) } }, { children: certTypes[(_a = item.cert_type) !== null && _a !== void 0 ? _a : 5] }))) : ((0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "text-gray", style: { fontSize: (0, utils_1.addUnit)(12) } }, { children: "\u672A\u8BA4\u8BC1" })))] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("info")) }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("tags")) }, { children: [item.mode === 1 ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "primary", className: (0, classnames_1.default)(bem("tag")) }, { children: "\u4E3B\u5E97" }))) : ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "info", className: (0, classnames_1.default)(bem("tag")) }, { children: "\u5206\u5E97" }))), (item.store_state === 0 || !item.store_state) ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "error", className: (0, classnames_1.default)(bem("tag")) }, { children: "\u5E97\u94FA\u8FD8\u672A\u521D\u59CB\u5316" }))) : item.store_state === 5 && item.del ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "error", className: (0, classnames_1.default)(bem("tag")) }, { children: delStates[item.del.state] }))) : ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ className: (0, classnames_1.default)(bem("tag")), type: item.store_state === 4 ? "error" : "default", disabled: item.store_state === 2 || item.store_state === 3, textColor: item.store_state === 1 ? "#333" : undefined }, { children: storeState[item.store_state] })))] })), !!item.type_class_name && item.type_class_name.length > 0 ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ className: (0, classnames_1.default)(bem("genre")), plain: false }, { children: item.type_class_name.map((gen, idx) => {
                                            return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [idx !== 0 && (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("genre-dot")) }, { children: "\u00B7" })), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("genre-item")) }, { children: gen }))] }, `gen-${index}-${idx}`));
                                        }) }))) : null] }))] }))] }), index));
        }) }));
};
exports.default = StoreList;
//# sourceMappingURL=index.js.map