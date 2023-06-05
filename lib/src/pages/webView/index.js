"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const classnames_1 = require("classnames");
const app_1 = require("@/utils/app");
const WebViewPage = () => {
    const [url, setUrl] = (0, react_1.useState)("");
    // @ts-ignore
    const [title, setTitle] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        let router = taro_1.default.getCurrentInstance().router;
        console.log(router === null || router === void 0 ? void 0 : router.params, "router?.params");
        if (router === null || router === void 0 ? void 0 : router.params.title) {
            let atitle = decodeURIComponent(router === null || router === void 0 ? void 0 : router.params.title);
            setTitle(atitle);
            taro_1.default.setNavigationBarTitle({ title: atitle });
        }
        if (router === null || router === void 0 ? void 0 : router.params.url) {
            setUrl(router === null || router === void 0 ? void 0 : router.params.url);
        }
    }, []);
    const handleLoad = (e) => {
        console.log(e, "handleLoad");
    };
    const handleMessage = (e) => {
        console.log(e, "handleMessage");
    };
    return ((0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: (0, jsx_runtime_1.jsx)(components_1.WebView, { className: (0, classnames_1.default)({ "has-navbar": process.env.TARO_ENV === "h5" && (0, app_1.getPlatform)().name !== "wechat" }), src: url, onMessage: handleMessage, onLoad: handleLoad }) }));
};
exports.default = WebViewPage;
//# sourceMappingURL=index.js.map