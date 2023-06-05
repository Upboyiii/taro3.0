"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const components_1 = require("@tarojs/components");
const utils_1 = require("../utils");
const classnames_1 = require("classnames");
require("./index.scss");
const CircularIcon = ({ bem }) => ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: Array(3)
        .fill(null)
        .map((_, index) => ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("ring", String(index + 1))) }, index))) }));
const SpinIcon = ({ bem }) => ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: Array(12)
        .fill(null)
        .map((_, i) => ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("line", String(i + 1))), style: {
            opacity: 1 / 12 * i,
            transform: `rotate(${i * 30}deg)`
        } }, i))) }));
const BallIcon = ({ bem }) => ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: Array(3)
        .fill(null)
        .map((_, index) => ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("dot", String(index + 1))) }, index))) }));
const WellIcon = ({ bem }) => ((0, jsx_runtime_1.jsx)(components_1.View, { className: (0, classnames_1.default)(bem("well")) }));
const Icon = (bem) => ({
    spinner: (0, jsx_runtime_1.jsx)(SpinIcon, { bem: bem }),
    circular: (0, jsx_runtime_1.jsx)(CircularIcon, { bem: bem }),
    ball: (0, jsx_runtime_1.jsx)(BallIcon, { bem: bem }),
    well: (0, jsx_runtime_1.jsx)(WellIcon, { bem: bem })
});
const Loading = props => {
    const [bem] = (0, utils_1.createNamespace)("loading");
    const { className, type, vertical, color, size, children, text, textSize, textColor } = props;
    const spinnerStyle = (0, react_1.useMemo)(() => (Object.assign({ color: color }, (0, utils_1.getSizeStyle)(size))), [color, size]);
    const renderText = () => {
        if (children || text) {
            return ((0, jsx_runtime_1.jsx)("span", Object.assign({ className: (0, classnames_1.default)(bem("text", { vertical })), style: {
                    fontSize: (0, utils_1.addUnit)(textSize),
                    color: textColor !== null && textColor !== void 0 ? textColor : color
                } }, { children: children || text })));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsxs)(components_1.View, Object.assign({ className: (0, classnames_1.default)(className, bem([type, { vertical }])), style: props.style }, { children: [(0, jsx_runtime_1.jsx)(components_1.View, Object.assign({ className: (0, classnames_1.default)(bem("spinner", type)), style: spinnerStyle }, { children: // @ts-ignore
                Icon(bem)[type] })), renderText()] })));
};
Loading.defaultProps = {
    type: "circular"
};
exports.default = Loading;
//# sourceMappingURL=index.js.map