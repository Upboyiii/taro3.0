"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const field_1 = require("@/components/field");
const button_1 = require("@/components/button");
const image_picker_1 = require("@/components/image-picker");
const cell_1 = require("@/components/cell");
const popup_1 = require("@/components/popup");
const classnames_1 = require("classnames");
require("./index.scss");
const GoodsEdit = () => {
    const handleChange = (val, mode) => {
        setGoodsForm(prev => {
            let temp = JSON.parse(JSON.stringify(prev));
            temp[mode] = val;
            return temp;
        });
    };
    // @ts-ignore
    const [files, setFiles] = (0, react_1.useState)([]);
    const handleChangeImage = (val) => {
        setFiles(val);
    };
    const findName = (id, list, type = "label", find = "value") => {
        let arr = list;
        if (arr.length > 0) {
            const item = arr.find(item => {
                return id === item[find];
            });
            if (type && item)
                return item[type];
        }
        return "-";
    };
    // 弹出框
    const [popup, setPopup] = (0, react_1.useState)({
        show: false,
        title: "",
        desc: "",
        type: ""
    });
    const closePopup = () => {
        setPopup({
            show: false,
            title: "",
            desc: "",
            type: ""
        });
    };
    const tempGoodsTypeList = [
        {
            label: "实物商品",
            desc: "买家下单后，卖家需要选择物流公司并安排发货",
            value: 1
        },
        {
            label: "电子卡券",
            desc: "买家下单后获取订单的电子凭证，卖家无需发货",
            value: 3
        },
        {
            label: "茶饮烘焙",
            desc: "需要现场加工同城配送或自提",
            value: 4
        },
        {
            label: "酒店",
            desc: "无需物流",
            value: 6
        },
        {
            label: "景区景点",
            desc: "无需物流",
            value: 7
        },
        {
            label: "线下餐饮",
            desc: "无需物流",
            value: 8
        }
    ];
    // @ts-ignore
    const [goodsTypeList, setGoodsTypeList] = (0, react_1.useState)(tempGoodsTypeList);
    // 基本信息
    const staticForm = {
        type: 1,
        state: 1,
        name: "",
        title: "",
        pic: [],
        goods_data: {
            video: "",
            share: ""
        },
        category: [],
        group_ids: []
    };
    const [goodsForm, setGoodsForm] = (0, react_1.useState)(staticForm);
    // 单规格
    const staticSingle = {
        data: {
            price_dot: "",
            price_min: "",
            price_max: "",
            goods_kg: "",
            goods_no: ""
        },
        goods_price: {
            is_sell: 1,
            price: "",
            price_retail: "",
            stock_num: ""
        },
        rule_sku: {
            name: "",
            price_cost: ""
        }
    };
    // 是否多规格
    const [multiSku, setMultiSku] = (0, react_1.useState)(false);
    // @ts-ignore
    const [singleSku, setSingleSku] = (0, react_1.useState)(staticSingle);
    // 快递方式
    const [freightName, setFreightName] = (0, react_1.useState)("");
    const [freightType, setFreightType] = (0, react_1.useState)([]);
    const [freightList, setFreightList] = (0, react_1.useState)([
        {
            label: "快递发货",
            value: 1,
            type: [1],
            checked: true
        },
        {
            label: "同城配送",
            value: 2,
            type: [4, 8],
            checked: false
        },
        {
            label: "到店自提",
            value: 3,
            type: [1, 4, 8],
            checked: true
        },
        {
            label: "商家配送",
            value: 4,
            type: [1, 4, 8],
            checked: false
        }
    ]);
    (0, react_1.useEffect)(() => {
        setFreightType(() => {
            const tempList = freightList.filter(item => item.checked && item.type.indexOf(goodsForm.type) > -1);
            return tempList.map(item => item.value);
        });
        setFreightName(() => {
            let temp = "";
            freightList.forEach(item => {
                if (item.checked && item.type.indexOf(goodsForm.type) > -1) {
                    temp += item.label + "；";
                }
            });
            return temp;
        });
    }, [freightList, goodsForm.type]);
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "flex-page", style: { flex: 1, backgroundColor: "#f7f8f8" } }, { children: [(0, jsx_runtime_1.jsxs)(components_1.ScrollView, Object.assign({ style: { flex: 1, height: 100 }, scrollWithAnimation: true, scrollY: true }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card card--full", style: { marginTop: (0, utils_1.addUnit)(12), marginBottom: (0, utils_1.addUnit)(6) } }, { children: (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u5546\u54C1\u7C7B\u578B", titleWidth: 90, arrow: true, clickable: true, input: false, value: findName(goodsForm.type, tempGoodsTypeList), onClick: () => {
                                setPopup({
                                    show: true,
                                    title: "选择商品类型",
                                    desc: "",
                                    type: "goodsType"
                                });
                            } }) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-tips card-tips--full" }, { children: "\u4E0D\u540C\u7684\u5546\u54C1\u7C7B\u578B\u53EF\u7F16\u8F91\u7684\u5B57\u6BB5\u5185\u5BB9\u4E0D\u540C\uFF0C\u5546\u54C1\u7C7B\u578B\u4E00\u65E6\u4FDD\u5B58\u4E0D\u53EF\u4FEE\u6539\uFF0C\u8BF7\u9009\u62E9\u66F4\u5339\u914D\u4F60\u9700\u6C42\u7684\u4E00\u4E2A\u3002" })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card card--full" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { title: "\u5546\u54C1\u540D\u79F0", titleWidth: 90, placeholder: "100\u4E2A\u5B57\u4EE5\u5185", maxlength: 100, value: goodsForm.name, onChange: (val) => { handleChange(val, "name"); } }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u5546\u54C1\u7C7B\u76EE", titleWidth: 90, input: false, inputStyle: { color: "#ccc" }, arrow: true, clickable: true, value: "\u8BF7\u9009\u62E9", onClick: () => {
                                    taro_1.default.navigateTo({ url: "pages/shop/edit/category/index" });
                                } }), (0, jsx_runtime_1.jsx)(field_1.default, Object.assign({ title: `商品图片(${files.length}/15)`, titleRow: true, align: "start", input: false, introPosition: "bottom", intro: "\u56FE\u7247\u7684\u7B2C\u4E00\u5F20\u5C06\u4F5C\u4E3A\u5546\u54C1\u5C01\u9762\uFF0C\u6700\u591A\u4E0A\u4F2015\u5F20" }, { children: (0, jsx_runtime_1.jsx)(image_picker_1.default, { files: files, maxCount: 15, rowCount: 4, preview: true, addText: "\u56FE\u7247", onChange: handleChangeImage, style: { marginBottom: (0, utils_1.addUnit)(6) } }) })), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u5546\u54C1\u5206\u7EC4", titleWidth: 90, input: false, inputStyle: { color: "#ccc" }, arrow: true, clickable: true, value: "\u8BF7\u9009\u62E9", onClick: () => {
                                    taro_1.default.navigateTo({ url: "pages/shop/edit/group/index" });
                                } })] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card card--full" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, Object.assign({ title: "\u591A\u89C4\u683C", align: "center", inputAlign: "right", inputStyle: { lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }, input: false, style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }, { children: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: multiSku, onChange: (e) => {
                                        setMultiSku(e.detail.value);
                                    } }) })), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u4EF7\u683C(\u5143)", titleWidth: 90, type: "number", placeholder: "\u8BF7\u8F93\u5165\u4EF7\u683C", value: singleSku.goods_price.price, onChange: (val) => { handleChange(val, "price"); } }), (0, jsx_runtime_1.jsxs)(field_1.default, Object.assign({ title: "\u5EFA\u8BAE\u552E\u4EF7\u533A\u95F4", titleWidth: 90, input: false, inputStyle: { lineHeight: 1, display: "flex", flexDirection: "row", alignItems: "center" } }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { border: false, type: "number", placeholder: "\u6700\u4F4E\u552E\u4EF7", value: singleSku.data.price_min, onChange: (val) => { handleChange(val, "price_min"); }, style: { paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 } }), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ style: { paddingRight: (0, utils_1.addUnit)(16) } }, { children: "\u81F3" })), (0, jsx_runtime_1.jsx)(field_1.default, { border: false, type: "number", placeholder: "\u6700\u9AD8\u552E\u4EF7", value: singleSku.data.price_max, onChange: (val) => { handleChange(val, "price_max"); }, style: { paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 } })] })), (0, jsx_runtime_1.jsx)(field_1.default, Object.assign({ title: "\u65E0\u9650\u5E93\u5B58", align: "center", inputAlign: "right", inputStyle: { lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }, input: false, style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }, { children: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: false, onChange: (e) => {
                                        console.log(e.detail.value);
                                    } }) })), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u53EF\u552E\u5E93\u5B58", titleWidth: 90, type: "digit", placeholder: "\u8BF7\u8F93\u5165\u5E93\u5B58\uFF0C\u4E0D\u586B\u4E3A\u65E0\u9650\u5E93\u5B58", value: singleSku.goods_price.stock_num, onChange: (val) => { handleChange(val, "name"); } }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u5E93\u5B58\u6263\u51CF\u65B9\u5F0F", titleWidth: 90, input: false, arrow: true, clickable: true, value: "\u62CD\u4E0B\u51CF\u5E93\u5B58", onClick: () => {
                                    setPopup({
                                        show: true,
                                        title: "库存扣减方式",
                                        desc: "",
                                        type: "stockType"
                                    });
                                } }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u91CD\u91CF(kg)", titleWidth: 90, type: "number", placeholder: "\u8BF7\u8F93\u5165\u91CD\u91CF\uFF08\u9009\u586B\uFF09", value: singleSku.data.goods_kg, onChange: (val) => { handleChange(val, "goods_kg"); } }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u5212\u7EBF\u4EF7(\u5143)", titleWidth: 90, type: "number", placeholder: "\u8BF7\u8F93\u5165\u5212\u7EBF\u4EF7\uFF08\u9009\u586B\uFF09", value: singleSku.data.price_dot, onChange: (val) => { handleChange(val, "price_dot"); } }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u6210\u672C\u4EF7(\u5143)", titleWidth: 90, type: "number", placeholder: "\u8BF7\u8F93\u5165\u6210\u672C\u4EF7\uFF08\u9009\u586B\uFF09", value: singleSku.rule_sku.price_cost, onChange: (val) => { handleChange(val, "price_cost"); } })] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card card--full" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { title: "\u914D\u9001\u65B9\u5F0F", titleWidth: 90, input: false, inputStyle: freightName === "" ? { color: "#ccc" } : {}, arrow: true, clickable: true, value: freightName !== "" ? freightName : "请选择", onClick: () => {
                                    setPopup({
                                        show: true,
                                        title: "选择配送方式",
                                        desc: "",
                                        type: "expressType"
                                    });
                                } }), freightType.indexOf(1) > -1 || freightType.indexOf(2) > -1 || freightType.indexOf(4) > -1 ? ((0, jsx_runtime_1.jsx)(field_1.default, { title: "\u8FD0\u8D39", titleWidth: 90, input: false, arrow: true, clickable: true, value: "\u7EDF\u4E00\u8FD0\u8D390.00\u5143", onClick: () => {
                                    taro_1.default.navigateTo({ url: "pages/shop/edit/freight/index" });
                                } })) : null] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card card--full" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, Object.assign({ title: "\u4F1A\u5458\u6298\u6263", align: "center", inputAlign: "right", inputStyle: { lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }, input: false, style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }, { children: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: false, onChange: (e) => {
                                        console.log(e.detail.value);
                                    } }) })), (0, jsx_runtime_1.jsx)(field_1.default, Object.assign({ title: "\u79EF\u5206\u8D2D\u4E70", align: "center", inputAlign: "right", inputStyle: { lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }, input: false, style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }, { children: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: false, onChange: (e) => {
                                        console.log(e.detail.value);
                                    } }) })), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u6700\u5927\u53EF\u7528\u79EF\u5206", titleWidth: 90, type: "digit", placeholder: "\u8BF7\u8F93\u5165\u4EF7\u683C", value: 10, onChange: (val) => { handleChange(val, "name"); } }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u5F00\u552E\u65F6\u95F4", titleWidth: 90, input: false, arrow: true, clickable: true, value: "\u7ACB\u5373\u5F00\u552E" }), (0, jsx_runtime_1.jsx)(field_1.default, Object.assign({ title: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27", titleWidth: 120, align: "center", inputAlign: "right", inputStyle: { lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }, input: false, style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }, { children: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: false, onChange: (e) => {
                                        console.log(e.detail.value);
                                    } }) }))] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card card--full" }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { title: "\u552E\u5356\u65B9\u5F0F", titleWidth: 90, input: false, arrow: true, clickable: true, value: "\u9884\u552E" }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u9884\u552E\u65B9\u5F0F", titleWidth: 90, input: false, arrow: true, clickable: true, value: "\u5168\u6B3E\u9884\u552E" })] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card card--full", style: { marginBottom: (0, utils_1.addUnit)(6) } }, { children: [(0, jsx_runtime_1.jsx)(field_1.default, { title: "\u9650\u8D2D\u6570\u91CF", titleWidth: 90, input: false, arrow: true, clickable: true, value: "\u4E0D\u9650\u8D2D" }), (0, jsx_runtime_1.jsx)(field_1.default, Object.assign({ title: "\u8D2D\u4E70\u6743\u9650", titleWidth: 120, align: "center", inputAlign: "right", inputStyle: { lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }, input: false, style: { paddingTop: (0, utils_1.addUnit)(8), paddingBottom: (0, utils_1.addUnit)(8) } }, { children: (0, jsx_runtime_1.jsx)(components_1.Switch, { checked: false, onChange: (e) => {
                                        console.log(e.detail.value);
                                    } }) })), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u6743\u76CA\u5361", titleWidth: 90, input: false, arrow: true, clickable: true, value: "\u8D85\u7EA7\u65E0\u654C\u5B9E\u60E0\u5361\uFF1B\u65B0\u7528\u6237\u6743\u76CA\u5361" }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u4F1A\u5458\u8EAB\u4EFD", titleWidth: 90, input: false, arrow: true, clickable: true, value: "SVIP2" }), (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u7528\u6237\u6807\u7B7E", titleWidth: 90, input: false, inputStyle: { color: "#ccc" }, arrow: true, clickable: true, value: "\u672A\u9009\u62E9\uFF08\u9009\u586B\uFF09" })] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-tips card-tips--full" }, { children: "\u6253\u5F00\u8D2D\u4E70\u6743\u9650\u540E\uFF0C\u7528\u6237\u6EE1\u8DB3\u4EFB\u4E00\u6743\u76CA\u5361\u3001\u4F1A\u5458\u8EAB\u4EFD\u6216\u7528\u6237\u6807\u7B7E\u6761\u4EF6\uFF0C\u5373\u53EF\u8D2D\u4E70" })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card" }, { children: (0, jsx_runtime_1.jsx)(field_1.default, { title: "\u7559\u8A00", titleWidth: 90, input: false, inputStyle: { color: "#ccc" }, arrow: true, clickable: true, value: "\u672A\u6DFB\u52A0\uFF08\u9009\u586B\uFF09", onClick: () => {
                                taro_1.default.navigateTo({
                                    url: "pages/shop/edit/words/index"
                                });
                            } }) }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("safe-area-inset-bottom") }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "bottom-bar" }, { children: (0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ style: { width: "70%" }, type: "info", onClick: () => { } }, { children: "\u4E0B\u4E00\u6B65" })) })) })), (0, jsx_runtime_1.jsxs)(popup_1.default, Object.assign({ headerBorder: true, title: popup.title, show: popup.show, onClose: closePopup, action: popup.type === "expressType" ? ((0, jsx_runtime_1.jsx)(button_1.default, Object.assign({ type: "info", onClick: () => {
                        closePopup();
                    } }, { children: "\u786E\u5B9A" }))) : null }, { children: [popup.type === "goodsType" ? ((0, jsx_runtime_1.jsx)(components_1.RadioGroup, { children: goodsTypeList.map((item, index) => {
                            return ((0, jsx_runtime_1.jsx)(cell_1.default, { border: index !== 0, title: item.label, textStyle: { fontSize: (0, utils_1.addUnit)(16) }, label: item.desc, extra: (0, jsx_runtime_1.jsx)(components_1.Radio, { value: item.value, checked: goodsForm.type === item.value, color: "#ff3953" }), onClick: () => {
                                    setGoodsForm(prevForm => {
                                        let temp = JSON.parse(JSON.stringify(prevForm));
                                        temp.type = item.value;
                                        return temp;
                                    });
                                    closePopup();
                                } }, `goodsType-${index}`));
                        }) })) : null, popup.type === "stockType" ? ((0, jsx_runtime_1.jsxs)(components_1.RadioGroup, { children: [(0, jsx_runtime_1.jsx)(cell_1.default, { border: false, title: "\u62CD\u4E0B\u51CF\u5E93\u5B58", textStyle: { fontSize: (0, utils_1.addUnit)(16) }, label: "\u4E70\u5BB6\u63D0\u4EA4\u8BA2\u5355\u6263\u51CF\u5E93\u5B58\u6570\u91CF\uFF0C\u53EF\u80FD\u5B58\u5728\u6076\u610F\u5360\u7528\u5E93\u5B58\u98CE\u9669", extra: (0, jsx_runtime_1.jsx)(components_1.Radio, { value: "1", checked: goodsForm.type === "1", color: "#ff3953" }), onClick: () => {
                                    closePopup();
                                } }), (0, jsx_runtime_1.jsx)(cell_1.default, { title: "\u4ED8\u6B3E\u51CF\u5E93\u5B58", textStyle: { fontSize: (0, utils_1.addUnit)(16) }, label: "\u4E70\u5BB6\u652F\u4ED8\u6210\u529F\u6263\u51CF\u5E93\u5B58\u6570\u91CF\uFF0C\u53EF\u80FD\u5B58\u5728\u8D85\u5356\u98CE\u9669", extra: (0, jsx_runtime_1.jsx)(components_1.Radio, { value: "2", checked: goodsForm.type === "2", color: "#ff3953" }), onClick: () => {
                                    closePopup();
                                } })] })) : null, popup.type === "expressType" ? ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: freightList.map((item, index) => {
                            if (item.type.indexOf(goodsForm.type) === -1)
                                return null;
                            return ((0, jsx_runtime_1.jsx)(cell_1.default, { border: index !== 0, title: item.label, textStyle: { fontSize: (0, utils_1.addUnit)(16) }, style: { paddingTop: (0, utils_1.addUnit)(16), paddingBottom: (0, utils_1.addUnit)(16) }, extra: (0, jsx_runtime_1.jsx)(components_1.Checkbox, { value: String(item.value), checked: item.checked, color: "#ff3953", style: { borderRadius: 99 } }), onClick: () => {
                                    setFreightList(prevState => {
                                        let temp = JSON.parse(JSON.stringify(prevState));
                                        temp[index].checked = !item.checked;
                                        temp.map(state => {
                                            if ((item.value === 1 || item.value === 2) && state.value === 4) {
                                                state.checked = false;
                                            }
                                            if ((state.value === 1 || state.value === 2) && item.value === 4) {
                                                state.checked = false;
                                            }
                                        });
                                        return temp;
                                    });
                                } }, `freight-${index}`));
                        }) })) : null] }))] })));
};
exports.default = GoodsEdit;
//# sourceMappingURL=index.js.map