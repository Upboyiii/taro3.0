"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const common_1 = require("@/utils/common");
const button_1 = require("@/components/button");
const classnames_1 = require("classnames");
require("./index.scss");
const taro_1 = require("@tarojs/taro");
const GoodsGroup = () => {
    var _a;
    const tempGroupList = [
        {
            "id": 149517605,
            "coid": 836522,
            "store_id": 982410,
            "pid": 147310904,
            "name": "酒类",
            "type": 1,
            "created_at": 1669366024,
            "updated_at": 1669366024
        },
        {
            "id": 147485470,
            "coid": 836522,
            "store_id": 982410,
            "pid": 147310904,
            "name": "饮料",
            "type": 1,
            "created_at": 1669366018,
            "updated_at": 1669366018
        },
        {
            "id": 147441786,
            "coid": 836522,
            "store_id": 982410,
            "pid": 147310904,
            "name": "时蔬",
            "type": 1,
            "created_at": 1669365997,
            "updated_at": 1669365997
        },
        {
            "id": 147386072,
            "coid": 836522,
            "store_id": 982410,
            "pid": 147310904,
            "name": "荤菜",
            "type": 1,
            "created_at": 1669365987,
            "updated_at": 1669365987
        },
        {
            "id": 147310904,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "扫码点餐",
            "created_at": 1669362643,
            "updated_at": 1669362643,
            "has_children": 4
        },
        {
            "id": 146978331,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "啊手动阀",
            "type": 1,
            "created_at": 1668650888,
            "updated_at": 1668650888
        },
        {
            "id": 146892752,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组",
            "type": 1,
            "created_at": 1668650799,
            "updated_at": 1668650799
        },
        {
            "id": 94461903,
            "coid": 836522,
            "store_id": 982410,
            "pid": 44527008,
            "name": "111",
            "cover": "pic/202210/20/344542145953861.png",
            "type": 1,
            "created_at": 1666669322,
            "updated_at": 1666669322
        },
        {
            "id": 44527008,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组五五",
            "type": 1,
            "created_at": 1666591946,
            "updated_at": 1666591946,
            "has_children": 1
        },
        {
            "id": 44482751,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组44",
            "type": 1,
            "created_at": 1666591941,
            "updated_at": 1666591941
        },
        {
            "id": 44374846,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组33",
            "type": 1,
            "created_at": 1666591937,
            "updated_at": 1666591937
        },
        {
            "id": 44358629,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组22",
            "type": 1,
            "created_at": 1666591933,
            "updated_at": 1666591933
        },
        {
            "id": 44243692,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组11",
            "type": 1,
            "created_at": 1666591910,
            "updated_at": 1666591910
        },
        {
            "id": 44178291,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "推荐",
            "type": 1,
            "created_at": 1666430502,
            "updated_at": 1666430502
        },
        {
            "id": 44153245,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "折扣",
            "type": 1,
            "created_at": 1666430496,
            "updated_at": 1666430496
        },
        {
            "id": 44058612,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "热门🔥",
            "created_at": 1666430491,
            "updated_at": 1666430491
        },
        {
            "id": 42425683,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "鞋子",
            "created_at": 1660209802,
            "updated_at": 1660209802
        },
        {
            "id": 42366361,
            "coid": 836522,
            "store_id": 982410,
            "pid": 1562912,
            "name": "77777",
            "type": 1,
            "created_at": 1660202348,
            "updated_at": 1660202348
        },
        {
            "id": 42286740,
            "coid": 836522,
            "store_id": 982410,
            "pid": 1562912,
            "name": "66666",
            "type": 1,
            "created_at": 1660202345,
            "updated_at": 1660202345
        },
        {
            "id": 42227896,
            "coid": 836522,
            "store_id": 982410,
            "pid": 1562912,
            "name": "5555",
            "type": 1,
            "created_at": 1660202342,
            "updated_at": 1660202342
        },
        {
            "id": 42149373,
            "coid": 836522,
            "store_id": 982410,
            "pid": 1562912,
            "name": "4444",
            "type": 1,
            "created_at": 1660202339,
            "updated_at": 1660202339
        },
        {
            "id": 26347698,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组一2",
            "type": 1,
            "created_at": 1649405109,
            "updated_at": 1649405109
        },
        {
            "id": 1976061,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组二",
            "type": 1,
            "created_at": 1625473834,
            "updated_at": 1625473834
        },
        {
            "id": 1722959,
            "coid": 836522,
            "store_id": 982410,
            "pid": 1562912,
            "name": "子分组三",
            "type": 1,
            "created_at": 1625473579,
            "updated_at": 1625473579
        },
        {
            "id": 1703051,
            "coid": 836522,
            "store_id": 982410,
            "pid": 1562912,
            "name": "子分组二",
            "type": 1,
            "created_at": 1625473574,
            "updated_at": 1625473574
        },
        {
            "id": 1622988,
            "coid": 836522,
            "store_id": 982410,
            "pid": 1562912,
            "name": "子分组一",
            "created_at": 1625473569,
            "updated_at": 1625473569
        },
        {
            "id": 1562912,
            "coid": 836522,
            "store_id": 982410,
            "pid": -1,
            "name": "商品分组一",
            "created_at": 1625196266,
            "updated_at": 1625196266,
            "has_children": 7
        }
    ];
    const [groupActive, setGroupActive] = (0, react_1.useState)(null);
    // @ts-ignore
    const [groupIDs, setGroupIDs] = (0, react_1.useState)([]);
    const [groupList, setGroupList] = (0, react_1.useState)([[]]);
    const [groupSecondaryList, setGroupSecondaryList] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        if (tempGroupList.length > 0) {
            const temp = (0, common_1.list2Tree)(tempGroupList);
            setGroupList(temp);
            setGroupActive(temp[0].id);
            setGroupSecondaryList(temp[0]);
        }
    }, []);
    const itemClick = (id) => {
        if (groupIDs.indexOf(id) > -1) {
            const index = groupIDs.indexOf(id);
            setGroupIDs(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.splice(index, 1);
                return temp;
            });
        }
        else {
            setGroupIDs(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.push(id);
                return temp;
            });
        }
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "flex-page", style: { flex: 1, backgroundColor: "#f7f8f8" } }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)("goods-group"), style: { height: 500 } }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "goods-group__aside" }, { children: (0, jsx_runtime_1.jsx)(components_1.ScrollView, Object.assign({ style: { flex: 1 }, scrollWithAnimation: true, scrollY: true }, { children: groupList.map(item => {
                                return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("goods-group__aside-item", { "goods-group__aside-item--active": item.id === groupActive }), onClick: () => {
                                        setGroupActive(item.id);
                                        setGroupSecondaryList(item);
                                    } }, { children: item.name }), `group-menu-${item.id}`));
                            }) })) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("goods-group__content") }, { children: (0, jsx_runtime_1.jsxs)(components_1.ScrollView, Object.assign({ style: { flex: 1, paddingLeft: (0, utils_1.addUnit)(16), paddingRight: (0, utils_1.addUnit)(16) }, scrollWithAnimation: true, scrollY: true }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "goods-group__header" }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("goods-group__item", { "goods-group__item--active": groupIDs.indexOf(groupSecondaryList.id) > -1 }), style: { width: "50%", marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 }, onClick: () => { itemClick(groupSecondaryList.id); } }, { children: groupSecondaryList.name })) })), (groupSecondaryList === null || groupSecondaryList === void 0 ? void 0 : groupSecondaryList.children) && (groupSecondaryList === null || groupSecondaryList === void 0 ? void 0 : groupSecondaryList.children.length) > 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "goods-group__title" }, { children: "\u4E8C\u7EA7\u5206\u7EC4" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "goods-group__list" }, { children: ((_a = groupSecondaryList === null || groupSecondaryList === void 0 ? void 0 : groupSecondaryList.children) !== null && _a !== void 0 ? _a : []).map(item => {
                                                return ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "goods-group__item-wrapper" }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("goods-group__item", { "goods-group__item--active": groupIDs.indexOf(item.id) > -1 }), onClick: () => { itemClick(item.id); } }, { children: item.name })) }), `group-menu-${item.id}`));
                                            }) }))] })) : null] })) }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("safe-area-inset-bottom") }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "bottom-bar" }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ style: { width: "70%" }, type: "info", onClick: () => {
                            taro_1.default.navigateBack();
                        } }, { children: "\u786E\u5B9A" })) })) }))] })));
};
exports.default = GoodsGroup;
//# sourceMappingURL=index.js.map