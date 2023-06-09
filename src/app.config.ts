
// @ts-ignore
const tabs = [
  {
    iconPath: "./assets/tabbar/dashbord.png",
    selectedIconPath: "./assets/tabbar/dashbord_current.png",
    pagePath: "pages/index/index",
    text: "工作台"
  },
  {
    iconPath: "./assets/tabbar/store.png",
    selectedIconPath: "./assets/tabbar/store_current.png",
    pagePath: "pages/store/index",
    text: "店铺"
  }
];

export const pages = [
  "pages/index/index",
  "pages/amap/index",
  "pages/store/index",
  "pages/store/list/index",
  "pages/store/list-detail/index",
  "pages/store/create/index/index",
  "pages/store/create/mode/index",
  "pages/store/create/info/index",
  "pages/store/staff/index",
  "pages/store/staff/edit/index",
  "pages/store/address/index",
  "pages/store/address/edit/index",
  "pages/store/payment/index",
  "pages/store/time/index",
  "pages/category/index",
  "pages/webView/index",
  "pages/sign/login/index",
  "pages/sign/register/index",
  "pages/sign/findpass/index",
  "pages/shop/index/index",
  "pages/shop/index/editSku/index",
  "pages/shop/edit/index",
  "pages/shop/edit/category/index",
  "pages/shop/edit/freight/index",
  "pages/shop/edit/words/index",
  "pages/shop/edit/words/edit/index",
  "pages/shop/edit/attrs/index",
  "pages/shop/edit/sale-time/index",
  "pages/shop/edit/pre-sale/index",
  "pages/shop/edit/delivery/index",
  "pages/shop/attr/index",
  "pages/shop/attr/edit/index",
  "pages/shop/service/index",
  "pages/shop/service/edit/index",
  "pages/shop/service/info/index",
  "pages/shop/service/info/edit/index",
  "pages/shop/service/rule/index",
  "pages/shop/service/rule/edit/index",
  "pages/shop/service/time/index",
  "pages/shop/coupon/index",
  "pages/shop/coupon/edit/index",
  "pages/shop/groupon/index",
  "pages/shop/groupon/edit/index",
  "pages/shop/discount/index",
  "pages/shop/discount/edit/index",
  "pages/shop/discount/edit/goods/index",
  "pages/shop/material/index",
  // "pages/customer/index/index",
  // "pages/customer/index/edit/index",
  // "pages/customer/index/batch/index",
  // "pages/customer/memberCard/index",
  // "pages/customer/memberCard/detail/index",
  // "pages/customer/memberCard/edit/index",
  // "pages/customer/level/index",
  // "pages/customer/level/detail/index",
  // "pages/customer/level/edit/index",
  // "pages/customer/point/index",
  // "pages/customer/point/common/index",
  // "pages/customer/point/rule/index",
  // "pages/customer/prepay/index",
  // "pages/customer/prepay/edit/index",
  // "pages/customer/prepay/recharge/index",
  // "pages/customer/prepay/records/index",
  // "pages/customer/profile/index",
  // "pages/customer/profile/edit/index",
  // "pages/customer/fileCard/index",
  // "pages/customer/fileCard/edit/index",
  // "pages/customer/fileCard/word/index",
  // "pages/customer/fileCard/sms/index",
  // "pages/customer/userCard/index",
  // "pages/customer/userCard/edit/index",
  // "pages/customer/userCard/remind/index",
  // "pages/customer/userCard/record/index",
  // "pages/customer/gift/index",
  // "pages/customer/gift/edit/index",
  "pages/my/info/index",
  "pages/my/password/index",
  "pages/my/setting/index",
  "pages/foods/stats/index",
  "pages/foods/status/index",
  "pages/foods/table/index",
  "pages/foods/table/edit/index",
  "pages/foods/group/index",
  "pages/foods/group/edit/index",
  "pages/foods/goods/index",
  "pages/foods/goods/edit/index",
  "pages/foods/order/index",
  "pages/foods/desk/index",
  "pages/foods/desk/settle/index",
  // "pages/data/asset/index",
  // "pages/data/asset/balance/index",
  // "pages/data/asset/recharge/index",
  // "pages/data/asset/recharge/records/index",
  // "pages/data/asset/withdraw/index",
  // "pages/data/asset/withdraw/records/index",
  // "pages/data/asset/tally/index",
  // "pages/data/asset/tally/booking/index",
  // "pages/data/asset/tally/records/index",
  // "pages/data/asset/prepay/index",
  // "pages/data/asset/stats/index",
  // "pages/data/asset/bill/index",
  // "pages/data/asset/flow/index",
  // "pages/data/index/index",
  // "pages/data/hour/index",
  // "pages/data/deal/index",
  // "pages/data/goods/index",
  // "pages/data/flow/index",
  // "pages/data/platform/index",
  // "pages/data/revenue/index",
  // "pages/data/profit/index",
  "pages/order/index/index",
  "pages/order/index/detail/index",
  "pages/order/index/express/index",
  "pages/order/index/operate/index",
  "pages/order/filter/index",
  "pages/order/company/index",
  "pages/order/company/detail/index",
  "pages/order/service/index",
  "pages/order/service/detail/index",
  "pages/order/aftersale/index",
  "pages/order/aftersale/detail/index",
  "pages/order/aftersale/operate/index",
  "pages/statistic/index",
  "pages/com/pay/index",
  "pages/com/goods-select/index",
  "pages/com/goods-group/index",
  "pages/com/store-select/index",
  "pages/com/member-card-select/index",
  "pages/com/level-select/index",
  "pages/com/benefit-select/index",
  "pages/com/gift-select/index",
  "pages/com/coupon-select/index",
  "pages/com/search-customer/index",
  "pages/com/profile-select/index",
  "pages/com/profile-card-select/index",
  "pages/setting/common/index"
];

const subPackages = [
  {
    root: "pageSub/data",
    pages: [
      "pages/asset/index",
      "pages/asset/balance/index",
      "pages/asset/recharge/index",
      "pages/asset/recharge/records/index",
      "pages/asset/withdraw/index",
      "pages/asset/withdraw/records/index",
      "pages/asset/tally/index",
      "pages/asset/tally/booking/index",
      "pages/asset/tally/records/index",
      "pages/asset/prepay/index",
      "pages/asset/stats/index",
      "pages/asset/bill/index",
      "pages/asset/flow/index",
      "pages/index/index",
      "pages/hour/index",
      "pages/deal/index",
      "pages/goods/index",
      "pages/flow/index",
      "pages/platform/index",
      "pages/revenue/index",
      "pages/profit/index",
    ]
  },
  {
    root: "pageSub/customer",
    pages: [
      "pages/index/index",
      "pages/index/edit/index",
      "pages/index/batch/index",
      "pages/memberCard/index",
      "pages/memberCard/detail/index",
      "pages/memberCard/edit/index",
      "pages/level/index",
      "pages/level/detail/index",
      "pages/level/edit/index",
      "pages/point/index",
      "pages/point/common/index",
      "pages/point/rule/index",
      "pages/prepay/index",
      "pages/prepay/edit/index",
      "pages/prepay/recharge/index",
      "pages/prepay/records/index",
      "pages/profile/index",
      "pages/profile/edit/index",
      "pages/fileCard/index",
      "pages/fileCard/edit/index",
      "pages/fileCard/word/index",
      "pages/fileCard/sms/index",
      "pages/userCard/index",
      "pages/userCard/edit/index",
      "pages/userCard/remind/index",
      "pages/userCard/record/index",
      "pages/gift/index",
      "pages/gift/edit/index",
    ]
  }
]

export default defineAppConfig({
  pages: pages,
  subPackages,
  requiredPrivateInfos: [
    "getLocation",
    "onLocationChange",
    "startLocationUpdateBackground",
    "chooseLocation"
  ],
  permission: {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的"
    }
  },
  sitemapLocation: "sitemap.json",
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#f6f8fa",
    navigationBarTitleText: "彩豚",
    navigationBarTextStyle: "black",
    backgroundColor: "#f7f8f9",
    enablePullDownRefresh: false
  },
  tabBar: {
    color: "#333333",
    selectedColor: "#0074ff",
    borderStyle: "white",
    backgroundColor: "#ffffff",
    list: tabs
  },
  //分包后，实际我们没进入详情页时，对应的代码包是没有加载的，
  // 这个时候用户首次从主页跳到详情页，则会出现加载等待界面，
  // 也是体验不够友
  // 好，实际上我们可以利用微信小程序提供的分包预加载配置功能
  // preloadRule: {
  //   'pages/index/index': {
  //     network: 'all',
  //     packages: ['pageSub']
  //   },
  // },
});
