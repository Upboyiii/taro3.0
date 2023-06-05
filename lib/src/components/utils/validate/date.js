"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDate = void 0;
const number_1 = require("./number");
function isDate(val) {
    return Object.prototype.toString.call(val) === "[object Date]" && !(0, number_1.isNaN)(val.getTime());
}
exports.isDate = isDate;
//# sourceMappingURL=date.js.map