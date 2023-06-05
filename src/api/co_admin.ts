import { request } from "@/api/request";
import { requestPrefix } from "@/api/config";

export const settingApi = {
  config: {
    info(data) {
      return request({ url: requestPrefix["9004"] + "/co/config/info", method: "post", data });
    },
    menuId(menu_id){
      return request({ url: requestPrefix["9004"] + "/co/config/menuId?menu_id=" + menu_id, method: "get" });
    },
    save(data){
      return request({ url: requestPrefix["9004"] + "/co/config/save", method: "put", data });
    },
    sysInfo(data) {
      return request({ url: requestPrefix["9004"] + "/co/sys/config/get", method: "post", data });
    }
  },
  role: {
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/role/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/role/delete", method: "delete", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/role/edit", method: "put", data });
    },
    perm(data) {
      return request({ url: requestPrefix["9004"] + "/co/role/perm", method: "post", data });
    },
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/role/page", method: "post", data });
    },
    menuAll(data) {
      return request({ url: requestPrefix["9004"] + "/co/role/menuAll", method: "get", data });
    }
  },
  staff: {
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/staff/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/staff/delete", method: "delete", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/staff/edit", method: "put", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/staff/get", method: "post", data });
    },
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/staff/page", method: "post", data });
    },
    invite(data) {
      return request({ url: requestPrefix["9004"] + "/co/staff/invite", method: "put", data });
    }
  },
  address: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/address/page", method: "post", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/address/get", method: "post", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/address/edit", method: "put", data });
    },
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/address/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/address/delete", method: "delete", data });
    }
  },
  store: {
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/store/get", method: "post", data });
    },
    businessSave(data) {
      return request({ url: requestPrefix["9004"] + "/co/store/businessSave", method: "put", data });
    }
  }
};

export const shopApi = {
  goods: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/shop/goods/page", method: "post", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/shop/goods/get", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/shop/goods/info", method: "post", data });
    },
    operate(data,opt){
      return request({ url: requestPrefix["9004"] + "/shop/goods/operate", method: "put", data ,...opt });
    },
    stock(data){
      return request({ url: requestPrefix["9004"] + "/shop/goods/stock", method: "post", data  });
    },
    relation() {
      return request({ url: requestPrefix["9004"] + "/shop/goods/relation", method: "get" });
    }
  },
  group: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/shop/group/page", method: "post", data  });
    }
  },
  service:{
    page(data){
      return request({ url: requestPrefix["9004"] + "/co/service/page", method: "post", data  });
    },
    add(data){
      return request({ url: requestPrefix["9004"] + "/co/service/add", method: "put", data  });
    },
    delete(data){
      return request({ url: requestPrefix["9004"] + "/co/service/delete", method: "delete", data });
    },
    edit(data){
      return request({ url: requestPrefix["9004"] + "/co/service/edit", method: "put", data  });
    },
    info(data){
      return request({ url: requestPrefix["9004"] + "/co/service/info", method: "post", data  });
    },
    list() {
      return request({ url: `${requestPrefix[9004]}/co/service/list`, method: "get" });
    }
  },
  attrs: {
    add(data) {
      return request({ url: requestPrefix["9004"] + "/shop/attrs/add", method: "put", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/shop/attrs/edit", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/shop/attrs/delete", method: "delete", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/shop/attrs/get", method: "post", data });
    },
    page(data) {
      return request({ url: requestPrefix["9004"] + "/shop/attrs/page", method: "post", data });
    }
  },
  card: {
    page(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/list", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/info", method: "post", data });
    },
    add(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/add", method: "put", data });
    },
    state(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/state", method: "put", data });
    },
    update(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/update", method: "put", data });
    },
    useList(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/use/list", method: "post", data });
    },
    useInfo(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/use/info?id=" + data.id, method: "get" });
    },
    deliver(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/use/deliver", method: "put", data });
    },
    pwdInfo(data) {
      return request({ url: requestPrefix["9008"] + "/co/card/use/pwd/info?id=" + data.id, method: "get" });
    }
  },
  express: {
    add(data) {
      return request({ url: requestPrefix["9004"] + "/shop/express/add", method: "put", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/shop/express/edit", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/shop/express/delete", method: "delete", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/shop/express/get", method: "post", data });
    },
    page(data) {
      return request({ url: requestPrefix["9004"] + "/shop/express/page", method: "post", data });
    }
  },
  sameCity: {
    add(data) {
      return request({ url: requestPrefix["9004"] + "/shop/sameCity/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/shop/sameCity/delete", method: "delete", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/shop/sameCity/edit", method: "put", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/shop/sameCity/get", method: "post", data });
    },
    page(data) {
      return request({ url: requestPrefix["9004"] + "/shop/sameCity/page", method: "post", data });
    }
  }
};

export const customerApi = {
  customer: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/page", method: "post", data });
    },
    operate(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/operate", method: "put", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/get", method: "post", data });
    },
    query(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/query", method: "post", data });
    },
    user(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/user", method: "post", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/edit", method: "put", data });
    },
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/delete", method: "delete", data });
    }
  },
  benefitCard: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefitCard/page", method: "post", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefitCard/get", method: "post", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefitCard/edit", method: "put", data });
    },
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefitCard/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefitCard/delete", method: "delete", data });
    }
  },
  benefit: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefit/page", method: "post", data });
    },
    own(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefit/own", method: "post", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefit/get", method: "post", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefit/edit", method: "put", data });
    },
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefit/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/benefit/delete", method: "delete", data });
    }
  },
  level: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/level/page", method: "post", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/level/get", method: "post", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/level/edit", method: "put", data });
    },
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/level/add", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/level/delete", method: "delete", data });
    }
  },
  fileCard: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/page", method: "post", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/get", method: "post", data });
    },
    save(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/save", method: "put", data });
    },
    del(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/delete", method: "delete", data });
    }
  },
  userCard: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/page", method: "post", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/get", method: "post", data });
    },
    save(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/save", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/delete", method: "delete", data });
    }
  },
  cardRecord: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/record/page", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/record/info", method: "post", data });
    },
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/record/add", method: "put", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/record/edit", method: "put", data });
    },
    del(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/card/record/delete", method: "delete", data });
    }
  },
  remind: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/remind/page", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/remind/info", method: "post", data });
    },
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/remind/add", method: "put", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/remind/edit", method: "put", data });
    },
    del(data) {
      return request({ url: requestPrefix["9004"] + "/co/customer/remind/delete", method: "delete", data });
    }
  }
};

export const filesApi = {
  file:{
    page(data){
      return request({ url: requestPrefix["9004"] + "/files/file/page", method: "post", data });
    },
    delete(data,opts){
      return request({ url: requestPrefix["9004"] + "/files/file/delete", method: "delete", data ,...opts });
    }
  },
  group:{
    page(data){
      return request({ url: requestPrefix["9004"] + "/files/group/page", method: "post", data });
    },
    save(data){
      return request({ url: requestPrefix["9004"] + "/files/group/page", method: "put", data });
    }
  }
};

export const applyApi = {
  info(data) {
    return request({ url: requestPrefix[9004] + "/co/apply/info", method: "post", data });
  },
  list(data) {
    return request({ url: requestPrefix["9004"] + "/co/apply/list", method: "get", data });
  }
};

export const orderApi = {
  coOrderQuery: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/order/co/page", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/order/co/info", method: "post", data });
    },
    flowInfo(data) {
      return request({ url: requestPrefix["9004"] + "/co/order/flowInfo", method: "post", data });
    },
    operate(data) {
      return request({ url: requestPrefix["9004"] + "/order/co/operate", method: "put", data });
    },
    pay(data) {
      return request({ url: requestPrefix["9004"] + "/order/co/pay", method: "put", data });
    }
  },
  userOrder: {
    cashier(data) {
      return request({ url: requestPrefix["9004"] + "/order/cashier", method: "put", data });
    },
    page(data) {
      return request({ url: requestPrefix["9004"] + "/order/page", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/order/info", method: "post", data });
    },
    operate(data) {
      return request({ url: requestPrefix["9004"] + "/order/operate", method: "put", data });
    },
    express(data) {
      return request({ url: requestPrefix["9004"] + "/order/express", method: "post", data });
    },
    // 企业 给用户下单
    addOrder(data,opts) {
      return request({ url: requestPrefix["9004"] + "/order/order", method: "put", data ,...opts });
    },
    // 往用户订单下单
    orderAdd(data) {
      return request({ url: requestPrefix["9004"] + "/order/orderAdd", method: "put", data });
    },
    orderCorrect(data) {
      return request({ url: requestPrefix["9004"] + "/order/order/fund/operate", method: "put", data });
    },
    getOrderPay(data) {
      return request({ url: requestPrefix["9004"] + "/order/pay", method: "post", data });
    }
  },
  retailOrder: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/order/retail/page", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/order/retail/info", method: "post", data });
    },
    operate(data) {
      return request({ url: requestPrefix["9004"] + "/order/retail/operate", method: "put", data });
    }
  },
  payOrder: {
    flow(data) {
      return request({ url: `${requestPrefix[9005]}/pay/order/flow`, method: "put", data });
    },
    info(data) {
      return request({ url: `${requestPrefix[9005]}/pay/order/info`, method: "post", data });
    },
    state(data) {
      return request({ url: `${requestPrefix[9005]}/pay/order/state`, method: "post", data });
    }
  },
  saleOrder: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/order/sale/page", method: "post", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/order/sale/info", method: "post", data });
    },
    operate(data) {
      return request({ url: requestPrefix["9004"] + "/order/sale/operate", method: "put", data });
    },
    refund(data) {
      return request({ url: requestPrefix["9004"] + "/order/sale/refund", method: "post", data });
    }
  },
  serviceOrder: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/order/service/page", method: "post", data });
    },
    operate(data) {
      return request({ url: requestPrefix["9004"] + "/order/service/operate", method: "put", data });
    },
    info(data) {
      return request({ url: requestPrefix["9004"] + "/order/service/info", method: "post", data });
    }
  },
  mergeOrder: {
    info(data) {
      return request({ url: requestPrefix["9004"] + "/order/merge/info", method: "post", data });
    },
    submit(data) {
      return request({ url: requestPrefix["9004"] + "/order/merge/submit", method: "put", data });
    }
  }
};

export const assetsApi = {
  finance: {
    balance(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/balance", method: "post", data });
    },
    pay(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/pay", method: "put", data });
    },
    recharge(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/recharge", method: "put", data });
    },
    withdraw(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/withdraw", method: "put", data });
    },
    withdrawRecords(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/withdraw/records", method: "post", data });
    },
    autoWithdraw(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/withdraw/auto", method: "put", data });
    },
    billAdd(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/bill/add", method: "put", data });
    },
    billpage(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/bill/page", method: "post", data });
    },
    customerpage(data) {
      return request({ url: requestPrefix["9004"] + "/co/finance/customer/balance", method: "post", data });
    }
  },
  banks: {
    add(data) {
      return request({ url: requestPrefix["9004"] + "/co/banks/add", method: "put", data });
    },
    edit(data) {
      return request({ url: requestPrefix["9004"] + "/co/banks/edit", method: "put", data });
    },
    delete(data) {
      return request({ url: requestPrefix["9004"] + "/co/banks/delete", method: "delete", data });
    },
    get(data) {
      return request({ url: requestPrefix["9004"] + "/co/banks/get", method: "post", data });
    },
    list() {
      return request({ url: requestPrefix["9004"] + "/co/banks/list", method: "post" });
    }
  },
  fundBill: {
    page(data) {
      return request({ url: `${requestPrefix[9004]}/fund/bill/page`, method: "post", data });
    },
    info(data) {
      return request({ url: `${requestPrefix[9004]}/fund/bill/info`, method: "post", data });
    },
    stats(data) {
      return request({ url: `${requestPrefix[9004]}/fund/bill/stats`, method: "post", data });
    }
  },
  fundFlow: {
    page(data) {
      return request({ url: `${requestPrefix[9004]}/fund/flow/page`, method: "post", data });
    },
    info(data) {
      return request({ url: `${requestPrefix[9004]}/fund/flow/info`, method: "post", data });
    },
    result(data) {
      return request({ url: `${requestPrefix[9004]}/fund/flow/result/info`, method: "post", data });
    },
    refund(data) {
      return request({ url: `${requestPrefix[9004]}/fund/flow/refund/info`, method: "post", data });
    }
  },
  costore:{
    listIds(data) {
      return request({ url: `${requestPrefix[9004]}/co/store/listIds`, method: "post", data });
    }
  }
};

export const commonApi = {
  category: {
    page(data) {
      return request({ url: requestPrefix["9004"] + "/common/category/page", method: "post", data });
    }
  }
};

export const profileApi = {
  profile: {
    getScene() {
      return request({ url: requestPrefix[9004] + "/co/profile/scene", method: "get" });
    },
    page(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/page", method: "post", data });
    },
    add(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/add", method: "put", data });
    },
    edit(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/edit", method: "put", data });
    },
    info(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/info", method: "post", data });
    },
    del(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/delete", method: "delete", data });
    },
    getSysPage(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/sys/page", method: "post", data });
    }
  },
  card: {
    page(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/card/page", method: "post", data });
    },
    add(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/card/add", method: "put", data });
    },
    info(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/card/info", method: "post", data });
    },
    edit(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/card/edit", method: "put", data });
    },
    del(data) {
      return request({ url: requestPrefix[9004] + "/co/profile/card/delete", method: "delete", data });
    }
  }
};
