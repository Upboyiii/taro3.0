"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
require("./app.scss");
class App extends react_1.Component {
    componentDidMount() { }
    componentDidShow() { }
    componentDidHide() { }
    componentDidCatchError() { }
    // this.props.children 是将要会渲染的页面
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.StatusBar, { translucent: true, backgroundColor: "rgba(0, 0, 0, 0)", barStyle: "dark-content" }), this.props.children] });
    }
}
exports.default = App;
//# sourceMappingURL=app.rn.js.map