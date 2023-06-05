import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { getTimeStamp, secondToTime, secToDate } from "@/utils/common";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { getMainStore } from "@/utils/app";
import store from "@/store";
import Field from "@/components/field";
import Button from "@/components/button";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import Checkbox from "@/components/checkbox";
import Popup from "@/components/popup";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const DiscountEdit: FC = () => {

  const _id = getCurrentInstance().router?.params?.id;
  const _approval = getCurrentInstance().router?.params?.approval;
  const _apply_id = getCurrentInstance().router?.params?.apply_id;
  const _title = !!_id ? "编辑限时折扣活动" : "创建限时折扣活动";
  const mainStore = getMainStore();// 店铺类型
  const storeID = store?.getState()?.storeInfo?.store_id;

  const [weekShow, setWeekShow] = useState(false);
  const weekdaysList = [
    { label:"周一", value: 1 },
    { label:"周二", value: 2 },
    { label:"周三", value: 3 },
    { label:"周四", value: 4 },
    { label:"周五", value: 5 },
    { label:"周六", value: 6 },
    { label:"周日", value: 0 }
  ];

  const init:any = {
    id: 0,
    state: 0,
    name: "", // 活动名称
    title: "", // 活动标题
    store: [], // 适用店铺
    goods_list: [], // 使用商品
    start_time: "", // 活动开始时间
    end_time: "", // 活动结束时间
    erase_type: -1, // 抹零设置
    overlay_type: 1, // 优惠叠加
    overlay_list: [], // 优惠叠加活动列表
    tags: [], // 给参与活动用户打标签
    period: {
      type: -1, // 周期类型
      day_start_time: "", // 每天开始时间
      day_end_time: "", // 每天结束时间
      weeks: [], // 周重复
      months: "", // 每月几天
      day_zone: new Date().getTimezoneOffset() * 60 * -1
    },
    prediction: {
      type: 1, // 预告类型
      hours: "" // 提前几小时
    },
    countdown: {
      type: 1, // 倒计时类型
      hours: "" // 倒计时小时
    },
    limit_pay: {
      type: -1, // 限购类型
      quantity: "" // 限购数量
    }
  };
  const [form, setForm] = useState(init);
  const [approval, setApproval] = useState("2");
  const [loading, setLoading] = useState(false);
  const [applyID, setApplyID] = useState<number>(0);

  const getDetail = (id) => {
    setLoading(true);
    pluginApi.plugin("POST", 165, "info", JSON.stringify({ id: id }), 579498)
      .then(res => {
        // console.log(res,"getDetail");
        if (!!res && res.code === 0) {
          const data = res?.data || {};

          data.start_time = secToDate(data.start_time, "{y}-{M}-{d}");
          data.end_time = secToDate(data.end_time, "{y}-{M}-{d}");

          if(data.period.type !== -1){
            data.period.day_start_time = secondToTime(data.period.day_start_time || 0);
            data.period.day_end_time = secondToTime(data.period.day_end_time || 0);
          }
          data.period = Object.assign({}, init.period, data.period);

          if(mainStore > 1){
            data.store = [storeID ? storeID : -1];
          }

          console.log(Object.assign({}, init, data),"data)");

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
    setApplyID(parseInt(_apply_id || "0"));
    if (!!_id) {
      Taro.setNavigationBarTitle({ title: _title });
      setApproval(_approval || "2");
      getDetail(parseInt(_id));
    }
  }, []);

  useEffect(() => {
    eventCenterOn("discountSelect", (res) => {
      // console.log(res,"res");
      if(!!res[0]){
        if(!!res[0]?.type){
          if(res[0]?.type === "store"){
            handleValueChange(res[0]?.ids || [],"store");
          }
          if(res[0]?.type === "goods"){
            console.log(res[0].list,"res[0]");
            handleValueChange(res[0]?.list || [],"goods_list");
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

  const  timeToSec = (time_str) => {
    let arr = time_str.split(":");
    let sec = 0;
    if (!Number.isNaN(Number(arr[0]))) {
      sec += Number(arr[0]) * 60 * 60;
    }
    if (!Number.isNaN(Number(arr[1]))) {
      sec += Number(arr[1]) * 60;
    }
    if (!Number.isNaN(Number(arr[2]))) {
      sec += Number(arr[2]);
    }
    return sec;
  };

  const saveClick = (state = 0) => {
    let _form = JSON.parse(JSON.stringify(form));
    if (!!state) {
      _form.state = state;
    }
    if (!_form.name) {
      Taro.showToast({ title: "请输入活动名称", icon: "none" });
      return;
    }
    if (!_form.start_time) {
      Taro.showToast({ title: "请选择活动开始日期", icon: "none" });
      return false;
    }else{
      _form.start_time = _form.start_time + " 00:00:00";
    }
    if (!_form.end_time) {
      Taro.showToast({ title: "请选择活动结束日期", icon: "none" });
      return false;
    }else{
      _form.end_time = _form.end_time + " 00:00:00";
    }
    if (getTimeStamp(_form.start_time) >= getTimeStamp(_form.end_time)) {
      Taro.showToast({ title: "活动结束日期必须大于开始日期", icon: "none" });
      return false;
    }
    _form.time_start_time = _form.start_time;
    _form.time_end_time = _form.end_time;
    delete _form.start_time;
    delete _form.end_time;

    if(_form.period.type !== -1){
      if(_form.period.type === 1){
        delete _form.period.weeks;
        delete _form.period.months;
      }
      if(_form.period.type === 2){
        if (_form.period.weeks.length === 0) {
          Taro.showToast({ title: "请选择重复周期", icon: "none" });
          return false;
        }
        delete _form.period.day_zone;
        delete _form.period.months;
      }
      if(_form.period.type === 3){
        if (!_form.period.months) {
          Taro.showToast({ title: "请输入每月重复日", icon: "none" });
          return false;
        }else{
          _form.period.months = parseInt(_form.period.months);
        }
        delete _form.period.weeks;
        delete _form.period.day_zone;
      }
      if (!_form.period.day_start_time) {
        Taro.showToast({ title: "请选择重复开始时间", icon: "none" });
        return false;
      }
      if (!_form.period.day_end_time) {
        Taro.showToast({ title: "请选择重复结束时间", icon: "none" });
        return false;
      }
      if (getTimeStamp("2023-01-01 " + _form.period.day_start_time) >= getTimeStamp("2023-01-01 " + _form.period.day_end_time)) {
        Taro.showToast({ title: "重复结束时间必须大于开始时间", icon: "none" });
        return false;
      }
      _form.period.day_start_time = timeToSec(_form.period.day_start_time);
      _form.period.day_end_time = timeToSec(_form.period.day_end_time);
    }else{
      delete _form.period.weeks;
      delete _form.period.months;
      delete _form.period.day_start_time;
      delete _form.period.day_end_time;
      delete _form.period.day_zone;
    }
    if(_form.prediction.type === 2){
      if (!_form.prediction.hours) {
        Taro.showToast({ title: "请输入活动开始前时间", icon: "none" });
        return false;
      }else{
        _form.prediction.hours = parseInt(_form.prediction.hours);
      }
    }else{
      delete _form.prediction.hours;
    }
    if(_form.store.length === 0){
      Taro.showToast({ title: "请选择适用店铺", icon: "none" });
      return false;
    }
    if(_form.goods_list.length === 0){
      Taro.showToast({ title: "请选择参加活动的商品", icon: "none" });
      return false;
    }
    if(_form.countdown.type === 2){
      if (!_form.countdown.hours) {
        Taro.showToast({ title: "请输入倒计时周期", icon: "none" });
        return false;
      }else{
        _form.countdown.hours = parseInt(_form.countdown.hours);
      }
    }else{
      delete _form.countdown.hours;
    }
    if(_form.limit_pay.type !== -1){
      if (!_form.limit_pay.quantity) {
        Taro.showToast({ title: "请输入限购数量", icon: "none" });
        return false;
      }else{
        _form.limit_pay.quantity = parseInt(_form.limit_pay.quantity);
      }
    }else{
      delete _form.limit_pay.quantity;
    }

    console.log(_form,"_form");

    setLoading(true);
    pluginApi .plugin("PUT", 165,"save", JSON.stringify(_form), applyID)
      .then((res) => {
        console.log(res,"res");
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

  const deleteClick = () => {
    Taro.showModal({
      title: "删除此活动？",
      content: "删除此限时折扣活动后将不可恢复",
      cancelText: "我再想想",
      confirmText: "确定删除",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          pluginApi .plugin("DELETE", 165,"delete",JSON.stringify({ id: Number(form.id) }), 579498)
            .then((res) => {
              // console.log(res,"res");
              if (!!res && res.code === 0) {
                eventCenterTrigger("discountEdit" );
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
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card-title">基本设置</View>
        <View className="card">
          <Field
            border={false}
            required
            title="活动名称"
            titleWidth={90}
            value={form.name}
            placeholder="限时折扣活动名称"
            onChange={(val) => {
              handleValueChange(val, "name");
            }}
          />
          <Field
            title="活动标题"
            titleWidth={90}
            maxlength={5}
            showWordLimit
            value={form.title}
            placeholder="2-5个字"
            onChange={(val) => {
              handleValueChange(val, "title");
            }}
          />
        </View>
        <View className="card-tips">
          活动标题未填写则默认为：限时折扣，活动预告和活动进行期间展示于商品详情页
        </View>
        <View className="card-title">活动时间</View>
        <View className="card">
          <Picker
            mode="date"
            value={form.start_time}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            onChange={(e)=>{
              const time = e.detail.value.replace(/\//g, "-");
              handleValueChange(time,"start_time");
            }}
          >
            <Cell
              border={false}
              titleStyle={{ width: addUnit(90) }}
              title="开始日期"
              contentAlign="left"
              contentStyle={!form.start_time ? { color: "#ccc" } : {}}
              content={!!form.start_time ? form.start_time : "请选择开始日期"}
              arrow
            />
          </Picker>
          <Picker
            mode="date"
            value={form.end_time}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            onChange={(e)=>{
              const time = e.detail.value.replace(/\//g, "-");
              handleValueChange(time,"end_time");
            }}
          >
            <Cell
              titleStyle={{ width: addUnit(90) }}
              title="结束日期"
              contentAlign="left"
              contentStyle={!form.end_time ? { color: "#ccc" } : {}}
              content={!!form.end_time ? form.end_time : "请选择结束日期"}
              arrow
            />
          </Picker>
          <Field
            title="活动周期"
            titleWidth={90}
            input={false}
            value={["不重复","每天重复","每周重复","每月重复"][form.period.type === - 1 ? 0 : form.period.type]}
            placeholder="请选择活动周期"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不重复","每天重复","每周重复","每月重复"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "type", "period");
                }
              });
            }}
          />
          {form.period.type === 2 ? (
            <Field
              required
              title="重复周期"
              titleWidth={90}
              input={false}
              value={form.period.weeks.map(item=>["周日","周一","周二","周三","周四","周五","周六"][item]).join(";")}
              placeholder="请选择重复周期"
              arrow
              clickable
              onClick={() => {
                setWeekShow(true);
              }}
            />
          ) : null}
          {form.period.type === 3 ? (
            <Field
              required
              type="digit"
              title="每月重复"
              titleWidth={90}
              value={form.period.months}
              placeholder="1~31日"
              right="日"
              onChange={(val) => {
                handleValueChange(val, "months","period");
              }}
            />
          ) : null}
          {form.period.type !== -1 ? (
            <Field
              required
              align="center"
              title="重复时间"
              titleWidth={90}
              input={false}
              inputStyle={{ display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 0, paddingBottom: 0 }}
              style={{ paddingTop: 0, paddingBottom: 0 }}
            >
              <View style={{ flex: 1 }}>
                <Picker
                  mode="time"
                  value={form.period.day_start_time}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time,"day_start_time", "period");
                  }}
                >
                  <View
                    style={{
                      lineHeight: addUnit(48),
                      fontSize: addUnit(14),
                      color: !!form.period.day_start_time ? "#333" : "#ccc"
                    }}
                  >
                    {!!form.period.day_start_time ? form.period.day_start_time : "开始时间"}
                  </View>
                </Picker>
              </View>
              <View style={{ paddingRight: addUnit(32), color: "#999" }}>至</View>
              <View style={{ flex: 1 }}>
                <Picker
                  mode="time"
                  value={form.period.day_end_time}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time,"day_end_time", "period");
                  }}
                >
                  <View
                    style={{
                      lineHeight: addUnit(48),
                      fontSize: addUnit(14),
                      color: !!form.period.day_end_time ? "#333" : "#ccc"
                    }}
                  >
                    {!!form.period.day_end_time ? form.period.day_end_time : "结束时间"}
                  </View>
                </Picker>
              </View>
            </Field>
          ) : null}
          <Field
            title="活动周期"
            titleWidth={90}
            input={false}
            value={["不进行活动预告","创建成功后就进行活动预告","活动开始前"][form.prediction.type === - 1 ? 0 : form.prediction.type]}
            placeholder="请选择活动预告"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不进行活动预告","创建成功后就进行活动预告","活动开始前"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "type", "prediction");
                }
              });
            }}
          />
          {form.prediction.type === 2 ? (
            <Field
              required
              type="digit"
              title="活动开始前"
              titleWidth={90}
              maxlength={4}
              value={form.prediction.hours}
              placeholder="填写整数"
              right="小时进行活动预告"
              onChange={(val) => {
                handleValueChange(val, "hours","prediction");
              }}
            />
          ) : null}
          <Field
            title="优惠叠加"
            titleWidth={90}
            input={false}
            value={["不叠加其他营销活动","叠加指定营销活动"][form.overlay_type - 1]}
            placeholder="请选择活动预告"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不叠加其他营销活动","叠加指定营销活动"],
                success: function (res) {
                  const index = res.tapIndex + 1;
                  handleValueChange(index, "overlay_type");
                }
              });
            }}
          />
          {form.overlay_type === 2 ? (
            <React.Fragment>
              <Cell
                title="叠加优惠券"
                content={
                  <Switch
                    checked={form.overlay_list.indexOf(165) > -1}
                    onChange={(val)=>{
                      let overlay_list:number[] = form.overlay_list;
                      if(val){
                        if(overlay_list.indexOf(165) === -1){
                          overlay_list.push(165);
                        }
                      }else{
                        if(overlay_list.indexOf(165) > -1){
                          overlay_list.splice(overlay_list.indexOf(165),1);
                        }
                      }
                      handleValueChange(overlay_list, "overlay_list");
                    }}
                  />
                }
              />
              <Cell
                title="叠加积分"
                content={
                  <Switch
                    checked={form.overlay_list.indexOf(262) > -1}
                    onChange={(val)=>{
                      let overlay_list:number[] = form.overlay_list;
                      if(val){
                        if(overlay_list.indexOf(262) === -1){
                          overlay_list.push(262);
                        }
                      }else{
                        if(overlay_list.indexOf(262) > -1){
                          overlay_list.splice(overlay_list.indexOf(262),1);
                        }
                      }
                      handleValueChange(overlay_list, "overlay_list");
                    }}
                  />
                }
              />
            </React.Fragment>
          ) : null}
        </View>
        <View className="card-title">活动规则</View>
        <View className="card">
          {mainStore === 1 ? (
            <React.Fragment>
              <Field
                required
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
                      navigateTo({ url: "/pages/com/store-select/index", method: "navigateTo", params: { ids: form.store, refs: "discountSelect", type: "store", multiple: true } });
                    }}
                  />
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ) : null}
          <Field
            required
            border={mainStore === 1}
            title="适用商品"
            titleWidth={90}
            input={false}
            value={form.goods_list.length > 0 ? `已设置(${form.goods_list.length})件商品` : ""}
            placeholder="请选择要参加活动的商品"
            arrow
            clickable
            onClick={() => {
              navigateTo({ url: "/pages/shop/discount/edit/goods/index", method: "navigateTo", params: { list: form.goods_list, refs: "discountSelect", type: "goods" } });
            }}
          />
          <Field
            title="抹零设置"
            titleWidth={90}
            input={false}
            value={["不处理","抹去角和分","抹去分"][form.erase_type === - 1 ? 0 : form.erase_type]}
            placeholder="请选择活动预告"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不处理","抹去角和分","抹去分"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "erase_type");
                }
              });
            }}
          />
        </View>
        <View className="card-tips">
          抹零是指付钱时不计整数以外的尾数；抹零对促销价低于1.00元的商品无效
        </View>
        <View className="card">
          <Field
            border={false}
            title="限购"
            titleWidth={90}
            input={false}
            value={["不限购","每种商品限购","每种商品前n件/斤/箱限购"][form.limit_pay.type === - 1 ? 0 : form.limit_pay.type]}
            placeholder="请选择活动预告"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不限购","每种商品限购","每种商品前n件/斤/箱限购"],
                success: function (res) {
                  const index = res.tapIndex === 0 ? -1 : res.tapIndex;
                  handleValueChange(index, "type", "limit_pay");
                }
              });
            }}
          />
          {form.limit_pay.type === 1 ? (
            <Field
              required
              type="digit"
              title="每种商品限购"
              titleWidth={90}
              maxlength={4}
              value={form.countdown.hours}
              placeholder="填写整数"
              right="件/斤/箱"
              onChange={(val) => {
                handleValueChange(val, "quantity","limit_pay");
              }}
            />
          ) : form.limit_pay.type === 2 ? (
            <Field
              required
              type="digit"
              title="每种商品前"
              titleWidth={90}
              maxlength={4}
              value={form.countdown.hours}
              placeholder="填写整数"
              right="件/斤/箱限购"
              onChange={(val) => {
                handleValueChange(val, "quantity","limit_pay");
              }}
            />
          ) : null}
          <Field
            title="倒计时设计"
            titleWidth={90}
            input={false}
            value={["按活动时间倒计时","自定义倒计时周期"][form.countdown.type - 1]}
            placeholder="请选择倒计时类型"
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["按活动时间倒计时","自定义倒计时周期"],
                success: function (res) {
                  const index = res.tapIndex + 1;
                  handleValueChange(index, "type", "countdown");
                }
              });
            }}
          />
          {form.countdown.type === 2 ? (
            <Field
              required
              type="digit"
              title="倒计时周期"
              titleWidth={90}
              maxlength={4}
              value={form.countdown.hours}
              placeholder="填写整数"
              right="小时"
              onChange={(val) => {
                handleValueChange(val, "hours","countdown");
              }}
            />
          ) : null}
        </View>
        <View className="card-tips">
          自定义倒计时周期可增强下单紧迫感，帮助商家打造营销氛围。开启后，商品详情页的活动结束倒计时，将会按所设时间展示。
        </View>
        {(mainStore > 2 && approval === "1") || form.state === 1 ? (
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
                placeholder="向总店申请创建限时折扣活动的原因，方便总店审批"
                onChange={(val) => {
                  handleValueChange(val, "reason");
                }}
              />
            </View>
          </React.Fragment>
        ) : null}
      </ScrollView>
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
          </React.Fragment>
        ) : null}
        <Button
          style={{ width: "70%" }}
          type={mainStore === 1 && form.state === 1 ? "success" : "info"}
          loading={loading}
          onClick={()=>{
            saveClick(mainStore === 1 && form.state === 1 ? 1 : 0);
          }}
        >
          {mainStore === 1 && form.state === 1 ? "通过审批" : "保存"}
        </Button>
      </BottomBar>
      <Popup
        show={weekShow}
        title="选择星期"
        headerBorder
        onClose={()=>{
          setWeekShow(false);
        }}
        action={
          <Button
            type="info"
            style={{ width: "70%" }}
            onClick={()=>{
              setWeekShow(false);
            }}
          >
            确定
          </Button>
        }
      >
        {weekdaysList.map((weekday, index)=>{
          return (
            <Checkbox
              cell
              key={`popup-weekday-${index}`}
              border={index !== 0}
              checked={form.period.weeks.indexOf(weekday.value) > -1}
              label={weekday.label}
              labelStyle={{ fontSize: addUnit(16) }}
              style={{ paddingTop: addUnit(16) , paddingBottom: addUnit(16) }}
              onChange={(val)=>{
                let weeks = form.period.weeks;
                if(val){
                  if(weeks.indexOf(weekday.value) === -1){
                    weeks.push(weekday.value);
                  }
                }else{
                  if(weeks.indexOf(weekday.value) > -1){
                    weeks.splice(weeks.indexOf(weekday.value),1);
                  }
                }
                handleValueChange(weeks, "weeks", "period");
              }}
            />
          );
        })}
      </Popup>
    </View>
  );
};

export default DiscountEdit;
