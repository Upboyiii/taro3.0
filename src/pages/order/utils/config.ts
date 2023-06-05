import shopConfig from "@/locales/shopConfig";

export const findLabel = (value, list:any[] = []) => {
  if (list.length > 0) {
    const item:any = list.find((item:any) => {
      return value === item.value;
    });
    if (item) return item.label;
  }
  return "-";
};

export const findState = (state, row:any = {}) => {
  let stateText = "-";
  if(!state || !row) return "-";
  if (state === 2) {
    stateText = row?.refund_fee > 0 ? "退款成功" : "已关闭";
  }else if (state === 3) {
    stateText = "支付完成";
  }else if (state === 5) {
    stateText = "超卖订单，等待处理";
  }else if (state === 6) {
    stateText = "补贴支付失败";
  }else if (state === 7 || state === 8) {
    if(row?.deliver_state && !row?.refund_fee){
      if(row?.deliver_state === -1){
        stateText = "取消发货";
      }else if(row?.deliver_state === 1){
        stateText = "发货中";
      }else if(row?.deliver_state === 2){
        stateText = "已发货";
      }else if(row?.deliver_state === -3){
        stateText = "发货失败";
      }
    }else if(row?.refund_fee > 0){
      stateText = "退款成功";
    }else if(state === 7){
      stateText = "待发货";
    }else if(state === 8){
      stateText = "已发货";
    }
  }else if (state === 10) {
    stateText = row?.refund_fee > 0 ? "退款成功" : "完成";
  }else{
    stateText = row?.refund_fee > 0 ? "退款成功" : findLabel(state, config.userOrder.stateList);
  }
  return stateText;
};

export const config =  {
  goodsTypeList: shopConfig.goodsTypeList,
  expressList: shopConfig.expressList,
  platformList: [
    { label: "全部平台", value: 0 },
    ...shopConfig.platformList
  ],
  payList: [
    { label: "全部支付", value: 0 },
    ...shopConfig.payList
  ],
  payType: [
    { label: "全部支付", value: 0 },
    ...shopConfig.payType
  ],
  orderRefundList: [
    { label: "全部退款", value: 0 },
    ...shopConfig.orderRefundList
  ],
  userOrder: {
    filterInit: {
      customer_id: "",
      order_id: "",
      platform: 0,
      pay_channel: 0,
      start_at_time: "",
      end_at_time: "",
      type: 0,
      state: 0
      // comment: 0,
      // sales_state: 0
    },
    typeList: [
      { label: "全部", value: 0 },
      { label: "商品订单", value: 1 },
      { label: "储备金充值", value: 2 },
      { label: "扫码收款", value: 3 }
    ],
    salesList: [
      { label: "全部", value: 0 },
      { label: "售后中", value: 1 },
      { label: "退款中", value: 2 },
      { label: "售后完成", value: 3 }
    ],
    stateList: [
      // { label: "全部", value: 0 },
      // { label: "待付款", value: 1 },
      // { label: "已关闭", value: 2 },
      // { label: "支付成功", value: 3 },
      // { label: "预支付完成", value: 4 },
      // { label: "待发货", value: 5 },
      // { label: "已发货", value: 6 },
      // { label: "已完成", value: 7 },
      // { label: "售后中", value: 10 },
      // { label: "售后完成", value: 11 }
      { label: "全部", value: 0 },
      { label: "待付款", value: 1 },
      { label: "已关闭", value: 2 },
      { label: "支付成功", value: 3 },
      { label: "待发货", value: 7 },
      { label: "已发货", value: 8 },
      { label: "已收货", value: 9 },
      { label: "待结算", value: 10 },
      { label: "已完成", value: 11 },
      { label: "售后中", value: 20 },
      { label: "售后完成", value: 21 },
      { label: "预支付完成", value: 4 },
      { label: "超卖", value: 5 },
      { label: "补贴支付失败", value: 6 },
      { label: "结算完成", value: 22 },
      { label: "分销收款完成", value: 23 }
    ],
    discountType: [
      { label: "商品折扣", value: 1 },
      { label: "会员权益卡", value: 2 },
      { label: "应用活动", value: 3 },
      { label: "积分使用", value: 4 },
      { label: "企业优惠", value: 5 }
    ]
  },
  companyOrder: {
    filterInit: {
      platform: 0,
      pay_channel: 0,
      start_at_time: "",
      end_at_time: "",
      type: 0,
      state: 0
    },
    typeList: [
      { label: "全部", value: 0 },
      { label: "充值", value: 1 },
      { label: "VIP", value: 2 },
      { label: "模板市场", value: 3 },
      { label: "餐饮订单", value: 5 }
    ],
    stateList: [
      { label: "全部", value: 0 },
      { label: "待付款", value: 1 },
      { label: "已关闭", value: 2 },
      { label: "支付成功", value: 3 },
      { label: "预支付完成", value: 4 },
      { label: "待发货", value: 7 },
      { label: "已发货", value: 8 },
      { label: "已收货", value: 9 },
      { label: "待结算", value: 10 },
      { label: "已完成", value: 11 },
      { label: "售后中", value: 20 },
      { label: "售后完成", value: 21 },
      { label: "结算完成", value: 22 },
      { label: "超卖", value: 5 },
      { label: "补贴支付失败", value: 6 },
      { label: "分销收款完成", value: 23 }
    ]
  },
  serviceOrder: {
    filterInit: {
      subject: "",
      platform: 0,
      start_at_time: "",
      end_at_time: "",
      state: []
    },
    stateList: [
      { label: "全部", value: 0 },
      { label: "待付款", value: 1 },
      { label: "已取消", value: 2 },
      { label: "待受理", value: 3 },
      { label: "处理中", value: 4 },
      { label: "处理完成", value: 5 },
      { label: "处理失败", value: 6 }
    ]
  },
  afterSale: {
    filterInit: {
      customer_id: "",
      order_id: "",
      phone: "",
      type: 0
    },
    stateList: [
      { label: "全部", value: 0 },
      { label: "等待", value: 1 },
      { label: "商户拒绝", value: 2 },
      { label: "申请介入", value: 3 },
      { label: "客服介入", value: 4 },
      { label: "等待发货", value: 5 },
      { label: "已填发货信息", value: 6 },
      { label: "售后执行中", value: 7 },
      { label: "售后关闭", value: 8 },
      { label: "售后完成", value: 9 },
      { label: "售后失败", value: 10 }
    ],
    typeList: [
      { label: "全部", value: 0 },
      { label: "未收货退款", value: 1 },
      { label: "退货退款", value: 2 },
      { label: "换货", value: 3 },
      { label: "维修", value: 4 },
      { label: "补发商品", value: 5 }
    ],
    orderStateList: [
      { label: "待审核", value: 1 },
      { label: "受理中", value: 2 },
      { label: "自动同意", value: 3 },
      { label: "商家同意", value: 4 },
      { label: "商家拒绝", value: 5 }
    ]
  }
};

export default {
  config,
  findLabel,
  findState
};
