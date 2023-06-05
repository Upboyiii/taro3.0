"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostAppid = exports.getPlatformId = exports.getPlatform = void 0;
const taro_1 = require("@tarojs/taro");
/**
 * 获取来源类型
 */
const getPlatform = () => {
    var _a, _b;
    if (process.env.TARO_ENV === "h5") {
        const ua = window.navigator.userAgent.toLowerCase();
        if ((_a = ua.match(/MicroMessenger/i)) === null || _a === void 0 ? void 0 : _a.includes("micromessenger")) {
            return { name: "wechat", id: 4 }; // 公众号、微信内置浏览器
        }
        else if ((_b = ua.match(/Alipay/i)) === null || _b === void 0 ? void 0 : _b.includes("alipay")) {
            return { name: "alipay", id: 6 }; // 支付宝
        }
    }
    return { name: process.env.TARO_ENV || "", id: (0, exports.getPlatformId)(process.env.TARO_ENV) };
};
exports.getPlatform = getPlatform;
/**
 * 获取接口对应的 平台ID
 * @param name
 */
const getPlatformId = name => {
    switch (name) {
        case "web":
            return 1; // PC
        case "h5": // H5
            return 2;
        case "rn": // APP
            return 3;
        case "wechat": // 微信公众号
            return 4;
        case "weapp": // 微信小程序
            return 5;
        case "alipay": // 支付宝
            return 6;
        case "swan": // 百度小程序
            return 7;
        case "quickapp": // 快手小程序
            return 8;
        case "qq": // QQ小程序
            return 9;
        default:
            return 0;
    }
};
exports.getPlatformId = getPlatformId;
/**
 * 获取宿主 app 对应的 appId
 */
const getHostAppid = () => {
    let ext = { id: "", appid: "", ver: "" };
    let extConfig;
    switch (process.env.TARO_ENV) {
        case "weapp":
            extConfig = taro_1.default.getExtConfigSync ? taro_1.default.getExtConfigSync() : {};
            ext.id = (extConfig === null || extConfig === void 0 ? void 0 : extConfig.id) ? extConfig === null || extConfig === void 0 ? void 0 : extConfig.id : "";
            ext.appid = (extConfig === null || extConfig === void 0 ? void 0 : extConfig.appid) ? extConfig === null || extConfig === void 0 ? void 0 : extConfig.appid : "";
            break;
        case "alipay":
            // @ts-ignore
            // eslint-disable-next-line
            extConfig = my.getExtConfigSync ? my.getExtConfigSync() : {};
            ext.id = (extConfig === null || extConfig === void 0 ? void 0 : extConfig.id) ? extConfig === null || extConfig === void 0 ? void 0 : extConfig.id : "";
            ext.appid = (extConfig === null || extConfig === void 0 ? void 0 : extConfig.appid) ? extConfig === null || extConfig === void 0 ? void 0 : extConfig.appid : "";
            if (ext.appid === "") {
                // @ts-ignore
                // eslint-disable-next-line
                const appIdRes = my.getAppIdSync();
                ext.appid = appIdRes.appId;
            }
            break;
    }
    ext.ver = process.env.Ver || "";
    return ext;
};
exports.getHostAppid = getHostAppid;
//# sourceMappingURL=app.js.map