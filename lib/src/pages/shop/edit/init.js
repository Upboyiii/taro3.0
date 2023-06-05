"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    info: {
        type: 1,
        state: 1,
        name: "",
        title: "",
        cover: "",
        pic: [],
        is_points: 2,
        is_vip: 1,
        max_points: 0,
        stock_type: 2,
        // time_sale_type: 1, // 开售时间类型 1立即开售 2指定开始时间
        sale_time: -1,
        pay_limit: {
            limit_pay_min: 1,
            limit_pay_quota: -1,
            limit_pay_quota_num: 0,
            limit_specific: [] // 指定用户可购买
        },
        goods_data: {
            is_show_rest: 2,
            share: "",
            sub_name: "立即购买",
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
                    buyer_exchange: true,
                    buyer_refund: true,
                    buyer_seven_days: 7,
                    buyer_speed_exchange: false // 极速退款
                },
                pre_percentage: "",
                pre_sale: 1,
                sale_mode: 1,
                delivery: 1,
                delivery_day: "",
                deposit_start: "",
                deposit_end: "",
                surplus_start: "",
                surplus_end: "" // 尾款支付结束时间
            }
        },
        goods_rule_sku: [],
        goods_freight: [],
        group_ids: [],
        goods_word: [],
        module: [] // 商品使用的组件数据
    },
    freight: {
        type: [],
        price: "",
        tpl_id: null,
        temp_price_type: 1 // 1统一价格2条用运费模板
    },
    goods_word: {
        id: 0,
        name: "留言",
        type: 1,
        is_multi_row: false,
        is_required: false,
        is_single: false //是 (只需要用户填1次) 否 (根据购买数量填写,买N张门票需要填写N个身份证)
    },
    pay_limit: {
        limit_num_check: false,
        limit_type: 1,
        limit_select: 3,
        limit_per: null,
        limit_life: null,
        limit_day: null,
        limit_user_check: false,
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
            buyer_refund: true,
            buyer_refund_expire: -1,
            buyer_refund_day: 0,
            buyer_refund_hour: 0
        },
        is_holidays_available: 1,
        stock_id: null,
        stock_stock: null,
        stock_coupon: null,
        stock_type: -1,
        use_notes: "",
        effect_mode: 1,
        validity_mode: -1,
        validity_day: null,
        effect_hour: null,
        time_validity_start_time: "",
        time_validity_end_time: ""
    },
    goods_real: {
        after_sale: {
            buyer_exchange: true,
            buyer_refund: true,
            buyer_seven_days: 7,
            buyer_speed_exchange: true // 极速退款
        },
        goods_freight: [],
        pre_percentage: null,
        pre_sale: 1,
        sale_mode: 1,
        delivery: 1,
        delivery_day: null,
        time_delivery_time: "",
        time_deposit_start: "",
        time_deposit_end: "",
        time_surplus_start: "",
        time_surplus_end: "" // 尾款支付结束时间
    },
    goods_cake: {
        attrs_ids: [],
        stock_up_time_check: false,
        stock_up_time_radio: 1,
        stock_up_time_day: 0,
        stock_up_time_hour: 0,
        stock_up_time_min: 0,
        stock_up_time: 0,
        stock_up_list: {} // 单独备货时间 map[SKUID]时间 单位分钟
    },
    goods_rule: {
        name: "",
        goods_rule_sku: {
            sku_id: 0,
            goods_auto: {
                code: "",
                type: "" // 发货种类
            },
            goods_kg: "",
            goods_no: "",
            goods_price_stock: {
                price: "",
                stock_num: "" // 库存数量
            },
            price_cost: "",
            price_dot: "",
            price_max: "",
            price_min: "" // 建议最低价格 （总店及供货商设置，设置后分店或分销只可在本值内设置价格）
        }
    },
    goods_sku: {
        cover: false,
        display: false,
        sort_show: false,
        sort_list: [],
        group_list: [],
        temp_group: [],
        name_list: [],
        name_temp: [],
        value_list: {},
        value_temp: {}
    },
    table_sku: []
};
//# sourceMappingURL=init.js.map