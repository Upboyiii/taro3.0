import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { secToDate } from "@/utils/common";
import { pluginApi } from "@/api/base";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Switch from "@/components/switch";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const JifenCommon: FC = () => {

  const init = {
    name: "",
    deduct: {
      deduct_amount_limit: -1,
      min_order_amount: -1
    },
    expire_detail: {
      expire_type: 1,
      time_day: null,
      time_time_period: ""
    },
    general_ratio: 100,
    limit_per_day: -1,
    protected_time: -1,
    sign_in: {
      sign_use: -1,
      sign_cycle: [{ day: 1, points: 1 }]
    }
  };
  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);

  const getPointsSet = () => {
    setLoading(true);
    pluginApi.plugin("GET", 262, "setInfo", "{}").then(res => {
      if(!!res && res.code === 0){
        const form = Object.assign({}, init, res.data);
        if (form.expire_detail.expire_type === 3) {
          form.expire_detail.time_time_period = secToDate(form.expire_detail.time_period, "{y}-{M}-{d}");
        }
        if(form.deduct.deduct_amount_limit > 0){
          form.deduct.deduct_amount_limit = (form.deduct.deduct_amount_limit / 100).toFixed(2);
        }
        if(form.deduct.min_order_amount > 0){
          form.deduct.min_order_amount = (form.deduct.min_order_amount / 100).toFixed(2);
        }
        setForm(form);
      }
    }).finally(()=>{
      setLoading(false);
    });
  };

  useEffect(() => {
    getPointsSet();
  }, []);

  const handleValueChange = (val, type, father = "") =>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(!!father){
        temp[father][type] = val;
      }else{
        temp[type] = val;
      }
      return temp;
    });
  };

  const saveClick = () => {
    let verify = true;

    if (!form.name) {
      Taro.showToast({ title: "积分名称不能为空", icon: "none" });
      return false;
    }
    if(form.expire_detail.expire_type === 2){
      if (!form.expire_detail.time_day) {
        Taro.showToast({ title: "有效期天数不能为空", icon: "none" });
        return false;
      }else{
        form.expire_detail.time_day = parseInt(form.expire_detail.time_day);
      }
    }else if(form.expire_detail.expire_type === 3){
      if (!form.expire_detail.time_time_period) {
        Taro.showToast({ title: "请选择积分有效期日期", icon: "none" });
        return false;
      }
    }
    if(form.limit_per_day !== - 1){
      if (!form.limit_per_day) {
        Taro.showToast({ title: "每天最多获积分取不能为空", icon: "none" });
        return false;
      }else{
        form.limit_per_day = parseInt(form.limit_per_day);
      }
    }
    if(form.protected_time !== - 1){
      if (!form.protected_time) {
        Taro.showToast({ title: "保护期天数不能为空", icon: "none" });
        return false;
      }else{
        form.protected_time = parseInt(form.protected_time);
      }
    }
    if (!form.general_ratio) {
      Taro.showToast({ title: "积分兑换比例不能为空", icon: "none" });
      return false;
    }else{
      form.general_ratio = parseInt(form.general_ratio);
    }
    if(form.deduct.deduct_amount_limit !== 0 && form.deduct.deduct_amount_limit !== - 1){
      if (!form.deduct.deduct_amount_limit) {
        Taro.showToast({ title: "订单金额最低不能为空", icon: "none" });
        return false;
      }else{
        form.deduct.deduct_amount_limit = Number(form.deduct.deduct_amount_limit) * 100;
      }
    }
    if(form.deduct.min_order_amount !== 0 && form.deduct.min_order_amount !== - 1){
      if (!form.deduct.min_order_amount) {
        Taro.showToast({ title: "最高可抵扣不能为空", icon: "none" });
        return false;
      }else{
        form.deduct.min_order_amount = Number(form.deduct.min_order_amount) * 100;
      }
    }
    if(form.sign_in.sign_use === 1){
      for(let i = 0; i < form.sign_in.sign_cycle.length; i++){
        if(!form.sign_in.sign_cycle[i].day){
          Taro.showToast({ title: "连续签到天数不能为空", icon: "none" });
          return false;
        }else{
          form.sign_in.sign_cycle[i].day = parseInt(form.sign_in.sign_cycle[i].day);
        }
        if(!form.sign_in.sign_cycle[i].points){
          Taro.showToast({ title: "连续签到积分不能为空", icon: "none" });
          return false;
        }else{
          form.sign_in.sign_cycle[i].points = parseInt(form.sign_in.sign_cycle[i].points);
        }
      }
    }
    if(!verify) return;

    setLoading(true);
    pluginApi.plugin("PUT", 262, "setUpdate", JSON.stringify(form))
      .then(res => {
        if(!!res && res.code === 0){
          eventCenterTrigger("pointEdit", { type: 2 });
          navigateTo({ method:"navigateBack" });
        }else{
          Taro.showToast({ title: res.message, icon: "none" });
        }
      }).catch((res)=>{
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(()=>{
      setLoading(false);
    });

  };
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            border={false}
            required
            clearable
            title="积分名称"
            titleWidth={90}
            maxlength={5}
            showWordLimit
            value={form.name}
            placeholder="如：金币。最多5个字"
            onChange={(val)=>{ handleValueChange(val,"name");}}
          />
        </View>
        <View className="card">
          <Field
            border={false}
            title="积分有效期"
            titleWidth={90}
            input={false}
            value={["永久有效", "获取后有效", "固定日期"][form.expire_detail.expire_type - 1]}
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["永久有效", "获取当日开始计算有效期", "固定日期"],
                success: function (res) {
                  handleValueChange(res.tapIndex + 1,"expire_type","expire_detail");
                },
                fail: function (res) {
                  console.log(res.errMsg);
                }
              });
            }}
          />
          {form.expire_detail.expire_type === 2 ? (
            <Field
              title="有效期天数"
              titleWidth={90}
              required
              type="digit"
              value={form.expire_detail.time_day}
              placeholder="请输入有效期天数"
              onChange={(val)=>{ handleValueChange(val,"time_day","expire_detail");}}
              right="天"
            />
          ) : form.expire_detail.expire_type === 3 ? (
            <React.Fragment>
              <Picker
                mode="date"
                value={form.expire_detail.time_time_period}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
                onChange={(e)=>{
                  const time = e.detail.value.replace(/\//g, "-");
                  handleValueChange(time,"time_time_period","expire_detail");
                }}
              >
                <Cell
                  title="从获得开始至"
                  titleStyle={{ width: addUnit(90) }}
                  content={!!form.expire_detail.time_time_period ? form.expire_detail.time_time_period : "请选择开始日期"}
                  contentAlign="left"
                  contentStyle={!!form.expire_detail.time_time_period ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
            </React.Fragment>
          ) : null}
        </View>
        <View className="card">
          <Field
            border={false}
            title="积分获取上限"
            titleWidth={90}
            input={false}
            value={form.limit_per_day === - 1 ? "不限制" : "通过消费获取限制"}
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不限制", "每个客户每天通过消费获取限制"],
                success: function (res) {
                  handleValueChange(res.tapIndex === 0 ? -1 : null,"limit_per_day");
                }
              });
            }}
          />
          {form.limit_per_day !== - 1 ? (
            <Field
              title="每天最多获取"
              titleWidth={90}
              required
              type="digit"
              value={form.limit_per_day}
              placeholder="请输入整数"
              onChange={(val)=>{ handleValueChange(val,"limit_per_day");}}
              right="积分"
            />
          ) : null}
        </View>
        {form.limit_per_day !== - 1 ? (
          <View className="card-tips" style={{ marginTop: addUnit(-4) }}>请输入每个客户每天通过消费最多获取的积分数量</View>
        ) : null}
        <View className="card">
          <Field
            border={false}
            title="积分保护期"
            titleWidth={90}
            input={false}
            value={form.protected_time === - 1 ? "不启用" : "积分发放后进入保护期"}
            arrow
            clickable
            onClick={()=>{
              Taro.showActionSheet({
                itemList: ["不启用", "积分发放后进入保护期"],
                success: function (res) {
                  handleValueChange(res.tapIndex === 0 ? -1 : null,"protected_time");
                }
              });
            }}
          />
          {form.protected_time !== - 1 ? (
            <Field
              title="保护期天数"
              titleWidth={90}
              required
              type="digit"
              value={form.protected_time}
              placeholder="请输入整数"
              onChange={(val)=>{ handleValueChange(val,"protected_time");}}
              right="天"
            />
          ) : null}
        </View>
        {form.protected_time !== - 1 ? (
          <View className="card-tips" style={{ marginTop: addUnit(-4) }}>
            仅针对每购买金额X元、每成功交易X笔和满减送活动赠送的积分有效
          </View>
        ) : null}
        <View className="card">
          <Field
            border={false}
            required
            title="积分兑换比例"
            titleWidth={90}
            type="digit"
            value={form.general_ratio}
            placeholder="请输入整数"
            onChange={(val)=>{ handleValueChange(val,"general_ratio");}}
            right="积分=1元"
          />
        </View>
        <View className="card-title">积分抵现</View>
        <View className="card">
          <Cell
            border={false}
            title="订单金额门槛"
            extra={
              <Switch
                checked={form.deduct.deduct_amount_limit !== 0}
                activeValue={undefined}
                inactiveValue={0}
                onChange={(val)=>{
                  handleValueChange(val,"deduct_amount_limit","deduct");
                }}
              />
            }
          />
          {form.deduct.deduct_amount_limit !== 0 ? (
            <React.Fragment>
              <Field
                title="门槛限制"
                titleWidth={90}
                input={false}
                value={form.deduct.deduct_amount_limit === - 1 ? "不限制" : "订单金额最低限制"}
                arrow
                clickable
                onClick={()=>{
                  Taro.showActionSheet({
                    itemList: ["不限制", "订单金额最低限制"],
                    success: function (res) {
                      handleValueChange(res.tapIndex === 0 ? -1 : null,"deduct_amount_limit","deduct");
                    }
                  });
                }}
              />
              {form.deduct.deduct_amount_limit !== - 1 ? (
                <Field
                  title="订单金额最低"
                  titleWidth={90}
                  required
                  type="number"
                  value={form.deduct.deduct_amount_limit}
                  placeholder="请输入整数"
                  onChange={(val)=>{ handleValueChange(val,"deduct_amount_limit","deduct");}}
                  right="元可抵现"
                />
              ) : null}
            </React.Fragment>
          ) : null}
          <Cell
            title="抵扣金额上限"
            extra={
              <Switch
                checked={form.deduct.min_order_amount !== 0}
                activeValue={undefined}
                inactiveValue={0}
                onChange={(val)=>{
                  handleValueChange(val,"min_order_amount","deduct");
                }}
              />
            }
          />
          {form.deduct.min_order_amount !== 0 ? (
            <React.Fragment>
              <Field
                title="抵扣限制"
                titleWidth={90}
                input={false}
                value={form.deduct.min_order_amount === - 1 ? "不限制" : "每笔订单抵扣限制"}
                arrow
                clickable
                onClick={()=>{
                  Taro.showActionSheet({
                    itemList: ["不限制", "每笔订单抵扣限制"],
                    success: function (res) {
                      handleValueChange(res.tapIndex === 0 ? -1 : null,"min_order_amount","deduct");
                    }
                  });
                }}
              />
              {form.deduct.min_order_amount !== - 1 ? (
                <Field
                  title="最高可抵扣"
                  titleWidth={90}
                  required
                  type="number"
                  value={form.deduct.min_order_amount}
                  placeholder="请输入整数"
                  onChange={(val)=>{ handleValueChange(val,"min_order_amount","deduct");}}
                  right="元可抵现"
                />
              ) : null}
            </React.Fragment>
          ) : null}
        </View>
        <View className="card">
          <Cell
            border={false}
            title="积分签到"
            textStyle={{ fontWeight: form.sign_in.sign_use === 1 ? "bold" : "normal" }}
            extra={
              <Switch
                checked={form.sign_in.sign_use === 1}
                activeValue={1}
                inactiveValue={-1}
                onChange={(val)=>{
                  handleValueChange(val,"sign_use","sign_in");
                }}
              />
            }
          />
          {form.sign_in.sign_use === 1 ? (
            <React.Fragment>
              {form.sign_in.sign_cycle.map((item,idx)=>{
                return (
                  <Cell
                    key={`sign_use-${idx}`}
                    contentStyle={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                    rightIcon={
                      <View
                        className="plus plus--border"
                        style={{
                          width: addUnit(20),
                          height: addUnit(20),
                          borderColor: "#666",
                          borderWidth: addUnit(1),
                          opacity: form.sign_in.sign_cycle.length === 1 ? 0 : 1
                        }}
                      >
                        <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#666", left: "50%", marginLeft: addUnit(-4) }} />
                      </View>
                    }
                    rightStyle={{ marginLeft: addUnit(24) }}
                    onRight={()=>{
                      if(form.sign_in.sign_cycle.length === 1) return;
                      setForm(prevState => {
                        let temp = JSON.parse(JSON.stringify(prevState));
                        temp.sign_in.sign_cycle.splice(idx,1);
                        return temp;
                      });
                    }}
                  >
                    <View>连续签到</View>
                    <Field
                      border={false}
                      style={{ flex: 1, paddingTop: 0, paddingBottom: 0 }}
                      type="digit"
                      value={item.day}
                      placeholder="输入天数"
                      onChange={(val)=>{
                        setForm(prevState => {
                          let temp = JSON.parse(JSON.stringify(prevState));
                          temp.sign_in.sign_cycle[idx].day = val;
                          return temp;
                        });
                      }}
                    />
                    <View>天送</View>
                    <Field
                      border={false}
                      style={{ flex: 1, paddingTop: 0, paddingBottom: 0 }}
                      type="digit"
                      value={item.points}
                      placeholder="输入积分"
                      onChange={(val)=>{
                        setForm(prevState => {
                          let temp = JSON.parse(JSON.stringify(prevState));
                          temp.sign_in.sign_cycle[idx].points = val;
                          return temp;
                        });
                      }}
                    />
                    <View>积分</View>
                  </Cell>
                );
              })}
              <Cell
                contentAlign="center"
                contentStyle={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                content={
                  <React.Fragment>
                    <View className="plus plus--border" style={{ width: addUnit(16), height: addUnit(16), borderColor: "#ff2340", borderWidth: addUnit(1) }}>
                      <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
                      <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#ff2340", top: "50%", marginTop: addUnit(-4) }} />
                    </View>
                    <View style={{ marginLeft: addUnit(6), fontSize: addUnit(14), color: "#ff2340" }}>添加签到规则</View>
                  </React.Fragment>
                }
                onClick={()=>{
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.sign_in.sign_cycle.push({ day: null, points: null });
                    return temp;
                  });
                }}
              />
            </React.Fragment>
          ) : null}
        </View>
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
    </View>
  );
};

export default JifenCommon;
