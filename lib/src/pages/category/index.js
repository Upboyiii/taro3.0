"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const utils_1 = require("@/components/utils");
const data_1 = require("./data");
const classnames_1 = require("classnames");
require("./index.scss");
const Category = () => {
    const [edit, setEdit] = (0, react_1.useState)(false);
    const editConfirm = () => {
        if (edit) {
            console.log("保存排序");
        }
        setEdit(prevState => {
            return !prevState;
        });
    };
    const [toolList, setToolList] = (0, react_1.useState)(JSON.parse(JSON.stringify(data_1.toolData)));
    const [toolIDs, setToolIds] = (0, react_1.useState)([1, 5, 9, 12]);
    const [tools, setTools] = (0, react_1.useState)([]);
    const toolAction = (type, id) => {
        if (type === "add") {
            setToolIds(list => {
                const temp = JSON.parse(JSON.stringify(list));
                temp.push(id);
                return temp;
            });
        }
        else if (type === "remove") {
            if (toolIDs.length === 4) {
                taro_1.default.showToast({ title: "至少选择4个常用应用", icon: "none" });
                return false;
            }
            setToolIds(list => {
                const temp = JSON.parse(JSON.stringify(list));
                const index = temp.indexOf(id);
                temp.splice(index, 1);
                return temp;
            });
        }
    };
    (0, react_1.useEffect)(() => {
        setTools(() => {
            const list = JSON.parse(JSON.stringify(toolList));
            const ids = JSON.parse(JSON.stringify(toolIDs));
            let temp = [];
            ids.forEach(id => {
                list.forEach(group => {
                    group.list.forEach(item => {
                        if (item.id === id) {
                            temp.push(item);
                        }
                    });
                });
            });
            return temp;
        });
        setToolList(prev => {
            const temp = JSON.parse(JSON.stringify(prev));
            temp.map(group => {
                return group.list.map(item => {
                    item.checked = toolIDs.indexOf(item.id) > -1;
                    return item;
                });
            });
            return temp;
        });
    }, [toolIDs]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card", style: { marginTop: (0, utils_1.addUnit)(12) } }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card-header" }, { children: [(0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card-header__title" }, { children: [(0, jsx_runtime_1.jsx)(components_1.Text, { children: "\u5E38\u7528\u5E94\u7528" }), edit ? (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ style: { fontSize: 12, fontWeight: "normal", color: "#999", marginLeft: 8 } }, { children: "\u62D6\u52A8\u53EF\u8C03\u6574\u987A\u5E8F" })) : null] })), (0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card-header__extra tool-edit" }, { children: [edit ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("tool-edit__text", "tool-edit__text--cancel"), onClick: () => {
                                            setEdit(false);
                                        } }, { children: "\u53D6\u6D88" }))) : null, (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)("tool-edit__text", "tool-edit__text--primary"), onClick: editConfirm }, { children: edit ? "完成" : "编辑" }))] }))] })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "tool-group" }, { children: tools.map((item, idx) => {
                            return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "tool-item", onClick: () => {
                                    if (edit) {
                                        toolAction('remove', item.id);
                                    }
                                    else {
                                        taro_1.default.navigateTo({ url: item.url });
                                    }
                                } }, { children: [edit ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "tool-item__action" }, { children: (0, jsx_runtime_1.jsx)(components_1.Image, { className: "tool-item__action-icon", src: require("../../assets/icons/action/remove.png"), mode: "aspectFill" }) }))) : null, (0, jsx_runtime_1.jsx)(components_1.Image, { className: "tool-item__icon", src: item.icon, mode: "aspectFill" }), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "tool-item__text" }, { children: item.name }))] }), `hot-${idx}`));
                        }) }))] })), toolList.map((group, index) => {
                return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "card" }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-header" }, { children: (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "card-header__title" }, { children: group.name })) })), (0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "tool-group" }, { children: group.list.map((item, idx) => {
                                return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: "tool-item", onClick: () => {
                                        if (edit) {
                                            !item.checked && toolAction('add', item.id);
                                        }
                                        else {
                                            taro_1.default.navigateTo({ url: item.url });
                                        }
                                    } }, { children: [edit ? ((0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: "tool-item__action" }, { children: item.checked ? ((0, jsx_runtime_1.jsx)(components_1.Image, { className: "tool-item__action-icon", src: require("../../assets/icons/action/checked.png"), mode: "aspectFill" })) : ((0, jsx_runtime_1.jsx)(components_1.Image, { className: "tool-item__action-icon", src: require("../../assets/icons/action/add.png"), mode: "aspectFill" })) }))) : null, (0, jsx_runtime_1.jsx)(components_1.Image, { className: "tool-item__icon", src: item.icon, mode: "aspectFill" }), (0, jsx_runtime_1.jsx)(components_1.Text, Object.assign({ className: "tool-item__text" }, { children: item.name }))] }), `item-${index}-${idx}`));
                            }) }))] }), `list-${index}`));
            })] }));
};
exports.default = Category;
//# sourceMappingURL=index.js.map