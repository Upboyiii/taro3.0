
export const toolIcons = {
  "store_index": require("@/assets/category/store/store.png"),
  "store_address": require("@/assets/category/store/address.png"),
  "store_staff": require("@/assets/category/store/staff.png"),
  "store_payment": require("@/assets/category/store/pay.png"),
  "store_time": require("@/assets/category/store/time.png"),

  "shop_all": require("@/assets/category/shop/all.png"),
  "shop_add": require("@/assets/category/shop/add.png"),
  "shop_attr": require("@/assets/category/shop/attr.png"),
  "shop_service": require("@/assets/category/shop/service.png"),
  "shop_coupon": require("@/assets/category/shop/coupon.png"),
  "shop_groupon": require("@/assets/category/shop/groupon.png"),
  "shop_discount": require("@/assets/category/shop/discount.png"),

  "order_user": require("@/assets/category/order/order.png"),
  "order_service": require("@/assets/category/order/service.png"),
  "order_company": require("@/assets/category/order/company.png"),
  "order_aftersale": require("@/assets/category/order/aftersale.png"),

  "customer_index": require("@/assets/category/customer/customer.png"),
  "customer_prepaid": require("@/assets/category/customer/prepaid.png"),
  "customer_level": require("@/assets/category/customer/level.png"),
  "customer_memberCard": require("@/assets/category/customer/memberCard.png"),
  "customer_point": require("@/assets/category/customer/point.png"),
  "customer_gift": require("@/assets/category/customer/gift.png"),
  "customer_profile": require("@/assets/category/customer/profile.png"),
  "customer_fileCard": require("@/assets/category/customer/fileCard.png"),
  "customer_userCard": require("@/assets/category/customer/userCard.png"),

  "data_index": require("@/assets/category/data/statistics.png"),
  "data_asset": require("@/assets/category/data/asset.png"),

  "foods_stats": require("@/assets/category/foods/status.png"),
  "foods_status": require("@/assets/category/foods/foods.png"),
  "foods_table": require("@/assets/category/foods/table.png"),
  "foods_goods": require("@/assets/category/foods/goods.png"),

  "common_setting": require("@/assets/category/common/setting.png")
};

// 应用分组 对应总后台菜单 app 里面的pid
export const defaultToolGroup = [
  { name: "餐饮管理", id: 6, list: [] },
  { name: "店铺管理", id: 1, list: [] },
  { name: "商品管理", id: 2, list: [] },
  { name: "订单管理", id: 3, list: [] },
  { name: "客户管理", id: 4, list: [] },
  { name: "数据和资产", id: 5, list: [] },
  { name: "设置", id: 7, list: [] }
];

// 常用应用
export const defaultToolHot = [
  "/pages/shop/index/index",
  "/pages/category/index",
  "/pages/foods/stats/index",
  "/pages/foods/status/index",
  "/pages/order/index/index",
  "/pages/setting/common/index",
  "/pages/data/asset/index"
  // "/pages/foods/table/index",
  // "/pages/foods/goods/index",
  // "/pages/store/staff/index"
];

export default {
  toolIcons,
  defaultToolHot,
  defaultToolGroup
};
