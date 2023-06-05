import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { shopApi } from "@/api/co_admin";
import { getMainStore } from "@/utils/app";
import { formatPrice, secToDate, timeToSecond, secondToTime } from "@/utils/common";
import shopConfig from "@/locales/shopConfig";
import Field from "@/components/field";
import Button from "@/components/button";
import ImagePicker from "@/components/image-picker";
import Radio from "@/components/radio";
import Checkbox from "@/components/checkbox";
import Popup from "@/components/popup";
import Cell from "@/components/cell";
import Switch from "@/components/switch";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const GoodsEdit: FC = () => {
  const mainStore = getMainStore();

  const _id = getCurrentInstance().router?.params?.id;
  const [loading, setLoading] = useState(false);
  const getGoodsInfo = (id) => {
    setLoading(true);
    shopApi.goods.get({ id })
      .then(res => {
        if (!!res && res.code === 0) {
          const _data = res?.data;
          const _basic = Object.assign({}, initForm, _data);

          // 商品规格
          let _multi = false;
          if (_basic.goods_rule_sku && _basic.goods_rule_sku.length > 0) {
            const _multi = _data.goods_rule_sku.length > 1;
            const _type = _multi ? "multi" : "single";
            getStock(_data.id, _data.goods_rule_sku, _type);
          }
          setMultiSku(_multi);

          // 开售时间
          if(_basic.sale_time){
            _basic.time_sale_time = secToDate(_basic.sale_time);
          }
          // 限购
          if(_basic?.pay_limit?.limit_specific && _basic?.pay_limit?.limit_specific.length > 0){
            _basic.pay_limit.limit_user_check = true;
            let _levelList:any = [];
            let _mcardList:any = [];
            _basic?.pay_limit?.limit_specific.forEach(item=>{
              if(item.bind_type === 1) _levelList = item.bind_ids;
              if(item.bind_type === 2) _mcardList = item.bind_ids;
            });
            setLevelList(_levelList);
            setMcardList(_mcardList);
          }

          // 物流信息
          if(_basic.goods_freight && _basic.goods_freight.length > 0){
            const _types = _basic.goods_freight.map(item=>{
              if(item.type === 1 || item.type === 4){
                setFreightForm({
                  price: item.price === -1 ? -1 : !!item.price ? formatPrice(item.price) : "",
                  tpl_id: !!item.tpl_id ? item.tpl_id : 0
                });
              }
              return item.type;
            });
            setFreightList(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              temp.map(item=>{
                item.checked = _types.indexOf(item.value) > -1;
                return item;
              });
              return temp;
            });
          }

          // 实物商品
          if(_data.type === 1){
            let _goodsReal = Object.assign({}, goodsRealInit, _data.goods_custom.goods_real);
            if(_goodsReal?.delivery_day){
              _goodsReal.delivery = 1;
            }
            if(_goodsReal?.delivery_time){
              _goodsReal.delivery = 2;
              _goodsReal.time_delivery_time = secToDate(_goodsReal.delivery_time);
            }
            if(_goodsReal.sale_mode === 2){
              _goodsReal.time_deposit_start = !!_goodsReal.deposit_start ? secToDate(_goodsReal.deposit_start) : "";
              _goodsReal.time_deposit_end = !!_goodsReal.deposit_end ? secToDate(_goodsReal.deposit_start) : "";
              if(_goodsReal.pre_sale === 2){
                _goodsReal.time_surplus_start = !!_goodsReal.surplus_start ? secToDate(_goodsReal.surplus_start) : "";
                _goodsReal.time_surplus_end = !!_goodsReal.surplus_end ? secToDate(_goodsReal.surplus_end) : "";
              }
            }
            if(_goodsReal?.attrs_ids && _goodsReal.attrs_ids.length > 0){
              setGoodsAttrs(_goodsReal?.attrs_ids);
            }
            setGoodsReal(_goodsReal);
          }

          // 蛋糕烘培
          if(_data.type === 4){
            let _goodsCake = Object.assign({}, goodsCakeInit, _data.goods_custom.goods_cake);
            if(_goodsCake?.attrs_ids && _goodsCake.attrs_ids.length > 0){
              setGoodsAttrs(_goodsCake?.attrs_ids);
            }
            _goodsCake.stock_up_check = !!_goodsCake?.stock_up_time;
            if(_goodsCake?.stock_up_time){
              const _days = Math.floor((_goodsCake?.stock_up_time / 24 / 60) % 60);
              const _hour = Math.floor(((_goodsCake?.stock_up_time - _days * 24 * 60) / 60) % 60);
              const _mins = Math.floor(_goodsCake?.stock_up_time % 60);
              _goodsCake.stock_up_arr = [_days, _hour, _mins];
            }
            setGoodsCake(_goodsCake);
          }

          // 酒店
          if(_data.type === 6){
            let _goodsHotel = Object.assign({}, goodsHotelInit, _data.goods_custom.goods_hotel);
            if(_goodsHotel?.after_sale?.buyer_free){
              _goodsHotel.after_sale.buyer_free = secondToTime(_goodsHotel?.after_sale?.buyer_free);
            }
            setGoodsHotel(_goodsHotel);
          }

          // 餐饮
          if(_data.type === 8){
            if(_data?.goods_custom?.goods_food?.attrs_ids && _data.goods_custom.goods_food.attrs_ids.length > 0){
              setGoodsAttrs(_data.goods_custom.goods_food.attrs_ids);
            }
          }



          console.log(_basic.pay_limit, "_basic");
          setGoodsForm(_basic);
          // console.log(_data, "_data");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getStock = (id, sku, type = "multi") => {
    shopApi.goods.stock({ goods_id: id }).then(res => {
      if(!!res && res.code === 0){
        if(Object.keys(res?.data).length > 0 && sku.length > 0){
          if(type === "multi"){
            console.log("多规格");
          }else{
            console.log("单规格");
            let _singleSku = Object.assign({}, skuInit, sku[0]);
            _singleSku.goods_price =  Object.assign({}, _singleSku.goods_price, res?.data[_singleSku.sku_id][0]);
            _singleSku = skuDataToEdit(_singleSku);
            setSingleSku(_singleSku);
          }
        }
        console.log(res?.data,"getStock");
      }
    });
  };
  const skuDataToEdit = (data) => {
    let _data = JSON.parse(JSON.stringify(data));
    if(_data?.price_cost){
      _data.price_cost = formatPrice(_data.price_cost);
    }
    if(_data?.data?.goods_kg){
      _data.data.goods_kg = (_data.data.goods_kg / 1000).toFixed(3);
    }
    if(_data?.data?.price_dot){
      _data.data.price_dot = formatPrice(_data.data.price_dot);
    }
    if(_data?.data?.price_max){
      _data.data.price_max = formatPrice(_data.data.price_max);
    }
    if(_data?.data?.price_max){
      _data.data.price_min = formatPrice(_data.data.price_min);
    }
    if(_data?.goods_price?.price){
      _data.goods_price.price = formatPrice(_data.goods_price.price);
    }
    if(_data?.goods_price?.price_retail){
      _data.goods_price.price_retail = formatPrice(_data.goods_price.price_retail);
    }
    return _data;
  };
  useEffect(()=>{
    if(!!_id){
      getGoodsInfo(parseInt(_id));
    }
  },[]);

  // 基本信息
  const initForm:any = {
    id: 0,
    type: 1,
    state: 1, // 状态 1正常 2待发布 3预售准备中 4下架 5已售罄 6不可销售 7仓库中
    name: "", // 商品类型 1实物物品 2虚拟商品 3电子卡券 4茶饮烘焙 5系统商品 6酒店 7景区景点 8线下餐饮
    title: "", // 商品卖点 100 个字符以内
    pic: [],
    cover: "", // 封面图片 取第一张
    goods_data: {
      is_show_rest: 1, // 商品详情、购物车是否显示剩余件数 1 显示 2不显示
      share: "", // 分享描述 微信分享给好友时会显示，建议36个字以内
      sub_name: "", // 购买按钮名称 20个字以内
      video: "" // 主图视频 35个字符长度限制
    },
    category: [], // 商品分类
    group_ids: [], // 所属分组 ID
    goods_word: [], // 用户留言数组 购买商品时让买家输入留言，最多可设置 10 条留言
    pay_limit: {
      limit_pay_min: "", // 每单最低购买数量
      limit_pay_quota: -1,	// 限购 -1不限制 1每单 2终身 3每天 4每周 5每月 6每年
      limit_pay_quota_num: "", // 购买限制件数
      limit_user_check: false,
      limit_specific: []
    },
    stock_type: 1, // 库存扣减方式 1拍下减库存 2付款减库存
    is_vip: 1, //  是否参加会员折扣 1参加 2不参加
    is_points: 2, // 是否可使用积分购买 1使用 2不使用
    max_points: 0, // 最大可使用积分数
    time_sale_time: "", // 开售时间 小于当前时间立即开售 时间戳指定开始时间
    goods_custom: {}, //
    goods_rule_sku: [], // 商品SKU信息
    module: [] // 商品使用的组件数据
  };
  const [levelList, setLevelList] = useState<any[]>([]); // 只允许特定用户购买 会员卡
  const [mcardList, setMcardList] = useState<any[]>([]); // 只允许特定用户购买 权益卡
  const [goodsForm, setGoodsForm] = useState<any>(initForm);
  const [errTips, setErrTips] = useState<any>({});
  const errTipsChange = (val, ref, father = "", tips = "", trigger = "blur") => {
    setErrTips(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      let _tips = "";
      if(trigger === "blur"){
        _tips = !val ? tips : "";
      }else{
        _tips = val.length === 0 ? tips : "";
      }
      if(!!father){
        temp[`${father}-${ref}`] = _tips;
      }else{
        temp[ref] = _tips;
      }
      return temp;
    });
  };
  const handleChange = (val, ref, father = "", tips = "", trigger = "blur"  ) => {
    setGoodsForm(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      if(!!tips){
        errTipsChange(val, ref, father, tips, trigger);
      }
      return temp;
    });
  };
  const findName = (id, list, type = "label", find = "value") => {
    let arr = list;
    if (arr.length > 0) {
      const item = arr.find(item => {
        return id === item[find];
      });
      if (type && item) return item[type];
    }
    return "-";
  };

  // 单规格
  const skuInit:any = {
    cover: "", // 规格图片 (PID 为0支持)
    display: "", // 规格图片是否显示在详情页
    data: {
      auto_code: "", // 发货编码
      auto_no: "", // 发货识别号码
      be_id: 0, // 关联ID (酒店、景区、优惠券…)
      be_num: 0, // 关联每份数量(如优惠券多少张)
      be_type: 0, // 关联类型 (电子卡券 1卡券库 2自定义生成)
      goods_kg: "", // 重量（kg）
      goods_no: "", // 规格条码 50 个字符以内
      price_dot: "", // 划线价 以分为单位
      price_max: "", // 建议最高价格 （总店及供货商设置）
      price_min: "" // 建议最低价格 （总店及供货商设置，设置后分店或分销只可在本值内设置价格）
    },
    goods_price: {
      is_sell: 1, // 是否销售 1 销售 2下架(最后一级存在)
      price: "", // 商品价格 以分为单位
      price_retail: "", // 分销供货价 (分销后作用)
      stock_num: "", // 库存数量 -999 无限库存 -2根据父商品决定
      time_end_date: "", // 结束区间 (仅酒店、景区支持)
      time_start_date: "" // 开始区间 (仅酒店、景区支持)
    },
    name: "", // 规则名
    price_cost: "" // 成本价 以分为单位
  };
  // 是否多规格
  const [multiSku, setMultiSku] = useState(false);
  const [singleSku, setSingleSku] = useState(skuInit);
  const handleSkuChange = (val, ref, father = "", tips = "", trigger = "blur"  ) => {
    setSingleSku(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      if(!!tips){
        errTipsChange(val, ref, father, tips, trigger);
      }
      return temp;
    });
  };

  // 商品类型
  const [goodsTypeList, setGoodsTypeList] = useState(shopConfig.goodsTypeList);
  const getRelation = () => {
    shopApi.goods.relation().then(res => {
      if (res.code === 0) {
        let types = res.data?.type ?? {};
        let typek:any = [];
        for (let key in types) {
          typek.push(Number(key));
        }
        let arrs = shopConfig.goodsTypeList.filter((item) => {
          return typek.includes(item.value);
        });
        setGoodsTypeList(arrs);
      }
    });
  };
  useEffect(()=>{
    getRelation();
  },[]);

  // 物流信息
  const [freightForm, setFreightForm] = useState<any>({ price: "", tpl_id: 0 });
  const [freightName, setFreightName] = useState("");
  const [freightType, setFreightType] = useState<any[]>([]);
  const [freightList, setFreightList] = useState<any[]>([
    {
      label: "快递发货",
      value: 1,
      type: [1],
      checked: true
    },
    {
      label: "同城配送",
      value: 2,
      type: [4,8],
      checked: false
    },
    {
      label: "到店自提",
      value: 3,
      type: [1,4,8],
      checked: true
    },
    {
      label: "商家配送",
      value: 4,
      type: [1,4,8],
      checked: false
    }
  ]);
  useEffect(()=>{
    if([1,4,8].indexOf(goodsForm.type) > -1){
      setFreightType(()=>{
        const tempList = freightList.filter(item => item.checked && item.type.indexOf(goodsForm.type) > -1);
        return tempList.map(item=>item.value);
      });
      setFreightName(() =>{
        let temp = "";
        freightList.forEach(item => {
          if(item.checked && item.type.indexOf(goodsForm.type) > -1){
            temp += item.label + "；";
          }
        });
        return temp;
      });
    }
  },[freightList, goodsForm.type]);

  // 弹出框
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    desc: "",
    type: ""
  });
  const closePopup = () => {
    setPopup({
      show: false,
      title: "",
      desc: "",
      type: ""
    });
  };

  const [goodsAttrs, setGoodsAttrs] = useState<any[]>([]);
  // 实物商品
  const goodsRealInit = {
    after_sale: { // 售后服务规则
      buyer_exchange: true, // 支持买家申请换货
      buyer_refund: true, // 支持买家申请退款
      buyer_seven_days: -1, // 7天无理由退货 单位多少天
      buyer_speed_exchange: true // 极速退款
    },
    delivery: 0, // 1 预售发货时间 2付款成功多少天后发货
    delivery_day: "", // 预售发货时间 付款成功多少天后发货
    goods_freight: [], // 配送规则
    attrs_ids: [], // 商品属性
    pre_percentage: "", // 预售定金比例
    pre_sale: 0, // 预售方式 1 全款预售 2 定金预售
    sale_mode: 1, // 售卖方式 1 现货 2 预售
    time_delivery_time: "", // 预售发货时间
    time_deposit_start: "", // 定金支付开始时间
    time_deposit_end: "", // 定金支付结束时间
    time_surplus_start: "", // 尾款支付开始时间
    time_surplus_end: "" // 尾款支付结束时间
  };
  const [goodsReal, setGoodsReal] = useState<any>(goodsRealInit);
  const handleRealChange = (val, ref, father = "", tips = "", trigger = "blur"  ) => {
    setGoodsReal(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      if(!!tips){
        errTipsChange(val, ref, father, tips, trigger);
      }
      return temp;
    });
  };
  // 酒店
  const goodsHotelInit = {
    after_sale: { // 售后服务规则
      buyer_cost: 0, // 超出免费取消后手续费 0~100%
      buyer_free: "", // 未入住当前几点可免费取消（从0点开始的时间戳）
      buyer_refund: true // 支持买家申请退款
    },
    confirm_time: 0 // 房价确认时间 单位分钟
  };
  const [goodsHotel, setGoodsHotel] = useState<any>(goodsHotelInit);
  const handleHotelChange = (val, ref, father = "", tips = "", trigger = "blur"  ) => {
    setGoodsHotel(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      if(!!tips){
        errTipsChange(val, ref, father, tips, trigger);
      }
      return temp;
    });
  };
  // 茶饮烘培
  const goodsCakeInit = {
    stock_up_list: {},
    stock_up_time: null,
    stock_up_arr: [],
    stock_up_check: false
  };
  const stockUpDays = Array(8).fill("").map((_,i) => "0" + i);
  const stockUpHours = Array(24).fill("").map((_,i) => i < 10 ? "0" + i : i.toString());
  const stockUpMins = Array(60).fill("").map((_,i) => i < 10 ? "0" + i : i.toString());
  const [goodsCake, setGoodsCake] = useState<any>(goodsCakeInit);
  const handleCakeChange = (val, ref, father = "", tips = "", trigger = "blur"  ) => {
    setGoodsCake(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      if(!!tips){
        errTipsChange(val, ref, father, tips, trigger);
      }
      return temp;
    });
  };

  const goodsCardInit = {
    after_sale: {
      buyer_refund: true, // 支持买家申请退款
      buyer_refund_expire_day: "", //
      buyer_refund_expire: -1 // 未核销卡券过期多久前可退款 -1 未核销均支持退款 单位小时
    },
    effect_mode: 1, // 卡券生效模式 1立即生效 2次日生效 3多少小时后生效
    effect_hour: "", // 3多少小时后生效 指定小时
    is_holidays_available: 1, // 节假日是否可用 1是 2不是
    time_validity_end_time: "", // 有效开始时间
    time_validity_start_time: "", // 有效结束时间
    use_notes: "", // 卡券使用说明
    validity_day: "", // 卡券有效时长 (生效类型 如：5 指5天内有效)
    validity_mode: -1 // 卡券有效模式 (-1长期有效 1指定天数 2指定时间段)
  };
  const [goodsCard, setGoodsCard] = useState<any>(goodsCardInit);
  const handleCardChange = (val, ref, father = "", tips = "", trigger = "blur"  ) => {
    setGoodsCard(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      if(!!tips){
        errTipsChange(val, ref, father, tips, trigger);
      }
      return temp;
    });
  };

  const refs = "goodsEdit";
  useEffect(()=>{
    eventCenterOn(refs,(res)=>{
      const msg = res[0];
      console.log(msg,"msg");
      switch (msg.type) {
        case "category": // 商品类目
          handleChange(msg.ids,"category","","商品类目", "change");
          break;
        case "group": // 分组
          handleChange(msg.ids,"group_ids");
          break;
        case "attrs": // 商品属性
          setGoodsAttrs(msg.data);
          break;
        case "freight": // 运费模板
          setFreightForm({
            price: msg?.data?.price,
            tpl_id: msg?.data?.tpl_id
          });
          errTipsChange(true, "freight");
          break;
        case "memberCard": // 留言
          setMcardList(msg.ids);
          errTipsChange(true, "limit_user_check");
          break;
        case "saleTime": // 开售时间
          handleChange(msg.time,"time_sale_time");
          break;
        case "level": // 留言
          setLevelList(msg.ids);
          errTipsChange(true, "limit_user_check");
          break;
        case "words": // 留言
          handleChange(msg.data,"goods_word");
          break;
        case "preSale": // 预售方式
          setGoodsReal(prevState => {
            return Object.assign({}, JSON.parse(JSON.stringify(prevState)), msg.data);
          });
          break;
        case "delivery": // 预售方式
          setGoodsReal(prevState => {
            return Object.assign({}, JSON.parse(JSON.stringify(prevState)), msg.data);
          });
          break;
        default:
          break;
      }
    });
    return () => {
      eventCenterOff(refs);
    };
  },[]);

  const saveClick = () => {
    let verify = true;
    let _form = JSON.parse(JSON.stringify(goodsForm));

    if(!_form.name){
      Taro.showToast({ title: "商品名称不能为空", icon: "none" });
      errTipsChange(_form.name, "name", "","商品名称不能为空");
      verify = false;
      return;
    }
    if(_form.category.length === 0){
      Taro.showToast({ title: "请选择商品类目", icon: "none" });
      errTipsChange(_form.category, "category", "","请选择商品类目", "change");
      verify = false;
      return;
    }
    if(_form.pic.length === 0){
      Taro.showToast({ title: "请选择商品图片", icon: "none" });
      errTipsChange(_form.pic, "pic", "","请选择商品图片", "change");
      verify = false;
      return;
    }else{
      _form.cover = _form.pic[0];
    }
    // 规格信息
    if(multiSku){
      if(_form.goods_rule_sku.length === 0){
        Taro.showToast({ title: "请设置商品规格", icon: "none" });
        errTipsChange(_form.goods_rule_sku, "goods_rule_sku", "","请设置商品规格", "change");
        verify = false;
        return;
      }
    }else{
      let _singleSku = JSON.parse(JSON.stringify(singleSku));
      if(!_singleSku.goods_price.price){
        Taro.showToast({ title: "价格不能为空", icon: "none" });
        errTipsChange(_singleSku.goods_price.price, "price", "goods_price","价格不能为空", "change");
        verify = false;
        return;
      }else{
        _singleSku.goods_price.price = Number(_singleSku.goods_price.price) * 100;
      }
      if (mainStore > 2) {
        delete _singleSku.data.price_min;
        delete _singleSku.data.price_max;
      }else{
        if(!!_singleSku.data.price_min){
          _singleSku.data.price_min = Number(_singleSku.data.price_min) * 100;
        }else{
          delete _singleSku.data.price_min;
        }
        if(!!_singleSku.data.price_max){
          _singleSku.data.price_max = Number(_singleSku.data.price_max) * 100;
        }else{
          delete _singleSku.data.price_max;
        }
        if(!!_singleSku.data.price_min && !!_singleSku.data.price_max && _singleSku.data.price_min > _singleSku.data.price_max){
          Taro.showToast({ title: "建议售价区间最低价不能大于最高价", icon: "none" });
          errTipsChange("", "price_max", "price_min","建议售价区间最低价不能大于最高价");
          verify = false;
        }else{
          errTipsChange(true, "price_max", "price_min");
        }
      }
      if(!!_singleSku.data.price_dot){
        _singleSku.data.price_dot = Number(_singleSku.data.price_dot) * 100;
      }else{
        delete _singleSku.data.price_dot;
      }
      if(_singleSku.goods_price.stock_num !== -999 && !singleSku.goods_price.stock_num){
        Taro.showToast({ title: "可售库存不能为空", icon: "none" });
        errTipsChange(_singleSku.goods_price.stock_num, "stock_num", "goods_price","可售库存不能为空");
        verify = false;
        return;
      }
      _singleSku.goods_price.stock_num = parseInt(_singleSku.goods_price.stock_num);
      if(!!_singleSku.price_cost){
        _singleSku.price_cost = Number(_singleSku.price_cost) * 100;
      }else{
        delete _singleSku.price_cost;
      }
      if(!!_singleSku.data.goods_kg){
        _singleSku.data.goods_kg = Number(_singleSku.data.goods_kg) * 1000;
      }else{
        delete _singleSku.data.goods_kg;
      }
      _form.goods_rule_sku = [_singleSku];
    }

    // 商品属性
    let _goods_attrs:any[] = [];
    if([1,4,8].indexOf(_form.type) > -1 && goodsAttrs){
      _goods_attrs = goodsAttrs;
    }

    // 运费模板
    let _goods_freight:any[] = [];
    if([1,4,8].indexOf(_form.type) > -1){
      let _freightForm = JSON.parse(JSON.stringify(freightForm));
      if(freightType.indexOf(1) > -1 && _form.type === 1){
        if((!_freightForm.price || _freightForm.price === -1) && !_freightForm.tpl_id){
          Taro.showToast({ title: "请设置运费", icon: "none" });
          errTipsChange("", "freight", "","请设置运费");
          verify = false;
          return;
        }
      }
      if(freightType.indexOf(2) > -1){
        if(!_freightForm.tpl_id){
          Taro.showToast({ title: "请选择运费模板", icon: "none" });
          errTipsChange(_freightForm.tpl_id, "freight", "","请选择运费模板");
          verify = false;
          return;
        }
      }
      if(freightType.indexOf(4) > -1){
        if(!_freightForm.price){
          Taro.showToast({ title: "统一运费不能为空", icon: "none" });
          errTipsChange(_freightForm.price, "freight", "","统一运费不能为空");
          verify = false;
          return;
        }else{
          _freightForm.price = Number(_freightForm.price) * 100;
        }
      }
      if(freightType.length > 0){
        freightType.forEach(item=>{
          let _item:any = { type: item };
          if(item === 1){
            if(!!_freightForm.tpl_id){
              _item.price = -1;
              _item.tpl_id = _freightForm.tpl_id;
            }else{
              _item.price = Number(_freightForm.price) * 100;
              _item.tpl_id = undefined;
            }
          }else if(item === 2){
            _item.price = -1;
            _item.tpl_id = _freightForm.tpl_id;
          }else if(item === 4){
            _item.price = Number(_freightForm.price) * 100;
            _item.tpl_id = undefined;
          }
          _goods_freight.push(_item);
        });
      }
    }

    // 限购信息
    if(_form.is_points === 1){
      if(!_form.max_points){
        Taro.showToast({ title: "积分数量不能为空", icon: "none" });
        errTipsChange(_form.max_points, "max_points", "","积分数量不能为空");
        verify = false;
        return;
      }else{
        _form.max_points = parseInt(_form.max_points);
      }
    }else{
      _form.max_points = 0;
    }

    if(_form.type === 1){
      let _goodsReal = JSON.parse(JSON.stringify(goodsReal));
      if(_goodsReal.pre_sale === 0){
        Taro.showToast({ title: "请设置预售方式", icon: "none" });
        errTipsChange("", "pre_sale", "","请设置预售方式");
        verify = false;
        return;
      }else if(_goodsReal.pre_sale === 1){
        delete _goodsReal.pre_percentage;
        delete _goodsReal.time_surplus_start;
        delete _goodsReal.time_surplus_end;
      }
      if(_goodsReal.delivery === 0){
        Taro.showToast({ title: "请设置发货时间", icon: "none" });
        errTipsChange("", "delivery", "","请设置发货时间");
        verify = false;
        return;
      }else if(_goodsReal.delivery === 1){
        delete _goodsReal.time_delivery_time;
      }else if(_goodsReal.delivery === 2){
        delete _goodsReal.delivery_day;
      }
      delete _goodsReal.delivery;

      _goodsReal.attrs_ids = _goods_attrs;
      _goodsReal.goods_freight = _goods_freight;
      _form.goods_custom.goods_real = _goodsReal;
    }
    if(_form.type === 3){
      let _goodsCard = JSON.parse(JSON.stringify(goodsCard));
      if(!multiSku){
        if(_goodsCard.after_sale.buyer_refund_expire !== -1){
          if(!_goodsCard.after_sale.buyer_refund_expire){
            Taro.showToast({ title: "未核销卡券过期时间不能为空", icon: "none" });
            errTipsChange("", "buyer_refund_expire", "after_sale","未核销卡券过期时间不能为空");
            verify = false;
            return;
          }else{
            _goodsCard.after_sale.buyer_refund_expire = parseInt(_goodsCard.after_sale.buyer_refund_expire);
          }
          if(!!_goodsCard.after_sale.buyer_refund_expire_day){
            _goodsCard.after_sale.buyer_refund_expire_day = parseInt(_goodsCard.after_sale.buyer_refund_expire_day);
            _goodsCard.after_sale.buyer_refund_expire = _goodsCard.after_sale.buyer_refund_expire + _goodsCard.after_sale.buyer_refund_expire_day * 24;
          }
        }
        delete _goodsCard.after_sale.buyer_refund_expire_day;
        if(_goodsCard.effect_mode === 3){
          if(!_goodsCard.effect_hour){
            Taro.showToast({ title: "未核销卡券过期时间不能为空", icon: "none" });
            errTipsChange("", "effect_hour", "","购买后生效时间不能为空");
            verify = false;
            return;
          }else{
            _goodsCard.effect_hour = parseInt(_goodsCard.effect_hour);
          }
        }else{
          delete _goodsCard.effect_hour;
        }
        if(_goodsCard.validity_mode === 1){
          delete _goodsCard.time_validity_end_time;
          delete _goodsCard.time_validity_start_time;
          if(!_goodsCard.validity_day){
            Taro.showToast({ title: "卡券有效天数不能为空", icon: "none" });
            errTipsChange("", "validity_day", "","卡券有效天数不能为空");
            verify = false;
            return;
          }else{
            _goodsCard.validity_day = parseInt(_goodsCard.validity_day);
          }
        }else if(_goodsCard.validity_mode === 2){
          delete _goodsCard.validity_day;
          if(!_goodsCard.time_validity_start_time){
            Taro.showToast({ title: "请选择卡券开始有效日期", icon: "none" });
            errTipsChange("", "time_validity_start_time", "","请选择卡券开始有效日期");
            verify = false;
            return;
          }
          if(!_goodsCard.time_validity_end_time){
            Taro.showToast({ title: "请选择卡券结束有效日期", icon: "none" });
            errTipsChange("", "time_validity_end_time", "","请选择卡券结束有效日期");
            verify = false;
            return;
          }
          if(_goodsCard.time_validity_end_time === _goodsCard.time_validity_start_time){
            _goodsCard.time_validity_end_time = _goodsCard.time_validity_end_time + " 23:59:59";
          }else{
            _goodsCard.time_validity_end_time = _goodsCard.time_validity_end_time + " 00:00:00";
          }
          _goodsCard.time_validity_start_time = _goodsCard.time_validity_start_time + " 00:00:00";
          const start_time = new Date(_goodsCard.time_validity_start_time).getTime();
          const end_time = new Date(_goodsCard.time_validity_end_time).getTime();
          if(start_time > end_time){
            Taro.showToast({ title: "卡券结束有效日期不能小于开始日期", icon: "none" });
            return;
          }
        }
        _form.goods_custom.goods_card = _goodsCard;
      }else{
        _form.goods_custom.goods_card = {
          use_notes: _goodsCard.use_notes
        };
      }
    }
    if(_form.type === 4){
      _form.goods_custom.goods_cake = {
        attrs_ids: _goods_attrs,
        goods_freight: _goods_freight
      };
      let _goodsCake = JSON.parse(JSON.stringify(goodsCake));
      if(_goodsCake.stock_up_check){
        if(!multiSku){
          if(_goodsCake.stock_up_arr.length === 0){
            Taro.showToast({ title: "请选择备货时间", icon: "none" });
            errTipsChange("", "stock_up_arr", "","请选择备货时间");
            verify = false;
            return;
          }else{
            const _days = stockUpDays[_goodsCake.stock_up_arr[0]];
            const _hour = stockUpHours[_goodsCake.stock_up_arr[1]];
            const _mins = stockUpMins[_goodsCake.stock_up_arr[2]];
            const _days_time = parseInt(_days) * 24 * 60;
            const _hour_time = parseInt(_hour) * 60;
            const _mins_time = parseInt(_mins);
            _goodsCake.stock_up_time = _days_time + _hour_time + _mins_time;
            _form.goods_custom.goods_cake.stock_up_time = _goodsCake.stock_up_time;
          }
        }
      }else{
        _form.goods_custom.goods_cake = {
          attrs_ids: _goods_attrs,
          goods_freight: _goods_freight
        };
      }
    }

    if(!_form.pay_limit.limit_pay_min){
      Taro.showToast({ title: "每单最低购买数量不能为空", icon: "none" });
      errTipsChange(_form.pay_limit.limit_pay_min, "limit_pay_min", "pay_limit","每单最低购买数量不能为空");
      verify = false;
      return;
    }else{
      _form.pay_limit.limit_pay_min = parseInt(_form.pay_limit.limit_pay_min);
      if(_form.pay_limit.limit_pay_min < 1){
        Taro.showToast({ title: "商品至少一件起售", icon: "none" });
        errTipsChange("", "limit_pay_min", "pay_limit","商品至少一件起售");
        verify = false;
        return;
      }
    }
    if(_form.pay_limit.limit_pay_quota !== -1){
      if(!_form.pay_limit.limit_pay_quota_num){
        Taro.showToast({ title: "限购数量不能为空", icon: "none" });
        errTipsChange(_form.pay_limit.limit_pay_quota_num, "limit_pay_quota_num", "pay_limit","限购数量不能为空");
        verify = false;
        return;
      }else{
        _form.pay_limit.limit_pay_quota_num = parseInt(_form.pay_limit.limit_pay_quota_num);
      }
    }
    if(_form.pay_limit.limit_user_check){
      if(mcardList.length === 0 && levelList.length === 0){
        Taro.showToast({ title: "特定用户权益卡和会员身份至少选择一种", icon: "none" });
        errTipsChange("", "limit_user_check", "","以下特定用户权益卡和会员身份至少选择一种");
        verify = false;
        return;
      }
      if(levelList.length > 0){
        const _level = levelList.map(id=>{
          return {
            bind_id: id,
            bind_type: 1
          };
        });
        _form.pay_limit.limit_specific = _form.pay_limit.limit_specific.concat(_level);
      }
      if(mcardList.length > 0){
        const _mcard = mcardList.map(id=>{
          return {
            bind_id: id,
            bind_type: 2
          };
        });
        _form.pay_limit.limit_specific = _form.pay_limit.limit_specific.concat(_mcard);
      }
    }
    delete _form.pay_limit.limit_user_check;

    if(_form.type === 6){
      let _goodsHotel = JSON.parse(JSON.stringify(goodsHotel));
      if(!!_goodsHotel.confirm_time){
        _goodsHotel.confirm_time = parseInt(_goodsHotel.confirm_time);
      }else{
        _goodsHotel.confirm_time = 0;
      }
      if(!!_goodsHotel.after_sale.buyer_cost){
        _goodsHotel.after_sale.buyer_cost = parseInt(_goodsHotel.after_sale.buyer_cost);
      }else{
        _goodsHotel.after_sale.buyer_cost = 0;
      }
      if(!!_goodsHotel.after_sale.buyer_free){
        _goodsHotel.after_sale.buyer_free = timeToSecond(_goodsHotel.after_sale.buyer_free);
      }else{
        _goodsHotel.after_sale.buyer_free = null;
      }
      _form.goods_custom.goods_hotel = _goodsHotel;
    }
    if(_form.type === 8){
      _form.goods_custom.goods_food = {
        attrs_ids: _goods_attrs,
        goods_freight: _goods_freight
      };
    }


    if(!verify) return;


    console.log(_form,"_form");

  };

  const renderSku = () => {
    return (
      <React.Fragment>
        <View className="card-title card-title--full">
          {goodsForm.type === 6 ? "房型信息" : goodsForm.type === 7 ? "门票信息" : "规格/库存信息"}
        </View>
        <View className="card card--full">
          <Field
            border={false}
            input={false}
            value="多规格"
            right={
              <Switch
                checked={multiSku}
                onChange={setMultiSku}
              />
            }
          />
          {multiSku ? (
            <Field
              required
              title="商品规格"
              titleWidth={100}
              input={false}
              placeholder="请设置商品规格"
              value={goodsForm.goods_rule_sku.length > 0 ? `已设置${goodsForm.goods_rule_sku.length}项目` : ""}
              arrow
              clickable
              errorIcon={false}
              error={!!errTips.goods_rule_sku}
              errorMessage={errTips.goods_rule_sku}
              onClick={()=>{
                console.log("商品规格设置");
              }}
            />
          ) : (
            <React.Fragment>
              <Field
                required
                title="价格"
                titleWidth={100}
                type="number"
                placeholder="请输入价格"
                value={singleSku.goods_price.price}
                right="元"
                errorIcon={false}
                error={!!errTips["goods_price-price"]}
                errorMessage={errTips["goods_price-price"]}
                onChange={(val)=>{handleSkuChange(val,"price","goods_price", "价格不能为空");}}
              />
              {mainStore <= 2 && (goodsForm.type <= 5 || goodsForm.type === 8) ? (
                <React.Fragment>
                  <Field
                    title="建议售价区间"
                    titleWidth={100}
                    input={false}
                    inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 0, paddingBottom: 0 }}
                    right="元"
                    errorIcon={false}
                    error={!!errTips["price_min-price_max"]}
                    errorMessage={errTips["price_min-price_max"]}
                    // intro="总店设置后，分店定价需在建议售价区间内。"
                    introPosition="bottom"
                    introStyle={{ fontSize: addUnit(10) }}
                  >
                    <Field
                      border={false}
                      type="number"
                      placeholder="最低售价"
                      value={singleSku.data.price_min}
                      onChange={(val)=>{handleSkuChange(val,"price_min", "data");}}
                      style={{ paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 }}
                    />
                    <View style={{ paddingRight: addUnit(16) }}>至</View>
                    <Field
                      border={false}
                      type="number"
                      placeholder="最高售价"
                      value={singleSku.data.price_max}
                      onChange={(val)=>{handleSkuChange(val,"price_max", "data");}}
                      style={{ paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 }}
                    />
                  </Field>
                  <Field
                    title="划线价"
                    titleWidth={100}
                    type="number"
                    placeholder="请输入划线价"
                    value={singleSku.data.price_dot}
                    right="元"
                    onChange={(val)=>{handleSkuChange(val,"price_dot","data");}}
                  />
                </React.Fragment>
              ) : null}
              <Field
                value="无限库存"
                input={false}
                right={
                  <Switch
                    checked={singleSku.goods_price.stock_num === -999}
                    activeValue={-999}
                    inactiveValue=""
                    onChange={(val)=>{
                      handleSkuChange(val,"stock_num","goods_price");
                    }}
                  />
                }
                // intro="开启无限库存时，用户下单时不受库存控制、取消，可自定义库存。"
                introPosition="bottom"
                introStyle={{ fontSize: addUnit(10), marginTop: 0 }}
              />
              {singleSku.goods_price.stock_num !== -999 ? (
                <Field
                  required
                  title="可售库存"
                  titleWidth={100}
                  type="digit"
                  placeholder="请输入库存"
                  value={singleSku.goods_price.stock_num}
                  errorIcon={false}
                  error={!!errTips["goods_price-stock_num"]}
                  errorMessage={errTips["goods_price-stock_num"]}
                  onChange={(val)=>{handleSkuChange(val,"stock_num","goods_price","可售库存不能为空");}}
                />
              ) : null}
            </React.Fragment>
          )}
          {(!multiSku && singleSku.goods_price.stock_num !== -999) || multiSku || goodsForm.type === 6 || goodsForm.type === 7 ? (
            <Field
              title="库存扣减方式"
              titleWidth={100}
              input={false}
              value={["拍下减库存","付款减库存"][goodsForm.stock_type - 1]}
              arrow
              clickable
              onClick={()=>{
                setPopup({
                  show: true,
                  title: "库存扣减方式",
                  desc: "",
                  type: "stockType"
                });
              }}
            />
          ) : null}
          {!multiSku ? (
            <React.Fragment>
              <Field
                title="成本价"
                titleWidth={100}
                type="number"
                placeholder="请输入成本价"
                value={singleSku.price_cost}
                right="元"
                onChange={(val)=>{handleSkuChange(val,"price_cost");}}
              />
              <Field
                title="重量"
                titleWidth={100}
                type="number"
                placeholder="请输入重量"
                value={singleSku.data.goods_kg}
                right="kg"
                onChange={(val)=>{handleSkuChange(val,"goods_kg","data");}}
              />
            </React.Fragment>
          ) : null}
        </View>
      </React.Fragment>
    );
  };
  const renderAttrs = () => {
    if([1,4,8].indexOf(goodsForm.type) > -1){
      return (
        <React.Fragment>
          <View className="card-title card-title--full">商品属性</View>
          <View className="card card--full">
            <Field
              border={false}
              title="商品属性"
              titleWidth={100}
              input={false}
              arrow
              clickable
              placeholder="设置商品属性"
              value={goodsAttrs.length > 0 ? `已设置${goodsAttrs.length}项` : ""}
              onClick={()=>{
                navigateTo({
                  url: "/pages/shop/edit/attrs/index",
                  method: "navigateTo",
                  params: {
                    attrs: goodsAttrs
                  }
                });
              }}
            />
          </View>
          <View className="card-tips card-tips--full">
            买家下单或收银开单时选择诸如甜度、口味、加料等商品属性。若需编辑属性信息，可进入 属性库 进行操作。
          </View>
        </React.Fragment>
      );
    }
    return null;
  };
  const renderFreight = () => {
    if([1,4,8].indexOf(goodsForm.type) > -1){
      return (
        <React.Fragment>
          <View className="card-title card-title--full">物流信息</View>
          <View className="card card--full">
            <Field
              border={false}
              title="配送方式"
              titleWidth={100}
              input={false}
              arrow
              clickable
              placeholder="请设置配送方式"
              value={freightName}
              onClick={()=>{
                setPopup({
                  show: true,
                  title: "选择配送方式",
                  desc: "",
                  type: "expressType"
                });
              }}
            />
            {freightType.indexOf(1) > -1 && goodsForm.type === 1 ? (
              <Field
                required
                title="设置运费"
                titleWidth={100}
                input={false}
                placeholder="请设置运费"
                value={freightForm.price !== "" && freightForm.price !== -1 ? `统一运费 ${freightForm.price}元` : !!freightForm.tpl_id ? "已设置运费模板" : ""}
                arrow
                clickable
                errorIcon={false}
                error={!!errTips.freight}
                errorMessage={errTips.freight}
                onClick={()=>{
                  navigateTo({
                    url: "/pages/shop/edit/freight/index",
                    method: "navigateTo",
                    params: {
                      data: freightForm,
                      refs: refs,
                      type: "freight"
                    }
                  });
                }}
              />
            ) : null}
            {freightType.indexOf(4) > -1 ? (
              <Field
                required
                title="统一运费"
                titleWidth={100}
                type="number"
                placeholder="请输入统一运费"
                value={freightForm.price}
                right="元"
                errorIcon={false}
                error={!!errTips.freight}
                errorMessage={errTips.freight}
                onChange={(val)=>{
                  setFreightForm(prevState=>{
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.price = val;
                    errTipsChange(val,"freight","","统一运费不能为空");
                    return temp;
                  });
                }}
              />
            ) : null}
            {freightType.indexOf(2) > -1 && goodsForm.type !== 1 ? (
              <Field
                required
                title="运费模板"
                titleWidth={100}
                input={false}
                placeholder="请设置运费模板"
                value={!!freightForm.tpl_id ? "已设置运费模板" : ""}
                arrow
                clickable
                errorIcon={false}
                error={!!errTips.freight}
                errorMessage={errTips.freight}
                onClick={()=>{
                  navigateTo({
                    url: "/pages/shop/edit/freight/index",
                    method: "navigateTo",
                    params: {
                      data: { price: -1, tpl_id: freightForm.tpl_id },
                      refs: refs,
                      type: "freight",
                      price: false,
                      goodType: 4
                    }
                  });
                }}
              />
            ) : null}
            {goodsForm.type === 4 ? (
              <React.Fragment>
                <Cell title="需要备货时间">
                  <Switch
                    checked={goodsCake.stock_up_check}
                    onChange={(val)=>{
                      handleCakeChange(val,"stock_up_check");
                    }}
                  />
                </Cell>
                {goodsCake.stock_up_check ? (
                  <React.Fragment>
                    {!multiSku ? (
                      /* @ts-ignore*/
                      <Picker
                        mode="multiSelector"
                        range={[stockUpDays, stockUpHours, stockUpMins]}
                        value={goodsCake.stock_up_arr}
                        onChange={(e)=>{
                          handleCakeChange(e.detail.value,"stock_up_arr", "","请选择备货时间","change");
                        }}
                      >
                        <Field
                          required
                          title="备货时间"
                          titleWidth={100}
                          input={false}
                          placeholder="请选择备货时间"
                          errorIcon={false}
                          error={!!errTips.stock_up_arr}
                          errorMessage={errTips.stock_up_arr}
                          value={goodsCake.stock_up_arr.length > 0 ? `${stockUpDays[goodsCake.stock_up_arr[0]]}天${stockUpHours[goodsCake.stock_up_arr[1]]}小时${stockUpMins[goodsCake.stock_up_arr[2]]}分钟` : ""}
                          clickable
                          arrow
                        />
                      </Picker>
                    ) : null}
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : null}
          </View>
        </React.Fragment>
      );
    }
    return null;
  };
  const renderAfterSale = () => {
    if((goodsForm.type === 3 && multiSku) || goodsForm.type === 4 || goodsForm.type === 8) return null;
    return (
      <React.Fragment>
        <View className="card-title card-title--full">售后服务</View>
        <View className="card card--full">
        {goodsForm.type === 1 ? (
          <React.Fragment>
            <Picker
              mode="selector"
              range={["不支持无理由退货","7天无理由退货","30天无理由退货"]}
              onChange={(e)=>{
                const idx = e.detail.value === 1 ? 7 : e.detail.value === 2 ? 30 : -1;
                handleRealChange(idx, "buyer_seven_days", "after_sale");
              }}
            >
              <Cell
                border={false}
                title="无理由退货"
                titleStyle={{ width: addUnit(100) }}
                content={goodsReal.after_sale.buyer_seven_days === -1 ? "不支持无理由退货" : `${goodsReal.after_sale.buyer_seven_days}天无理由退货`}
                contentAlign="left"
                arrow
              />
            </Picker>
            <Cell title="支持买家申请换货">
              <Switch
                checked={goodsReal.after_sale.buyer_exchange}
                onChange={(val)=>{
                  handleRealChange(val, "buyer_exchange", "after_sale");
                }}
              />
            </Cell>
            <Cell title="支持买家申请退款">
              <Switch
                checked={goodsReal.after_sale.buyer_refund}
                onChange={(val)=>{
                  handleRealChange(val, "buyer_refund", "after_sale");
                }}
              />
            </Cell>
            <Cell title="极速退款">
              <Switch
                checked={goodsReal.after_sale.buyer_speed_exchange}
                onChange={(val)=>{
                  handleRealChange(val, "buyer_speed_exchange", "after_sale");
                }}
              />
            </Cell>
          </React.Fragment>
        ) : goodsForm.type === 2 || goodsForm.type === 3 ? (
          <React.Fragment>
            {!multiSku ? (
              <React.Fragment>
                <Cell title="支持买家申请退款" border={false}>
                  <Switch
                    checked={goodsCard.after_sale.buyer_refund}
                    onChange={(val)=>{
                      handleCardChange(val, "buyer_refund", "after_sale");
                    }}
                  />
                </Cell>
                <Field
                  title="退款方式"
                  titleWidth={100}
                  input={false}
                  arrow
                  clickable
                  placeholder="请选择"
                  value={goodsCard.after_sale.buyer_refund_expire === -1 ? "未核销卡券均支持退款" : "未核销卡券过期前可退款"}
                  onClick={()=>{
                    Taro.showActionSheet({
                      itemList: ["未核销卡券均支持退款","未核销卡券过期前N小时可退款"],
                      success: function (res) {
                        const val = res.tapIndex === 0 ? -1 : "";
                        handleCardChange(val, "buyer_refund_expire", "after_sale");
                      }
                    });
                  }}
                />
                {goodsCard.after_sale.buyer_refund_expire !== -1 ? (
                  <Field
                    required
                    title="未核销卡券过期前"
                    titleWidth={120}
                    input={false}
                    inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 0, paddingBottom: 0 }}
                    right="小时可退款"
                    errorIcon={false}
                    error={!!errTips["after_sale-buyer_refund_expire"]}
                    errorMessage={errTips["after_sale-buyer_refund_expire"]}
                    introPosition="bottom"
                    introStyle={{ fontSize: addUnit(10) }}
                  >
                    <Field
                      border={false}
                      type="digit"
                      placeholder="天数"
                      maxlength={2}
                      value={goodsCard.after_sale.buyer_refund_expire_day}
                      onChange={(val)=>{
                        const _val = !!val && parseInt(val) > 30 ? 30 : val;
                        handleCardChange(_val,"buyer_refund_expire_day","after_sale");
                      }}
                      style={{ paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 }}
                    />
                    <View style={{ paddingRight: addUnit(12) }}>天</View>
                    <Field
                      border={false}
                      type="digit"
                      placeholder="小时"
                      maxlength={2}
                      value={goodsCard.after_sale.buyer_refund_expire}
                      onChange={(val)=>{
                        const _val = !!val && parseInt(val) > 23 ? 23 : val;
                        handleCardChange(_val,"buyer_refund_expire","after_sale","未核销卡券过期时间不能为空");
                      }}
                      style={{ paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 }}
                    />
                  </Field>
                ) : null}
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ) : goodsForm.type === 6 ? (
          <React.Fragment>
            <Cell title="支持买家申请退款" border={false}>
              <Switch
                checked={goodsHotel.after_sale.buyer_refund}
                onChange={(val)=>{
                  handleHotelChange(val, "buyer_refund", "after_sale");
                }}
              />
            </Cell>
            <Picker
              mode="time"
              value={goodsHotel.after_sale.buyer_free}
              start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
              onChange={(e)=>{
                const _time = e.detail.value.replace(/\//g, "-");
                handleHotelChange(_time, "buyer_free", "after_sale");
              }}
            >
              <Cell
                title="入住当天"
                titleStyle={{ width: addUnit(100) }}
                content={goodsHotel.after_sale.buyer_free !== "" ? goodsHotel.after_sale.buyer_free : "请选择时间"}
                contentAlign="left"
                contentStyle={goodsHotel.after_sale.buyer_free !== "" ? undefined : { color: "#ccc" }}
                rightIcon="前可免费取消"
                arrow
              />
            </Picker>
            <Field
              title="取消手续费率"
              titleWidth={100}
              type="digit"
              placeholder="0~100"
              maxlength={3}
              value={goodsHotel.after_sale.buyer_cost}
              right="%"
              onChange={(val)=>{
                const _val = !!val && parseInt(val) > 100 ? 100 : val;
                handleHotelChange(_val,"buyer_cost","after_sale");
              }}
            />
          </React.Fragment>
        ) : null}
        </View>
      </React.Fragment>
    );
  };
  const renderGoodsReal = () => {
    if(goodsForm.type === 1){
      return (
        <React.Fragment>
          <Field
            title="售卖方式"
            titleWidth={100}
            input={false}
            arrow
            clickable
            placeholder="请选择"
            value={["现货","预售"][goodsReal.sale_mode - 1]}
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["现货","预售"],
                success: function (res) {
                  const val = res.tapIndex + 1;
                  handleRealChange(val, "sale_mode");
                }
              });
            }}
          />
          {goodsReal.sale_mode === 2 ? (
            <React.Fragment>
              <Field
                required
                title="预售方式"
                titleWidth={100}
                input={false}
                arrow
                clickable
                placeholder="请设置预售方式"
                value={goodsReal.pre_sale === 1 ? "全款预售" : goodsReal.pre_sale === 2 ? `定金预售 ${goodsReal.pre_percentage}%` : ""}
                intro={!!goodsReal.time_deposit_start && goodsReal.time_deposit_end ? `支付时间：${goodsReal.time_deposit_start.substring(0,10)}至${goodsReal.time_deposit_end.substring(0,10)}` : ""}
                introPosition="bottom"
                introStyle={{ fontSize: addUnit(10), marginTop: 0 }}
                errorIcon={false}
                error={!!errTips.pre_sale}
                errorMessage={errTips.pre_sale}
                onClick={() => {
                  navigateTo({
                    url: "/pages/shop/edit/pre-sale/index",
                    method: "navigateTo",
                    params: {
                      data: {
                        pre_sale: goodsReal.pre_sale,
                        pre_percentage: goodsReal.pre_percentage,
                        time_deposit_start: goodsReal.time_deposit_start,
                        time_deposit_end: goodsReal.time_deposit_end,
                        time_surplus_start: goodsReal.time_surplus_start,
                        time_surplus_end: goodsReal.time_surplus_end
                      },
                      refs: refs,
                      type: "preSale"
                    }
                  });
                }}
              />
              <Field
                required
                title="发货时间"
                titleWidth={100}
                input={false}
                arrow
                clickable
                placeholder="请设置发货时间"
                value={goodsReal.delivery === 2 ? goodsReal.time_delivery_time : goodsReal.delivery === 1 ? `付款成功${goodsReal.delivery_day}天后发货` : ""}
                errorIcon={false}
                error={!!errTips.delivery}
                errorMessage={errTips.delivery}
                onClick={() => {
                  navigateTo({
                    url: "/pages/shop/edit/delivery/index",
                    method: "navigateTo",
                    params: {
                      data: {
                        delivery: goodsReal.delivery,
                        delivery_day: goodsReal.delivery_day,
                        time_delivery_time: goodsReal.time_delivery_time
                      },
                      refs: refs,
                      type: "delivery"
                    }
                  });
                }}
              />
            </React.Fragment>
          ) : null}
        </React.Fragment>
      );
    }
    return null;
  };
  const renderGoodsCard = () => {
    if(goodsForm.type === 3){
      return (
        <React.Fragment>
          <Field
            input={false}
            value="节假日可用"
            right={
              <Switch
                checked={goodsCard.is_holidays_available === 1}
                inactiveValue={2}
                activeValue={1}
                onChange={(val)=>{
                  handleCardChange(val,"is_holidays_available");
                }}
              />
            }
          />
          <Field
            title="卡券生效模式"
            titleWidth={100}
            input={false}
            arrow
            clickable
            placeholder="请选择卡券生效模式"
            value={["购买后立即生效","购买后次日生效","购买后N小时后生效"][goodsCard.effect_mode - 1]}
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["购买后立即生效","购买后次日生效","购买后N小时后生效"],
                success: function (res) {
                  const val = res.tapIndex + 1;
                  handleCardChange(val, "effect_mode");
                }
              });
            }}
          />
          {goodsCard.effect_mode === 3 ? (
            <Field
              required
              title="购买后"
              titleWidth={100}
              type="digit"
              placeholder="请输入整数"
              value={goodsCard.effect_hour}
              right="小时后生效"
              maxlength={4}
              errorIcon={false}
              error={!!errTips.effect_hour}
              errorMessage={errTips.effect_hour}
              onChange={(val)=>{
                const _val = !!val && parseInt(val) > 9999 ? 9999 : val;
                handleCardChange(_val,"effect_hour","","购买后生效时间不能为空");
              }}
            />
          ) : null}
          <Field
            title="卡券有效期"
            titleWidth={100}
            input={false}
            arrow
            clickable
            placeholder="请选择卡券有效期"
            value={["长期有效","指定天数","指定时间段"][goodsCard.validity_mode === -1 ? 0 : goodsCard.validity_mode]}
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["长期有效","指定天数","指定时间段"],
                success: function (res) {
                  const val = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleCardChange(val, "validity_mode");
                }
              });
            }}
          />
          {goodsCard.validity_mode === 1 ? (
            <Field
              required
              title="生效时间起"
              titleWidth={100}
              type="digit"
              placeholder="请输入整数"
              value={goodsCard.validity_day}
              right="天内有效"
              maxlength={4}
              errorIcon={false}
              error={!!errTips.validity_day}
              errorMessage={errTips.validity_day}
              onChange={(val)=>{
                const _val = !!val && parseInt(val) > 9999 ? 9999 : val;
                handleCardChange(_val,"validity_day","","卡券有效天数不能为空");
              }}
            />
          ) : goodsCard.validity_mode === 2 ? (
            <React.Fragment>
              <Picker
                mode="date"
                value={goodsCard.time_validity_start_time}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  const _date = e.detail.value.replace(/\//g, "-");
                  handleCardChange(_date,"time_validity_start_time","","请选择卡券开始有效日期");
                }}
              >
                <Field
                  required
                  title="开始有效期"
                  titleWidth={100}
                  input={false}
                  value={goodsCard.time_validity_start_time}
                  placeholder="请选择卡券开始有效日期"
                  arrow
                />
              </Picker>
              <Picker
                mode="date"
                value={goodsCard.time_validity_end_time}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  const _date = e.detail.value.replace(/\//g, "-");
                  handleCardChange(_date,"time_validity_end_time","","请选择卡券结束有效日期");
                }}
              >
                <Field
                  required
                  title="结束有效期"
                  titleWidth={100}
                  input={false}
                  value={goodsCard.time_validity_end_time}
                  placeholder="请选择卡券结束有效日期"
                  arrow
                />
              </Picker>
            </React.Fragment>
          ) : null}
        </React.Fragment>
      );
    }
    return null;
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
        <View className="card-title card-title--full">基本信息</View>
        <View className="card card--full">
          <Field
            border={false}
            title="商品类型"
            titleWidth={100}
            arrow={!goodsForm.id}
            clickable
            input={false}
            value={findName(goodsForm.type, shopConfig.goodsTypeList)}
            onClick={()=>{
              if (!!goodsForm.id) return;
              setPopup({
                show: true,
                title: "选择商品类型",
                desc: "",
                type: "goodsType"
              });
            }}
          />
        </View>
        <View className="card-tips card-tips--full">
          不同的商品类型可编辑的字段内容不同，商品类型一旦保存不可修改，请选择更匹配你需求的一个。
        </View>
        <View className="card card--full">
          <Field
            border={false}
            required
            title="商品名称"
            titleWidth={100}
            placeholder="100个字以内"
            maxlength={100}
            value={goodsForm.name}
            errorIcon={false}
            error={!!errTips.name}
            errorMessage={errTips.name}
            onChange={(val)=>{handleChange(val,"name", "","商品名称不能为空");}}
          />
           <Field
             title="商品卖点"
             titleWidth={100}
             placeholder="60个字以内"
             maxlength={60}
             value={goodsForm.title}
             onChange={(val)=>{handleChange(val,"title");}}
          />
          {goodsForm.type !== 8 ? (
            <Field
              title="商品类目"
              titleWidth={100}
              input={false}
              required
              arrow
              clickable
              value={goodsForm.category.length > 0 ? "已设置" : ""}
              placeholder="请设置商品类目"
              errorIcon={false}
              error={!!errTips.category}
              errorMessage={errTips.category}
              onClick={()=>{
                navigateTo({
                  method:"navigateTo",
                  url: "/pages/shop/edit/category/index",
                  params: {
                    ids: goodsForm.category,
                    refs: refs,
                    type: "category"
                  }
                });
              }}
            />
          ) : null}
          <Field
            title={`商品图片(${goodsForm.pic.length}/15)`}
            titleRow
            required
            align="start"
            input={false}
            introPosition="bottom"
            introStyle={{ marginTop: addUnit(8) }}
            intro="图片的第一张将作为商品封面，最多上传15张"
            errorIcon={false}
            error={!!errTips.pic}
            errorMessage={errTips.pic}
          >
            <ImagePicker
              refs="goodsPic"
              files={goodsForm.pic}
              maxCount={15}
              rowCount={4}
              preview
              addText="图片"
              onChange={(val)=>{
                console.log(val,"pic");
                handleChange(val, "pic","","请选择商品图片","change");
              }}
            />
          </Field>
          <Field
            title="商品分组"
            titleWidth={100}
            input={false}
            arrow
            clickable
            placeholder="请选择分组"
            value={goodsForm.group_ids.length > 0 ? `已选${goodsForm.group_ids.length}项` : ""}
            onClick={()=>{
              navigateTo({
                method:"navigateTo",
                url: "/pages/com/goods-group/index",
                params: {
                  refs: refs,
                  type: "group",
                  ids: goodsForm.group_ids,
                  multiple: true
                }
              });
            }}
          />
        </View>
        {renderSku()}
        {renderAttrs()}
        {renderFreight()}
        {renderAfterSale()}
        <View className="card-title card-title--full">其它信息</View>
        <View className="card card--full">
          <Cell border={false} title="会员折扣">
            <Switch
              checked={goodsForm.is_vip}
              onChange={(val)=>{
                handleChange(val, "is_vip");
              }}
            />
          </Cell>
          <Cell title="使用积分购买">
            <Switch
              checked={goodsForm.is_points === 1}
              activeValue={1}
              inactiveValue={2}
              onChange={(val)=>{
                handleChange(val, "is_points");
              }}
            />
          </Cell>
          {goodsForm.is_points === 1 ? (
            <Field
              required
              title="最大可用积分"
              titleWidth={100}
              type="digit"
              placeholder="请输入积分数量"
              value={goodsForm.max_points}
              errorIcon={false}
              error={!!errTips.max_points}
              errorMessage={errTips.max_points}
              onChange={(val)=>{handleChange(val,"max_points","","积分数量不能为空");}}
            />
          ) : null}
          {renderGoodsReal()}
          {goodsForm.type !== 8 && goodsReal.sale_mode !== 2 ? (
            <Field
              title="开售时间"
              titleWidth={100}
              input={false}
              arrow
              clickable
              value={!goodsForm.time_sale_time ? "立即开售" : goodsForm.time_sale_time}
              onClick={() => {
                navigateTo({ url: "/pages/shop/edit/sale-time/index", method: "navigateTo", params: { time: goodsForm.time_sale_time, refs: refs, type: "saleTime" } });
              }}
            />
          ) : null}
          {renderGoodsCard()}
          {goodsForm.type === 6 ? (
            <Field
              title="订单确认时间"
              titleWidth={100}
              type="digit"
              value={goodsHotel.confirm_time}
              placeholder="下单后多长时间内确定订单"
              right="分钟"
              onChange={(val) => {
                handleHotelChange(val,"confirm_time");
              }}
            />
          ) : null}
        </View>
        {goodsForm.type !== 8 ? (
          <React.Fragment>
            <View className="card card--full">
              <Field
                border={false}
                required
                title="商品至少"
                titleWidth={100}
                type="digit"
                placeholder="请输入整数"
                value={goodsForm.pay_limit.limit_pay_min}
                errorIcon={false}
                error={!!errTips["pay_limit-limit_pay_min"]}
                errorMessage={errTips["pay_limit-limit_pay_min"]}
                right="件起售"
                onChange={(val)=>{
                  handleChange(val, "limit_pay_min", "pay_limit","每单最低购买数量不能为空");
                }}
              />
              <Field
                title="限购数量"
                titleWidth={100}
                input={false}
                arrow
                clickable
                placeholder="请选择"
                value={["不限购","每单","终身", "每天", "每周", "每月", "每年"][goodsForm.pay_limit.limit_pay_quota === - 1 ? 0 : goodsForm.pay_limit.limit_pay_quota]}
                onClick={()=>{
                  Taro.showActionSheet({
                    itemList: ["不限购","每单","终身", "每天", "每周", "每月", "每年"],
                    success: function (res) {
                      const val = res.tapIndex === 0 ? -1 : res.tapIndex;
                      handleChange(val, "limit_pay_quota", "pay_limit");
                    }
                  });
                }}
              />
              {goodsForm.pay_limit.limit_pay_quota !== - 1 ? (
                <Field
                  required
                  title={`${["不限购","每单","终身", "每天", "每周", "每月", "每年"][goodsForm.pay_limit.limit_pay_quota === - 1 ? 0 : goodsForm.pay_limit.limit_pay_quota]}限购`}
                  titleWidth={100}
                  type="digit"
                  placeholder="请输入整数"
                  value={goodsForm.pay_limit.limit_pay_quota_num}
                  right="件"
                  errorIcon={false}
                  error={!!errTips["pay_limit-limit_pay_quota_num"]}
                  errorMessage={errTips["pay_limit-limit_pay_quota_num"]}
                  onChange={(val)=>{
                    handleChange(val, "limit_pay_quota_num", "pay_limit","限购数量不能为空");
                  }}
                />
              ) : null}
              <Field
                input={false}
                value="只允许特定用户购买"
                right={
                  <Switch
                    checked={goodsForm.pay_limit.limit_user_check}
                    onChange={(val)=>{
                      handleChange(val, "limit_user_check", "pay_limit");
                    }}
                  />
                }
                errorIcon={false}
                error={!!errTips.limit_user_check}
                errorMessage={errTips.limit_user_check}
              />
              {goodsForm.pay_limit.limit_user_check ? (
                <React.Fragment>
                  <Field
                    title="权益卡"
                    titleWidth={100}
                    input={false}
                    placeholder="请选择权益卡"
                    arrow
                    clickable
                    value={mcardList.length > 0 ? `已选择(${mcardList.length})项` : ""}
                    onClick={() => {
                      navigateTo({ url: "/pages/com/member-card-select/index", method: "navigateTo", params: { ids: mcardList, refs: refs, type: "memberCard", multiple: true } });
                    }}
                  />
                  <Field
                    title="会员身份"
                    titleWidth={100}
                    input={false}
                    placeholder="请选择会员身份"
                    arrow
                    clickable
                    value={levelList.length > 0 ? `已选择(${levelList.length})项` : ""}
                    onClick={() => {
                      navigateTo({ url: "/pages/com/level-select/index", method: "navigateTo", params: { ids: levelList, refs: refs, type: "level", multiple: true } });
                    }}
                  />
                  {/* <Field*/}
                  {/*  title="用户标签"*/}
                  {/*  titleWidth={100}*/}
                  {/*  input={false}*/}
                  {/*  placeholder="请选择用户标签"*/}
                  {/*  arrow*/}
                  {/*  clickable*/}
                  {/*  value={userTagsList.length > 0 ? `已选择(${userTagsList.length})项` : ""}*/}
                  {/* />*/}
                </React.Fragment>
              ) : null}
            </View>
            <View className="card-tips card-tips--full">打开购买权限后，用户满足任一权益卡、会员身份或用户标签条件，即可购买</View>
            <View className="card card--full">
              <Field
                border={false}
                title="留言"
                titleWidth={100}
                input={false}
                arrow
                clickable
                value={goodsForm.goods_word.map(item=>item.name).join("；")}
                placeholder="设置留言"
                onClick={()=>{
                  navigateTo({
                    method:"navigateTo",
                    url: "/pages/shop/edit/words/index",
                    params: {
                      words: goodsForm.goods_word,
                      type: goodsForm.type
                    }
                  });
                }}
              />
            </View>
            <View className="card-tips card-tips--full">
              购买商品时让买家输入留言，最多可设置10条留言 ，勾选多次填写时，将由商品购买的数量决定填写的次数
            </View>
          </React.Fragment>
        ) : null}
      </ScrollView>
      <BottomBar>
        <Button
          loading={loading}
          style={{ width: "70%" }}
          type="info"
          onClick={saveClick}
        >
          保存
        </Button>
      </BottomBar>
      <Popup
        title={popup.title}
        show={popup.show}
        bgColor="#f7f8f8"
        onClose={closePopup}
        action={popup.type === "expressType" ? (
          <Button
            style={{ width: "70%" }}
            type="primary"
            onClick={closePopup}
          >
            确定
          </Button>
        ) : null}
      >
        {popup.type === "goodsType" ? (
          <View className="card">
            {goodsTypeList.map((item: any, index) => {
              return (
                <Radio
                  key={`goodsType-${index}`}
                  cell
                  type="check"
                  style={{ paddingTop: addUnit(14), paddingBottom: addUnit(14), paddingLeft: addUnit(16), paddingRight: addUnit(16) }}
                  border={index !== 0}
                  label={item.label}
                  labelStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                  desc={item.desc}
                  value={item.value}
                  checked={goodsForm.type === item.value}
                  onChange={(val) => {
                    if (val === 6) {
                      let _goods_word = [
                        {
                          id: 100,
                          name: "住客姓名",
                          type: 1,
                          is_multi_row: false,
                          is_required: true,
                          is_single: true
                        },
                        {
                          id: 101,
                          name: "手机号码",
                          type: 8,
                          is_multi_row: false,
                          is_required: true,
                          is_single: false
                        }
                      ];
                      handleChange(_goods_word,"goods_word");
                    } else {
                      handleChange([],"goods_word");
                    }
                    handleChange(val,"type");
                    closePopup();
                  }}
                />
              );
            })}
          </View>
        ) : null}

        {popup.type === "stockType" ? (
          <View className="card">
            <Radio
              border={false}
              cell
              type="check"
              style={{ paddingTop: addUnit(16), paddingBottom: addUnit(16), paddingLeft: addUnit(16), paddingRight: addUnit(16) }}
              label="拍下减库存"
              labelStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
              desc="买家提交订单扣减库存数量，可能存在恶意占用库存风险"
              value={1}
              checked={goodsForm.stock_type === 1}
              onChange={(val) => {
                handleChange(val,"stock_type");
                closePopup();
              }}
            />
            <Radio
              cell
              type="check"
              style={{ paddingTop: addUnit(16), paddingBottom: addUnit(16), paddingLeft: addUnit(16), paddingRight: addUnit(16) }}
              label="付款减库存"
              labelStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
              desc="买家支付成功扣减库存数量，可能存在超卖风险"
              value={2}
              checked={goodsForm.stock_type === 2}
              onChange={(val) => {
                handleChange(val,"stock_type");
                closePopup();
              }}
            />
          </View>
        ) : null}

        {popup.type === "expressType" ? (
          <View className="card">
            {freightList.map((item ,index)=>{
              if(item.type.indexOf(goodsForm.type) === -1) return null;
              return (
                <Checkbox
                  key={`freight-${index}`}
                  cell
                  border={index !== 0}
                  checked={item.checked}
                  label={item.label}
                  labelStyle={{ fontSize: addUnit(16) }}
                  style={{ paddingTop: addUnit(16), paddingBottom: addUnit(16) }}
                  onChange={()=>{
                    setFreightList(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp[index].checked = !item.checked;
                      temp.map(state=>{
                        if((item.value === 1 || item.value === 2) && state.value === 4){
                          state.checked = false;
                        }
                        if((state.value === 1 || state.value === 2) && item.value === 4){
                          state.checked = false;
                        }
                      });
                      return temp;
                    });
                    setFreightForm(prevState=>{
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp.price = item.value === 1 || item.value === 2 ? -1 : "";
                      return temp;
                    });
                    errTipsChange(true, "freight");
                  }}
                />
              );
            })}
          </View>
        ) : null}
      </Popup>
    </View>
  );
};

export default GoodsEdit;
