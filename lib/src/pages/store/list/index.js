"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const button_1 = require("@/components/button");
const tag_1 = require("@/components/tag");
const classnames_1 = require("classnames");
require("./index.scss");
// 认证类型
const certTypes = { 1: "个人", 2: "企业", 3: "个体户", 4: "政府及事业单位", 5: "其他组织" };
const storeState = { 0: "店铺还未初始化", 1: "正常", 2: "打烊", 3: "停用", 4: "初始化异常", 5: "其他组织" };
const delStates = { 1: "等待删除", 2: "删除中", 3: "删除错误", 4: "已删除" };
const storeList = [
    {
        "coid": 172583586,
        "store_id": 172872502,
        "name": "这是一个很店铺名字",
        "type_class_name": [
            "餐饮",
            "商城"
        ],
        "chain": 2,
        "mode": 1,
        "store_state": 1,
        "is_duty": true,
        "logo": "https://t10.baidu.com/it/u=3105518379,1723849651&fm=58"
    },
    {
        "coid": 49376524,
        "store_id": 50695011,
        "name": "分店1",
        "logo": "https://t12.baidu.com/it/u=2944858655,3260611328&fm=58",
        "type_class_name": [
            "景区",
            "酒店"
        ],
        "chain": 2,
        "mode": 1,
        "store_state": 1,
        "is_duty": true
    },
    {
        "coid": 48832868,
        "store_id": 50214939,
        "name": "21312311",
        "type_class_name": [
            "景区",
            "酒店"
        ],
        "chain": 1,
        "mode": 1,
        "store_state": 1,
        "is_duty": true,
        "logo": "https://t12.baidu.com/it/u=3165178178,1926556480&fm=58"
    },
    {
        "coid": 48582081,
        "store_id": 49996806,
        "name": "12312231",
        "type_class_name": [
            "酒店",
            "餐饮"
        ],
        "chain": 1,
        "mode": 1,
        "store_state": 1,
        "is_duty": true,
        "logo": "https://t11.baidu.com/it/u=265704898,674087460&fm=58"
    },
    {
        "coid": 47924317,
        "store_id": 49317411,
        "name": "测试店铺LOGO",
        "logo": "https://t10.baidu.com/it/u=949383615,3755507436&fm=58",
        "type_class_name": [
            "餐饮"
        ],
        "chain": 1,
        "mode": 1,
        "store_state": 1,
        "is_duty": true
    },
    {
        "coid": 46384766,
        "store_id": 46197051,
        "name": "测试",
        "logo": "https://t10.baidu.com/it/u=3844842414,292040484&fm=58",
        "type_class_name": [
            "酒店"
        ],
        "chain": 1,
        "mode": 1,
        "store_state": 4,
        "init_msg": "单店面初始化模板未配置！",
        "is_duty": true
    },
    {
        "coid": 43581029,
        "store_id": 42887041,
        "name": "zz测试单店酒店",
        "type_class_name": [
            "景区",
            "酒店",
            "餐饮",
            "服饰"
        ],
        "chain": 1,
        "mode": 1,
        "cert_type": 1,
        "store_state": 1,
        "is_duty": true,
        "logo": "https://t10.baidu.com/it/u=2292095202,1784829557&fm=58"
    },
    {
        "coid": 43485840,
        "store_id": 42827737,
        "name": "子城宾馆",
        "logo": "https://t11.baidu.com/it/u=1683902884,1968350863&fm=58",
        "type_class_name": [
            "景区",
            "酒店"
        ],
        "chain": 1,
        "mode": 1,
        "cert_type": 1,
        "store_state": 1,
        "is_duty": true
    },
    {
        "coid": 43337125,
        "store_id": 42716253,
        "name": "测试酒店",
        "logo": "https://t11.baidu.com/it/u=1971603142,1942844928&fm=58",
        "type_class_name": [
            "景区",
            "酒店"
        ],
        "chain": 1,
        "mode": 1,
        "store_state": 1,
        "is_duty": true
    }
];
const StoreList = () => {
    const [bem] = (0, utils_1.createNamespace)("item", "store");
    const onScrollToLower = () => {
        console.log("加载更多...");
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "flex-page" }, { children: [(0, jsx_runtime_1.jsx)(components_1.ScrollView, Object.assign({ scrollWithAnimation: true, style: { flex: 1, height: 100 }, scrollY: true, onScrollToLower: onScrollToLower }, { children: storeList.map((item, index) => {
                    var _a;
                    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("card", bem({ selected: item.chain === 2 })), style: index === 0 ? { marginTop: (0, utils_1.addUnit)(12) } : {}, onClick: () => {
                            taro_1.default.navigateTo({ url: "/pages/store/list-detail/index" });
                        } }, { children: [(0, jsx_runtime_1.jsx)(components_1.Image, { className: (0, classnames_1.default)(bem("image")), 
                                // @ts-ignore
                                src: item.logo, mode: "aspectFill" }), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("content")) }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("name")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("title")) }, { children: item.name })), index === 0 && (0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ size: "small", className: (0, classnames_1.default)(bem("current")), plain: false, type: "primary" }, { children: "\u5F53\u524D\u5E97\u94FA" }))] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("auth")) }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "text-gray", style: { fontSize: (0, utils_1.addUnit)(12) } }, { children: "\u4E3B\u4F53\u4FE1\u606F\uFF1A" })), item.cert_type > 0 ? ((0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "text-success", style: { fontSize: (0, utils_1.addUnit)(12) } }, { children: certTypes[(_a = item.cert_type) !== null && _a !== void 0 ? _a : 5] }))) : ((0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "text-gray", style: { fontSize: (0, utils_1.addUnit)(12) } }, { children: "\u672A\u8BA4\u8BC1" })))] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("info")) }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("tags")) }, { children: [item.chain === 2 ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "primary", className: (0, classnames_1.default)(bem("tag")) }, { children: "\u591A\u5E97" }))) : ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "info", className: (0, classnames_1.default)(bem("tag")) }, { children: "\u5355\u5E97" }))), (item.store_state === 0 || !item.store_state) ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "error", className: (0, classnames_1.default)(bem("tag")) }, { children: "\u5E97\u94FA\u8FD8\u672A\u521D\u59CB\u5316" }))) : item.store_state === 5 && item.del ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ type: "error", className: (0, classnames_1.default)(bem("tag")) }, { children: delStates[item.del.state] }))) : ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ className: (0, classnames_1.default)(bem("tag")), type: item.store_state === 4 ? "error" : "default", disabled: item.store_state === 2 || item.store_state === 3, textColor: item.store_state === 1 ? "#333" : undefined }, { children: storeState[item.store_state] })))] })), !!item.type_class_name && item.type_class_name.length > 0 ? ((0, jsx_runtime_1.jsx)(tag_1.default, Object.assign({ className: (0, classnames_1.default)(bem("genre")), plain: false }, { children: item.type_class_name.map((gen, idx) => {
                                                    return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [idx !== 0 && (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("genre-dot")) }, { children: "\u00B7" })), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: (0, classnames_1.default)(bem("genre-item")) }, { children: gen }))] }, `gen-${index}-${idx}`));
                                                }) }))) : null] }))] }))] }), index));
                }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("safe-area-inset-bottom") }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "bottom-bar" }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ style: { width: "70%" }, type: "info", size: "medium", onClick: () => {
                            taro_1.default.navigateTo({ url: "/pages/store/create/index/index" });
                        } }, { children: "\u521B\u5EFA\u5E97\u94FA" })) })) }))] })));
};
exports.default = StoreList;
//# sourceMappingURL=index.js.map