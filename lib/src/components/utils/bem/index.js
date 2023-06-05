"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNamespace = void 0;
const bem_1 = require("./bem");
function createNamespace(name, customPrefix) {
    name = `${customPrefix || "owl"}-${name}`;
    return [(0, bem_1.createBEM)(name), name];
}
exports.createNamespace = createNamespace;
//# sourceMappingURL=index.js.map