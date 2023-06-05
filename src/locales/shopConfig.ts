export default {
  goodsState:["全部", "销售中", "待发布", "预售中", "已下架", "已售罄", "不可售", "仓库中"],
  // 商品类型
  goodsTypeList: [
    { label: "实物商品", desc: "买家下单后，卖家需要选择物流公司并安排发货卖家需要选择物流公司并安排发货", value: 1 },
    { label: "虚拟商品", desc: "无需物流", value: 2 },
    { label: "电子卡券", desc: "买家下单后获取订单的电子凭证，卖家无需发货", value: 3 },
    { label: "茶饮烘焙", desc: "需要现场加工同城配送或自提", value: 4 },
    { label: "系统商品", desc: "无需物流", value: 5, sys: true },
    { label: "酒店", desc: "无需物流", value: 6 },
    { label: "景区景点", desc: "无需物流", value: 7 },
    { label: "线下餐饮", desc: "无需物流", value: 8 }
  ],
  // 账户类型
  balanceTypeList: [
    { label: "店铺余额", value: 1 },
    { label: "储值资金", value: 2 },
    { label: "标记资金", value: 3 },
    { label: "保证金", value: 4 },
    { label: "营销资金", value: 5 },
    { label: "店铺收益", value: 6 },
    { label: "现金", value: 7 },
    { label: "广告投放金", value: 8 },
    { label: "自有支付渠道", value: 9 },
    { label: "支付减免", value: 10 }
  ],
  // 支付渠道
  payList: [
    { label: "微信支付", value: 1 },
    { label: "支付宝", value: 2 },
    { label: "银行卡", value: 3 },
    { label: "QQ支付", value: 4 },
    { label: "银联网银支付", value: 5 },
    { label: "其他渠道支付", value: 6 },
    { label: "储值资金", value: 10 },
    { label: "线下标记", value: 11 },
    { label: "余额支付", value: 12 },
    { label: "现金", value: 13 },
    { label: "员工减免", value: 14 }
  ],

  // 平台来源
  platformList: [
    { label: "商家下单", value: -1 },
    { label: "H5", value: 1 },
    { label: "网页", value: 2 },
    { label: "APP", value: 3 },
    { label: "微信公众号", value: 4 },
    { label: "微信小程序", value: 5 },
    { label: "支付宝", value: 6 },
    { label: "字节跳动", value: 7 },
    { label: "快手小程序", value: 8 },
    { label: "QQ小程序", value: 9 }
  ],
  // 快递列表
  expressList: [
    { label: "圆通", value: "YTO" },
    { label: "申通", value: "STO" },
    { label: "中通", value: "ZTO" },
    { label: "顺丰", value: "SF" },
    { label: "百世", value: "HTKY" },
    { label: "德邦", value: "DBL" },
    { label: "邮政", value: "YZ" },
    { label: "韵达", value: "YD" },
    { label: "极兔", value: "JITU" },
    { label: "京东", value: "JD" }
  ],
  // 支付类型
  payType: [
    { label: "网页", value: "wap" },
    { label: "app支付", value: "app" },
    { label: "扫码支付", value: "api_qr" },
    { label: "付款码支付", value: "bar_code" },
    { label: "小程序", value: "mini" }
  ],
  // 账单类型
  billTypeList: [
    { label: "订单入账", value: 1 },
    { label: "订单购买", value: 2 },
    { label: "订单退款", value: 3 },
    { label: "订单取消", value: 4 },
    { label: "转账", value: 5 },
    { label: "转账失败退款", value: 6 },
    { label: "退款", value: 7 },
    { label: "提现", value: 8 },
    { label: "提现失败退回", value: 9 },
    { label: "提现手续费", value: 10 },
    { label: "提现手续费退回", value: 11 },
    { label: "交易手续费", value: 12 },
    { label: "交易手续费退回", value: 13 },
    { label: "交易手续费补贴", value: 14 },
    { label: "分销入账", value: 15 },
    { label: "分销退款", value: 16 },
    { label: "分销佣金", value: 17 },
    { label: "分销平台服务费", value: 18 },
    { label: "分销商补贴", value: 19 },
    { label: "分销商补贴退款", value: 20 },
    { label: "采购", value: 21 },
    { label: "采购退款", value: 22 },
    { label: "平台服务费", value: 23 },
    { label: "云服务费", value: 24 },
    { label: "推广费", value: 25 },
    { label: "技术服务费", value: 26 },
    { label: "充值", value: 27 },
    { label: "充值手续费", value: 28 },
    { label: "扣款", value: 29 },
    { label: "余额支付", value: 30 },
    { label: "余额支付退款", value: 31 },
    { label: "推广费退款", value: 32 },
    { label: "推广费入账", value: 33 },
    { label: "推广费出账、提现", value: 34 },
    { label: "分销分销商补贴入账", value: 35 },
    { label: "分销佣金入账", value: 36 },
    { label: "分销 分销商手续费", value: 38 },
    { label: "线下清账", value: 39 },
    { label: "线下入账", value: 40 }
  ],
  //
  inTypeList: [
    { label: "出入账", value: 0 },
    { label: "入账", value: 1 },
    { label: "出账", value: 2 }
  ],
  orderRefundList: [
    { label: "退款中", value: 1 },
    { label: "退款完成", value: 2 },
    { label: "退款失败", value: 3 },
    { label: "部分失败", value: 4 }
  ]
};
