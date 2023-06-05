"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const tabs = [
    {
        iconPath: './assets/tabbar/dashbord.png',
        selectedIconPath: './assets/tabbar/dashbord_current.png',
        pagePath: 'pages/index/index',
        text: '工作台'
    },
    {
        iconPath: './assets/tabbar/store.png',
        selectedIconPath: './assets/tabbar/store_current.png',
        pagePath: 'pages/store/index',
        text: '店铺'
    }
];
const pages = [
    'pages/index/index',
    'pages/store/index',
    'pages/store/list/index',
    'pages/store/list-detail/index',
    'pages/store/create/index/index',
    'pages/store/create/mode/index',
    'pages/store/create/info/index',
    'pages/category/index',
    'pages/webView/index',
    'pages/sign/login/index',
    'pages/sign/register/index',
    'pages/sign/findpass/index',
    'pages/shop/edit/index',
    'pages/shop/edit/category/index',
    'pages/shop/edit/group/index',
    'pages/shop/edit/freight/index',
    'pages/shop/edit/words/index',
    'pages/shop/edit/words/edit/index'
];
exports.default = defineAppConfig({
    pages: pages,
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#f6f8fa',
        navigationBarTitleText: '彩豚',
        navigationBarTextStyle: 'black',
        backgroundColor: "#f7f8f9",
        enablePullDownRefresh: false
    },
    tabBar: {
        color: '#333333',
        selectedColor: '#0074ff',
        borderStyle: 'white',
        backgroundColor: '#ffffff',
        list: tabs
    },
});
//# sourceMappingURL=app.config.js.map