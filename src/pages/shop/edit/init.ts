export default {
  info: {
    type: 1, // 商品类型 1实物物品 2虚拟商品 3电子卡券 4茶饮烘焙
    state: 1, // 状态 1正常 2待发布 3预售准备中 4下架 5已售罄 6仓库中
    name: "", // 商品名称 50 个字符以内
    title: "", // 商品卖点 100 个字符以内
    cover: "", // 封面图片 取第一张
    pic: [], // 商品图 JSON数组对应图片ID 最多上传15张
    is_points: 2, // 是否可使用积分购买 1使用 2不使用
    is_vip: 1, // 是否参加会员折扣 1参加 2不参加
    max_points: 0, // 最大可使用积分数
    stock_type: 2, // 库存扣减方式 1拍下减库存 2付款减库存
    // time_sale_type: 1, // 开售时间类型 1立即开售 2指定开始时间
    sale_time: -1, // 开售时间 小于当前时间立即开售 时间戳指定开始时间
    pay_limit: {
      limit_pay_min: 1, // 每单最低购买数量
      limit_pay_quota: -1, // 限购 -1不限制 1每单 2终身 3每天 4每周 5每月 6每年
      limit_pay_quota_num: 0, // 购买限制件数
      limit_specific: [] // 指定用户可购买
    },
    goods_data: {
      is_show_rest: 2, // 商品详情、购物车是否显示剩余件数 1 显示 2不显示
      share: "", // 分享描述 微信分享给好友时会显示，建议36个字以内
      sub_name: "立即购买", // 购买按钮名称 20个字以内
      video: "" // 主图视频 35个字符长度限制
    },
    goods_custom: {
      goods_card: {
        after_sale: {
          buyer_refund: true,
          buyer_refund_expire: -1
        },
        is_holidays_available: 1,
        use_notes: "",
        effect_mode: 1,
        effect_hour: "",
        validity_mode: -1,
        validity_day: ""
      },
      goods_cake: {
        stock_up_list: {},
        stock_up_time: "",
        attrs_ids: []
      },
      goods_hotel: {
        after_sale: {
          buyer_refund: true,
          buyer_free: 64800,
          buyer_cost: ""
        },
        confirm_time: "",
        attrs_ids: []
      },
      goods_real: {
        after_sale: {
          buyer_exchange: true, // 支持买家申请换货
          buyer_refund: true, // 支持买家申请退款
          buyer_seven_days: 7, // 无理由退货
          buyer_speed_exchange: false // 极速退款
        },
        pre_percentage: "", // 预售定金比例
        pre_sale: 1, // 预售方式 1 全款预售 2 定金预售
        sale_mode: 1, // 售卖方式 1 现货 2 预售
        delivery: 1, // 1 预售发货时间 2付款成功多少天后发货
        delivery_day: "", // 预售发货时间 付款成功多少天后发货
        deposit_start: "", // 定金支付开始时间
        deposit_end: "", // 定金支付结束时间
        surplus_start: "", // 尾款支付开始时间
        surplus_end: "" // 尾款支付结束时间
      }
    },
    goods_rule_sku: [],
    goods_freight: [],
    group_ids: [], // 所属分组
    goods_word: [], // 用户留言数组 购买商品时让买家输入留言，最多可设置 10 条留言
    module: [] // 商品使用的组件数据
  },
  freight: {
    type: [], // 配送方式 1 快递发货 2 同城配送 3 到店自提
    price: "", // 运费价格 统一价格 -1 为调用运费模板
    tpl_id: null, // 运费模板ID
    temp_price_type: 1 // 1统一价格2条用运费模板
  },
  goods_word: {
    id: 0,
    name: "留言", //  用户留言字段名称
    type: 1, // 用户留言字段对应的值 1文本 2数字 3邮件 4日期 5时间 6身份证 7图片 8手机号
    is_multi_row: false, //  是否多行 文本模式存在
    is_required: false, // 是否必填
    is_single: false // 是 (只需要用户填1次) 否 (根据购买数量填写,买N张门票需要填写N个身份证)
  },
  pay_limit: {
    limit_num_check: false, // 是否限制每人可购买数量
    limit_type: 1, // 1每单 2终身 6每天、每周、每月、每年
    limit_select: 3, // 3每天 4每周 5每月 6每年
    limit_per: null,
    limit_life: null,
    limit_day: null,
    limit_user_check: false, // 只允许特定用户购买
    level: {
      bind_ids: [],
      bind_type: 1
    },
    member_card: {
      bind_ids: [],
      bind_type: 2
    },
    user_tag: {
      bind_ids: [],
      bind_type: 3
    }
  },
  goods_card: {
    after_sale: {
      buyer_refund: true, // 支持买家申请退款
      buyer_refund_expire: -1, // 未核销卡券过期多久前可退款 -1 未核销均支持退款 单位小时
      buyer_refund_day: 0,
      buyer_refund_hour: 0
    },
    is_holidays_available: 1, // 节假日是否可用 1是 2不是
    stock_id: null, // 关联库存ID或卡券ID
    stock_stock: null, // 库存
    stock_coupon: null, // 优惠券
    stock_type: -1, // 关联卡券类型 -1 不绑定 1 优惠券 2 卡券库
    use_notes: "", // 使用说明
    effect_mode: 1, // 卡券生效模式 1立即生效 2次日生效 3多少小时后生效
    validity_mode: -1, // 卡券有效模式 (-1长期有效 1指定天数 2指定时间段)
    validity_day: null, // 卡券有效时长 (生效类型 如：5 指5天内有效)
    effect_hour: null, // 多少小时后生效 指定小时
    time_validity_start_time: "",
    time_validity_end_time: ""
  },
  goods_real: {
    after_sale: {
      buyer_exchange: true, // 支持买家申请换货
      buyer_refund: true, // 支持买家申请退款
      buyer_seven_days: 7, // 无理由退货
      buyer_speed_exchange: true // 极速退款
    },
    goods_freight: [], // 配送规则
    pre_percentage: null, // 预售定金比例
    pre_sale: 1, // 预售方式 1 全款预售 2 定金预售
    sale_mode: 1, // 售卖方式 1 现货 2 预售
    delivery: 1, // 1 预售发货时间 2付款成功多少天后发货
    delivery_day: null, // 预售发货时间 付款成功多少天后发货
    time_delivery_time: "", // 预售发货时间
    time_deposit_start: "", // 定金支付开始时间
    time_deposit_end: "", // 定金支付结束时间
    time_surplus_start: "", // 尾款支付开始时间
    time_surplus_end: "" // 尾款支付结束时间
  },
  goods_cake: {
    attrs_ids: [],
    stock_up_time_check: false,
    stock_up_time_radio: 1,
    stock_up_time_day: 0,
    stock_up_time_hour: 0,
    stock_up_time_min: 0,
    stock_up_time: 0, // 统一备货时间 单位分钟 -1 启用不同规格单独设置备货时间
    stock_up_list: {} // 单独备货时间 map[SKUID]时间 单位分钟
  },
  goods_rule: {
    name: "", // 规格名
    goods_rule_sku: {
      sku_id: 0,
      goods_auto: {
        code: "", // 发货编码
        type: "" // 发货种类
      },
      goods_kg: "", // 重量（kg）
      goods_no: "", // 商品编码 50 个字符以内
      goods_price_stock: {
        price: "", // 商品价格 以分为单位
        stock_num: "" // 库存数量
      },
      price_cost: "", // 成本价 以分为单位
      price_dot: "", // 划线价 以分为单位
      price_max: "", // 建议最高价格 （总店及供货商设置）
      price_min: "" // 建议最低价格 （总店及供货商设置，设置后分店或分销只可在本值内设置价格）
    }
  },
  goods_sku: {
    cover: false, // 第二级是否展示图片
    display: false, // 规格图片是否显示在详情页
    sort_show: false, // 排序
    sort_list: [], // 排序列表
    group_list: [],
    temp_group: [],
    name_list: [],
    name_temp: [],
    value_list: {},
    value_temp: {}
  },
  table_sku: []
};
