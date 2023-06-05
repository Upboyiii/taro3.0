"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list2Tree = void 0;
/**
 * @desc 数组转树形
 */
const list2Tree = (oldArr, parentKey = "pid", key = "id", topParentVal = -1) => {
    oldArr.forEach(element => {
        if (element[parentKey] !== "" && element[parentKey] !== topParentVal) {
            oldArr.forEach(ele => {
                if (ele[key] === element[parentKey]) {
                    if (!ele.children) {
                        ele.children = [];
                    }
                    ele.children.push(element);
                }
            });
        }
    });
    oldArr = oldArr.filter(ele => !(parentKey in ele) || ele[parentKey] === "" || ele[parentKey] === topParentVal);
    return oldArr;
};
exports.list2Tree = list2Tree;
//# sourceMappingURL=common.js.map