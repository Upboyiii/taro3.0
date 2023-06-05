import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { formatPrice, getTimeStamp, secToDate } from "@/utils/common";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { getMainStore } from "@/utils/app";
import Field from "@/components/field";
import Button from "@/components/button";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const CouponEdit: FC = () => {

  const _id = getCurrentInstance().router?.params?.id;
  const _approval = getCurrentInstance().router?.params?.approval;
  const _title = !!_id ? "编辑优惠券" : "创建优惠券";
  const mainStore = getMainStore();// 店铺类型

  const init = {
    id: 0,
    activity_ext: {
      is_alipay_sync: 1, // 同步支付宝卡券 1不同步 2同步
      is_hand_sel: 1, // 转赠设置 1不可转赠 2允许转赠给好友
      is_wechat_sync: 1, // 同步微信卡券 1不同步 2同步
      rcmd_goods_ids: [], // 推荐商品ID数据
      rcmd_goods_mode: 1 // 推荐商品 1个性化推荐 2最新上架 3自定义商品
    },
    discount: {
      cut_money: "", // 减免金额 (满减券规则)
      discount: "", // 折扣（最大100）(折扣券规则)
      goods_ids: [], // 可兑换商品 (商品兑换券)
      max_money: "", // 最多优惠 (折扣券、随机券规则)
      min_money: "" // 最少优惠 (随机券规则)
    },
    expire_notice: -1, // 过期前几天提醒 -1不启用
    goods_ids: [], // 适用商品ID列表
    goods_type: 1, // 适用商品类型 1全部商品可用 2指定商品可用 3指定商品不可用
    is_hide: 2, // 隐藏设置 1隐藏 2不隐藏
    is_overlay: 1, // 优惠叠加 优惠券仅原价购买时可用
    is_public: 2, // 公开领取 1不公开 2公开
    is_sharable: 1, // 分享设置 1不可分享 2可分享
    limit_list: [], // 领取人限制 指定客户身份数据
    limit_num: -1, // 每人限领次数 -1不限次数 大于1领取次数
    limit_type: 1, //  领取人限制 1不限制 2指定客户身份
    name: "", // 优惠券名称 50 个字符以内
    title: "", // 名称备注
    reason: "", // 申请原因 (分店可添加优惠券且需要审批时使用)
    scene: 1, //  适用渠道 1全渠道适用 2线下门店专享
    state: 1, // 状态 1正常 2下架 3申请 4禁用
    store: [-1], // 适用店铺 -1 适用所有
    type: 1, // 优惠券类型 1满减券 2折扣券 3随机金额券 4商品兑换券
    use_mode: 1, // 用券模式 1指定时间 2领券当日起 3领券次日起
    use_note: "", // 使用说明 255
    use_rule: {
      time_use_end: "", // 用券结束时间 1指定开始时间
      time_use_start: "", //  用券开始时间 1指定开始时间
      use_day: "" // 用券时间 2、3时指定天数
    },
    use_total_qty: "", // 发放总量
    use_total: 0,
    using_amount: -1 // 使用门槛 -1无使用门槛 订单满多少元
  };
  const [levelList, setLevelList] = useState<any[]>([]);
  const [mcardList, setMcardList] = useState<any[]>([]);
  const [form, setForm] = useState(init);
  const [approval, setApproval] = useState("2");
  const [loading, setLoading] = useState(false);
  const getDetail = (id) => {
    setLoading(true);
    pluginApi.plugin("POST", 164, "info", JSON.stringify({ id: id }), 481682)
      .then(res => {
        if (!!res && res.code === 0) {
          const data = res?.data || {};

          data.use_total = data?.coupon_stock?.stock_num || 0;
          data.using_amount = data.using_amount !== -1 ? formatPrice(data.using_amount) : -1;
          data.discount = {
            cut_money: data.discount.cut_money ? formatPrice(data.discount.cut_money) : "",
            discount: data.discount.discount ? (data.discount.discount / 10).toFixed(1) : "",
            goods_ids: data.discount.goods_ids ? data.discount.goods_ids : [],
            max_money: data.discount.max_money ? formatPrice(data.discount.max_money) : "",
            min_money: data.discount.min_money ? formatPrice(data.discount.min_money) : ""
          };
          data.use_rule = {
            time_use_start: data.use_rule.use_start ? secToDate(data.use_rule.use_start, "{y}-{M}-{d}") : "",
            time_use_end: data.use_rule.use_end ? secToDate(data.use_rule.use_end, "{y}-{M}-{d}") : "",
            use_day: data.use_rule.use_day ? data.use_rule.use_day : ""
          };
          if(data.limit_type === 2 && data.limit_list && data.limit_list.length > 0){
            const _level = data.limit_list.filter(item=>item.bind_type === 1).map(item=>item.bind_id);
            const _mcard = data.limit_list.filter(item=>item.bind_type === 2).map(item=>item.bind_id);
            setLevelList(_level);
            setMcardList(_mcard);
          }
          // console.log(data,"data");

          setForm(Object.assign({}, init, data));
        }else{
          Taro.showToast({ title: res.message, icon: "none" });
        }
      }).catch(res=>{
        Taro.showToast({ title: res.message, icon: "none" });
      }).finally(()=>{
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!!_id) {
      Taro.setNavigationBarTitle({ title: _title });
      setApproval(_approval || "2");
      getDetail(parseInt(_id));
    }
  }, []);

  useEffect(() => {
    eventCenterOn("couponSelect", (res) => {
      if(!!res[0]){
        if(!!res[0]?.type){
          if(res[0]?.type === "store"){
            handleValueChange(res[0]?.ids,"store");
          }
          if(res[0]?.type === "goods"){
            handleValueChange(res[0]?.ids,"goods_ids");
          }
          if(res[0]?.type === "level"){
            setLevelList(res[0]?.ids);
          }
          if(res[0]?.type === "memberCard"){
            setMcardList(res[0]?.ids);
          }
        }
      }
      // console.log(res[0],"res");
    });

    return () => {
      eventCenterOff("couponSelect");
    };
  }, []);

  const handleValueChange = (val, ref, father = "") => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(!!father){
        temp[father][ref] = val;
      }else{
        temp[ref] = val;
      }
      return temp;
    });
  };

  const saveClick = (state = 0) => {
    let _form = JSON.parse(JSON.stringify(form));
    if (!!state) {
      _form.state = state;
    }
    if (!_form.name) {
      Taro.showToast({ title: "请输入优惠券名称", icon: "none" });
      return;
    }
    if (!_form.use_total_qty) {
      if (!_form.id) {
        Taro.showToast({ title: "请填写发放总量", icon: "none" });
        return;
      }else{
        _form.use_total_qty = 0;
      }
    }else{
      _form.use_total_qty = parseInt(_form.use_total_qty);
      if (_form.use_total_qty > 100000000) {
        Taro.showToast({ title: `${!_form.id ? "发放总量" : "增发总量"}不能超过10000000张`, icon: "none" });
        return;
      }
      if (!_form.id && _form.use_total_qty < 1) {
        Taro.showToast({ title: "发放总量至少需要1张", icon: "none" });
        return;
      }
    }
    if(_form.store.length === 0){
      Taro.showToast({ title: "请选择适用店铺", icon: "none" });
      return;
    }
    if((_form.type === 4 || _form.goods_type !== 1) && _form.goods_ids.length === 0){
      Taro.showToast({ title: "请选择商品", icon: "none" });
      return;
    }

    if (_form.using_amount !== -1) {
      if (!_form.using_amount) {
        Taro.showToast({ title: "请输入门槛金额", icon: "none" });
        return;
      }else{
        _form.using_amount = parseFloat(_form.using_amount) * 100;
        if (_form.using_amount > 10000000) {
          Taro.showToast({ title: "使用门槛金额不能超过100000元", icon: "none" });
          return;
        }
      }
    }

    if (_form.type === 1) {
      if (!_form.discount.cut_money) {
        Taro.showToast({ title: "请输入减免金额", icon: "none" });
        return;
      }else{
        _form.discount.cut_money = parseFloat(_form.discount.cut_money) * 100;
        if (_form.discount.cut_money > 10000000) {
          Taro.showToast({ title: "使用门槛金额不能超过100000元", icon: "none" });
          return;
        }
        _form.discount = {
          cut_money: _form.discount.cut_money
        };
      }
    }else if (_form.type === 2) {
      if (!_form.discount.discount) {
        Taro.showToast({ title: "请输入优惠折扣", icon: "none" });
        return;
      }else{
        _form.discount.discount = parseFloat(_form.discount.discount) * 10;
        if (_form.discount.discount > 99) {
          Taro.showToast({ title: "优惠不能超过9.9折", icon: "none" });
          return;
        }
      }
      if(_form.discount.max_money !== ""){
        _form.discount.max_money = parseFloat(_form.discount.max_money) * 100;
        if (_form.discount.max_money === 0) {
          Taro.showToast({ title: "最多优惠金额必须大于0元，或者不填", icon: "none" });
          return;
        }
        _form.discount = {
          discount: _form.discount.discount,
          max_money:  _form.discount.max_money
        };
      }else{
        _form.discount = {
          discount: _form.discount.discount
        };
      }
    }else if (_form.type === 3) {
      if (!_form.discount.min_money) {
        Taro.showToast({ title: "请输入随机减最小金额", icon: "none" });
        return;
      }else{
        _form.discount.min_money = parseFloat(_form.discount.min_money) * 100;
      }
      if (!_form.discount.max_money) {
        Taro.showToast({ title: "请输入随机减最大金额", icon: "none" });
        return;
      }else{
        _form.discount.max_money = parseFloat(_form.discount.max_money) * 100;
      }
      if (_form.discount.min_money >= _form.discount.max_money) {
        Taro.showToast({ title: "随机减最大金额必须大于最小金额", icon: "none" });
        return;
      }
      _form.discount = {
        min_money: _form.discount.min_money,
        max_money: _form.discount.max_money
      };
    }else{
      _form.discount = {};
    }

    if (_form.use_mode === 1) {
      if (!_form.use_rule.time_use_start) {
        Taro.showToast({ title: "请选择用券开始日期", icon: "none" });
        return false;
      }else{
        _form.use_rule.time_use_start = _form.use_rule.time_use_start + " 00:00:00";
      }
      if (!_form.use_rule.time_use_end) {
        Taro.showToast({ title: "请选择用券结束日期", icon: "none" });
        return false;
      }else{
        _form.use_rule.time_use_end = _form.use_rule.time_use_end + " 00:00:00";
      }
      if (getTimeStamp(_form.use_rule.time_use_start) >= getTimeStamp(_form.use_rule.time_use_end)) {
        Taro.showToast({ title: "用券结束日期必须大于开始日期", icon: "none" });
        return false;
      }
      delete _form.use_rule.use_day;
    }else{
      if (!_form.use_rule.use_day) {
        Taro.showToast({ title: "请输入用券可用天数", icon: "none" });
        return false;
      }
      _form.use_rule.use_day = parseInt(_form.use_rule.use_day);
      if (_form.use_rule.use_day < 1 || _form.use_rule.use_day > 2000) {
        Taro.showToast({ title: "用券可用天数需在1~2000之间", icon: "none" });
        return false;
      }
      delete _form.use_rule.time_use_start;
      delete _form.use_rule.time_use_end;
    }

    _form.limit_list = [];
    if (_form.limit_type === 2) {
      if(levelList.length === 0 && mcardList.length === 0){
        Taro.showToast({ title: "客户身份至少选择一种", icon: "none" });
        return false;
      }
      if(levelList.length > 0){
        const _level = levelList.map(id=>{
          return {
            bind_id: id,
            bind_type: 1
          };
        });
        _form.limit_list = _form.limit_list.concat(_level);
      }
      if(mcardList.length > 0){
        const _mcard = mcardList.map(id=>{
          return {
            bind_id: id,
            bind_type: 2
          };
        });
        _form.limit_list = _form.limit_list.concat(_mcard);
      }
    }

    if (_form.limit_num !== -1) {
      if (!_form.limit_num) {
        Taro.showToast({ title: "请输入限领次数", icon: "none" });
        return;
      }else{
        _form.limit_num = parseInt(_form.limit_num);
        if (_form.limit_num < 1 || _form.limit_num > 100) {
          Taro.showToast({ title: "限领次数必须在1~100之间", icon: "none" });
          return;
        }
      }
    }

    if (_form.expire_notice !== -1) {
      if (!_form.expire_notice) {
        Taro.showToast({ title: "请输入过期前几天天数", icon: "none" });
        return;
      }else{
        _form.expire_notice = parseInt(_form.expire_notice);
        if (_form.expire_notice < 1 || _form.expire_notice > 15) {
          Taro.showToast({ title: "过期天数必须在1~15之间", icon: "none" });
          return;
        }
      }
    }

    // console.log(_form,"_form");
    setLoading(true);
    pluginApi .plugin("PUT", 164,"save",JSON.stringify(_form))
      .then((res) => {
        // console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("couponEdit" );
          navigateTo({ method: "navigateBack" });
        }else{
          Taro.showToast({ title: res?.message || "保存失败", icon: "error" });
        }
      })
      .catch(res=>{
        Taro.showToast({ title: res?.message || "保存失败", icon: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const stateClick = (state, title = "") => {
    if(state === 2){
      Taro.showModal({
        title: `${title}此优惠券？`,
        content: "优惠券下架后，无法继续编辑优惠券内容；买家无法再领取该优惠券，但之前已领取的优惠券，在有效期内仍可继续使用。",
        cancelText: "我再想想",
        confirmText: `确定${title}`,
        confirmColor: "#ff2340",
        success: function (res) {
          if (res.confirm) {
            saveClick(2);
          }
        }
      });
    }else{
      saveClick(1);
    }
  };

  const deleteClick = () => {
    Taro.showModal({
      title: "删除此优惠券？",
      content: "删除此优惠券后将不可恢复，买家领取的此优惠券也将无效",
      cancelText: "我再想想",
      confirmText: "确定删除",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          pluginApi .plugin("DELETE", 164,"delete",JSON.stringify({ id: Number(form.id) }))
            .then((res) => {
              // console.log(res,"res");
              if (!!res && res.code === 0) {
                eventCenterTrigger("couponEdit" );
                navigateTo({ method: "navigateBack" });
              }else{
                Taro.showToast({ title: res?.message || "删除失败", icon: "error" });
              }
            })
            .catch(res=>{
              Taro.showToast({ title: res?.message || "删除失败", icon: "error" });
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <KeyboardAwareScrollView extraScrollHeight={40}>
        <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
          <View className="card-title">基本设置</View>
          <View className="card">
            <Field
              border={false}
              title="优惠券类型"
              titleWidth={90}
              input={false}
              value={["满减券", "折扣券", "随机金额券", "商品兑换券"][form.type - 1]}
              arrow={!_id}
              clickable
              onClick={()=>{
                if(!!_id) return;
                Taro.showActionSheet({
                  itemList: ["满减券", "折扣券", "随机金额券", "商品兑换券"],
                  success: function (res) {
                    const index = res.tapIndex;
                    handleValueChange(index + 1, "type");
                  }
                });
              }}
            />
            <Field
              required
              title="优惠券名称"
              titleWidth={90}
              maxlength={10}
              showWordLimit
              value={form.name}
              placeholder="如双11优惠券，最多10个字"
              onChange={(val) => {
                handleValueChange(val, "name");
              }}
            />
            <Field
              title="名称备注"
              titleWidth={90}
              maxlength={10}
              showWordLimit
              value={form.title}
              placeholder="仅内部可见，最多10个字"
              onChange={(val) => {
                handleValueChange(val, "title");
              }}
            />
            <Field
              required={!form.id}
              title={!form.id ? "发放总量" : "增发数量"}
              titleWidth={90}
              type="digit"
              value={form.use_total_qty}
              placeholder="最多100000000张"
              rightStyle={{ fontSize: addUnit(12) }}
              right={!!form.use_total ? `当前库存${form.use_total}张` : ""}
              onChange={(val) => {
                handleValueChange(val, "use_total_qty");
              }}
            />
          </View>
          <View className="card">
            <Field
              border={false}
              title="适用渠道"
              titleWidth={90}
              input={false}
              value={["全渠道适用", "线下门店专享"][form.scene - 1]}
              arrow
              clickable
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: ["全渠道适用", "线下门店专享"],
                  success: function (res) {
                    const index = res.tapIndex;
                    handleValueChange(index + 1, "scene");
                  }
                });
              }}
            />
          </View>
          {form.scene === 2 ? (
            <View className="card-tips">线下门店专享券，无须选择适用商品，可根据门店实际情况将适用规则添加在券的“使用说明”中展示给消费者。</View>
          ) : null}
          <View className="card">
            {mainStore === 1 && form.state !== 3 ? (
              <React.Fragment>
                <Field
                  border={false}
                  title="适用店铺"
                  titleWidth={90}
                  input={false}
                  value={form.store.indexOf(-1) > -1 ? "全部店铺" : "指定店铺"}
                  arrow
                  clickable
                  onClick={() => {
                    Taro.showActionSheet({
                      itemList: ["全部店铺", "指定店铺"],
                      success: function (res) {
                        if (res.tapIndex === 0) {
                          handleValueChange([-1], "store");
                        } else {
                          handleValueChange([], "store");
                        }
                      }
                    });
                  }}
                />
                {form.store.indexOf(-1) === -1 ? (
                  <React.Fragment>
                    <Cell
                      title="选择店铺"
                      titleStyle={{ width: addUnit(90) }}
                      contentAlign="left"
                      contentStyle={form.store.length > 0 ? {} : { color: "#ccc" }}
                      content={form.store.length > 0 ? `已选择(${form.store.length})家店铺` : "请选择店铺"}
                      arrow
                      clickable
                      onClick={() => {
                        navigateTo({ url: "/pages/com/store-select/index", method: "navigateTo", params: { ids: form.store, refs: "couponSelect", type: "store", multiple: true } });
                      }}
                    />
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : null}
            {form.type !== 4 ? (
              <Field
                border={mainStore === 1 && form.state !== 3}
                title="适用商品"
                titleWidth={90}
                input={false}
                value={["全部商品可用", "指定商品可用","指定商品不可用"][form.goods_type - 1]}
                arrow
                clickable
                onClick={()=>{
                  Taro.showActionSheet({
                    itemList: ["全部商品可用", "指定商品可用","指定商品不可用"],
                    success: function (res) {
                      const index = res.tapIndex;
                      handleValueChange(index + 1, "goods_type");
                    }
                  });
                }}
              />
            ) : null}
            {form.type === 4 || form.goods_type !== 1 ? (
              <Cell
                title={form.type === 4 ? "兑换商品" : "选择商品"}
                titleStyle={{ width: addUnit(90) }}
                contentAlign="left"
                contentStyle={form.goods_ids.length > 0 ? {} : { color: "#ccc" }}
                content={form.goods_ids.length > 0 ? `已选择(${form.goods_ids.length})件商品` : "请选择商品"}
                arrow
                clickable
                onClick={() => {
                  navigateTo({ url: "/pages/com/goods-select/index", method: "navigateTo", params: { ids: form.goods_ids, refs: "couponSelect", mode: "goods", multiple: true, sys: -1 } });
                }}
              />
            ) : null}
          </View>
          <View className="card">
            <Field
              border={false}
              title={`${form.type === 4 ? "兑换" : "使用"}门槛`}
              titleWidth={90}
              input={false}
              value={form.using_amount === -1 ? `无${form.type === 4 ? "兑换" : "使用"}门槛` : "订单满固定金额课使用"}
              arrow
              clickable
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: [`无${form.type === 4 ? "兑换" : "使用"}门槛`, "订单满固定金额可使用"],
                  success: function (res) {
                    const index = res.tapIndex;
                    handleValueChange(index === 0 ? -1 : "", "using_amount");
                  }
                });
              }}
            />
            {form.using_amount !== -1 ? (
              <Field
                required
                title="门槛金额"
                titleWidth={90}
                type="number"
                value={form.using_amount}
                placeholder="最多100000元"
                right="元"
                onChange={(val) => {
                  handleValueChange(val, "using_amount");
                }}
              />
            ) : null}
          </View>
          {form.type !== 4 ? (
            <React.Fragment>
              <View className="card">
                {form.type === 1 ? (
                  <Field
                    border={false}
                    required
                    title="减免金额"
                    titleWidth={90}
                    type="number"
                    value={form.discount.cut_money}
                    placeholder="最多100000元"
                    right="元"
                    onChange={(val) => {
                      handleValueChange(val, "cut_money", "discount");
                    }}
                  />
                ) : form.type === 2 ? (
                  <React.Fragment>
                    <Field
                      border={false}
                      required
                      title="优惠折扣"
                      titleWidth={90}
                      type="number"
                      value={form.discount.discount}
                      placeholder="例：9折"
                      right="折"
                      onChange={(val) => {
                        handleValueChange(val, "discount", "discount");
                      }}
                    />
                    <Field
                      title="最多优惠"
                      titleWidth={90}
                      type="number"
                      value={form.discount.max_money}
                      placeholder="不填则不限制"
                      right="元"
                      onChange={(val) => {
                        handleValueChange(val, "max_money", "discount");
                      }}
                    />
                  </React.Fragment>
                ) : form.type === 3 ? (
                  <Field
                    border={false}
                    required
                    title="范围内随机减"
                    titleWidth={90}
                    input={false}
                    inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 0, paddingBottom: 0 }}
                  >
                    <Field
                      border={false}
                      type="number"
                      placeholder="最小金额"
                      maxlength={6}
                      value={form.discount.min_money}
                      onChange={(val)=>{handleValueChange(val, "min_money", "discount");}}
                      style={{ paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 }}
                    />
                    <View style={{ paddingRight: addUnit(16), color: "#666" }}>至</View>
                    <Field
                      border={false}
                      type="number"
                      placeholder="最大金额"
                      maxlength={6}
                      value={form.discount.max_money}
                      onChange={(val)=>{handleValueChange(val, "max_money", "discount");}}
                      style={{ paddingTop: 0, paddingBottom: 0, flex: 1 }}
                    />
                  </Field>
                ) : null}
              </View>
              <View className="card-tips">
                优惠内容是商家单独给消费者的优惠金额，设置大额优惠金额时需谨慎，以免造成资损。
              </View>
            </React.Fragment>
          ) : null}
          <View className="card">
            <Field
              border={false}
              title="用券时间"
              titleWidth={90}
              input={false}
              value={["固定日期", "领券当日起", "领券次日起"][form.use_mode - 1]}
              arrow
              clickable
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: ["固定时间", "领券当日起", "领券次日起"],
                  success: function (res) {
                    const index = res.tapIndex;
                    handleValueChange(index + 1, "use_mode");
                  }
                });
              }}
            />
            {form.use_mode === 1 ? (
              <React.Fragment>
                <Picker
                  mode="date"
                  value={form.use_rule.time_use_start}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time,"time_use_start", "use_rule");
                  }}
                >
                  <Cell
                    titleStyle={{ width: addUnit(90) }}
                    title="开始日期"
                    contentAlign="left"
                    contentStyle={!form.use_rule.time_use_start ? { color: "#ccc" } : {}}
                    content={!!form.use_rule.time_use_start ? form.use_rule.time_use_start : "请选择开始日期"}
                    arrow
                  />
                </Picker>
                <Picker
                  mode="date"
                  value={form.use_rule.time_use_end}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time,"time_use_end", "use_rule");
                  }}
                >
                  <Cell
                    titleStyle={{ width: addUnit(90) }}
                    title="结束日期"
                    contentAlign="left"
                    contentStyle={!form.use_rule.time_use_end ? { color: "#ccc" } : {}}
                    content={!!form.use_rule.time_use_end ? form.use_rule.time_use_end : "请选择结束日期"}
                    arrow
                  />
                </Picker>
              </React.Fragment>
            ) : (
              <Field
                required
                title="可用天数"
                titleWidth={90}
                type="digit"
                value={form.use_rule.use_day}
                placeholder="请输入1~2000之间的整数"
                right="天"
                onChange={(val) => {
                  handleValueChange(val, "use_day", "use_rule");
                }}
              />
            )}
          </View>
          <View className="card">
            <Cell
              border={false}
              title="优惠叠加（仅原价购买时可用）"
              content={
                <Switch
                  checked={form.is_overlay === 2}
                  inactiveValue={1}
                  activeValue={2}
                  onChange={(val)=>{
                    handleValueChange(val, "is_overlay");
                  }}
                />
              }
            />
          </View>
          {form.is_overlay === 2 ? (
            <View className="card-tips">
              勾选后，若商品参与限时折扣、多人拼团、满减/送等营销活动，则不可使用此优惠券/码。
              积分抵现仍可与优惠券/码同时使用。
            </View>
          ) : (
            <View className="card-tips">
              若希望活动商品同时参与满减/送等其他活动， 需在对应类型的活动配置中同时设置与优惠券/码叠加才可生效。
            </View>
          )}
          <View className="card-title">领取和使用规则</View>
          <View className="card">
            <Field
              border={false}
              title="领取人限制"
              titleWidth={90}
              input={false}
              value={["不限制，所有人可领", "指定客户身份"][form.limit_type - 1]}
              clickable
              arrow
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: ["不限制，所有人可领", "指定客户身份"],
                  success: function (res) {
                    const index = res.tapIndex;
                    handleValueChange(index + 1, "limit_type");
                  }
                });
              }}
            />
            {form.limit_type === 2 ? (
              <React.Fragment>
                <Cell
                  title="会员等级"
                  titleStyle={{ width: addUnit(90) }}
                  contentAlign="left"
                  contentStyle={levelList.length > 0 ? {} : { color: "#ccc" }}
                  content={levelList.length > 0 ? `已选择(${levelList.length})` : "请选择会员等级"}
                  arrow
                  clickable
                  onClick={() => {
                    navigateTo({ url: "/pages/com/level-select/index", method: "navigateTo", params: { ids: levelList, refs: "couponSelect", type: "level", multiple: true } });
                  }}
                />
                <Cell
                  title="拥有权益卡"
                  titleStyle={{ width: addUnit(90) }}
                  contentAlign="left"
                  contentStyle={mcardList.length > 0 ? {} : { color: "#ccc" }}
                  content={mcardList.length > 0 ? `已选择(${mcardList.length})` : "请选择权益卡"}
                  arrow
                  clickable
                  onClick={() => {
                    navigateTo({ url: "/pages/com/member-card-select/index", method: "navigateTo", params: { ids: mcardList, refs: "couponSelect", type: "memberCard", multiple: true } });
                  }}
                />
              </React.Fragment>
            ) : null}
            <Field
              title="每人限领次数"
              titleWidth={90}
              input={false}
              value={form.limit_num === -1 ? "不限次数" : "限制固定次数"}
              arrow
              clickable
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: ["不限次数","限制固定次数"],
                  success: function (res) {
                    const index = res.tapIndex;
                    handleValueChange(index === 0 ? -1 : "", "limit_num");
                  }
                });
              }}
            />
            {form.limit_num !== -1 ? (
              <Field
                required
                title="每人限领"
                titleWidth={90}
                type="digit"
                value={form.limit_num}
                placeholder="请输入1~100之间的整数"
                right="次"
                onChange={(val) => {
                  handleValueChange(val, "limit_num");
                }}
              />
            ) : null}
          </View>
          <View className="card-tips">
            限领限制对用户主动领取时生效，部分活动发放时不生效。
          </View>
          <View className="card">
            <Cell
              border={false}
              title="允许分享给好友领取"
              content={
                <Switch
                  checked={form.is_sharable === 2}
                  inactiveValue={1}
                  activeValue={2}
                  onChange={(val)=>{
                    handleValueChange(val, "is_sharable");
                  }}
                />
              }
            />
            <Cell
              title="允许转赠给好友"
              content={
                <Switch
                  checked={form.activity_ext.is_hand_sel === 2}
                  inactiveValue={1}
                  activeValue={2}
                  onChange={(val)=>{
                    handleValueChange(val, "is_hand_sel","activity_ext");
                  }}
                />
              }
            />
            <Cell
              title="允许公开领取"
              content={
                <Switch
                  checked={form.is_public === 2}
                  inactiveValue={1}
                  activeValue={2}
                  onChange={(val)=>{
                    handleValueChange(val, "is_public");
                  }}
                />
              }
            />
            <Cell
              title="隐藏推广链接"
              content={
                <Switch
                  checked={form.is_hide === 1}
                  inactiveValue={2}
                  activeValue={1}
                  onChange={(val)=>{
                    handleValueChange(val, "is_hide");
                  }}
                />
              }
            />
          </View>
          <View className="card">
            <Field
              border={false}
              title="过期提醒"
              titleWidth={90}
              input={false}
              value={form.expire_notice === -1 ? "不提醒" : "过期前几天提醒"}
              arrow
              clickable
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: ["不提醒","过期前几天提醒"],
                  success: function (res) {
                    const index = res.tapIndex;
                    handleValueChange(index === 0 ? -1 : "", "expire_notice");
                  }
                });
              }}
            />
            {form.expire_notice !== -1 ? (
              <Field
                required
                title="优惠券过期前"
                titleWidth={90}
                type="digit"
                value={form.expire_notice}
                placeholder="请输入1~15之间的整数"
                right="天提醒"
                onChange={(val) => {
                  handleValueChange(val, "expire_notice");
                }}
              />
            ) : null}
          </View>
          <View className="card-tips">
            开启后可在“应用中心-消息推送-优惠券过期提醒”处配置消息发送方式。根据《微信公众平台运营规范》，频繁发送营销类模板消息存在被封禁的风险
          </View>
          <View className="card">
            <Field
              border={false}
              title="使用说明"
              titleWidth={90}
              titleRow
              type="textarea"
              value={form.use_note}
              placeholder={"例：双11优惠券\n" +
                "使用时间：2021-11-11 00:00:00 - 2021-11-11 23:59:59\n" +
                "优惠内容：部分商品，满88元8.8折优惠券\n" +
                "其他限制：仅原价购买商品时可用券"}
              onChange={(val) => {
                handleValueChange(val, "use_note");
              }}
            />
          </View>
          {(mainStore > 2 && approval === "1") || form.state === 3 ? (
            <React.Fragment>
              <View className="card-title">向总店申请理由</View>
              <View className="card">
                <Field
                  border={false}
                  title="申请理由"
                  titleWidth={90}
                  titleRow
                  type="textarea"
                  value={form.reason}
                  maxlength={255}
                  showWordLimit
                  placeholder="向总店申请创建优惠券的原因，方便总店审批"
                  onChange={(val) => {
                    handleValueChange(val, "reason");
                  }}
                />
              </View>
            </React.Fragment>
          ) : null}
        </ScrollView>
      </KeyboardAwareScrollView>
      <BottomBar>
        {!!form.id ? (
          <React.Fragment>
            <Button
              style={{ marginRight: addUnit(12) }}
              hairline
              type="primary"
              loading={loading}
              onClick={deleteClick}
            >
              删除
            </Button>
            {form.state === 1 ? (
              <React.Fragment>
                <Button
                  style={{ marginRight: addUnit(12) }}
                  type="primary"
                  loading={loading}
                  hairline
                  onClick={() => {
                    stateClick(2,"下架");
                  }}
                >
                  下架
                </Button>
              </React.Fragment>
            ) : form.state === 2 ? (
              <React.Fragment>
                <Button
                  style={{ marginRight: addUnit(12) }}
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    stateClick(1,"上架");
                  }}
                >
                  上架
                </Button>
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ) : null}
        <Button
          style={{ flex: 1, maxWidth: "70%" }}
          type={mainStore === 1 && form.state === 3 ? "success" : "info"}
          loading={loading}
          onClick={()=>{
            saveClick(mainStore === 1 && form.state === 3 ? 1 : 0);
          }}
        >
          {mainStore === 1 && form.state === 3 ? "通过审批" : "保存"}
        </Button>
      </BottomBar>
    </View>
  );
};

export default CouponEdit;
