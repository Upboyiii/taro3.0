import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, View, ScrollView } from "@tarojs/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { secToDate } from "@/utils/common";
import { pluginApi } from "@/api/base";
import { shopApi } from "@/api/co_admin";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const GiftEdit: FC = () => {
  const _params:any = getCurrentInstance().router?.params ;
  const _title = Object.keys(_params).length > 0 ? "编辑赠品活动" : "新增赠品活动";

  const init = {
    name: "",
    goods_id: null,
    expire_day: "",
    expire_type: -1, // -1长期有效 1满足条件
    start_at: "", // 活动开始时间
    end_at: "",
    limit_type: -1, // 每人限领次数
    limit_nums: "" // 份/人
  };
  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(init);
    if (Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      let _form = Object.assign({}, init, JSON.parse(_params?.form || "{}"));
      if(_form.expire_type === 1){
        _form.start_at = secToDate(_form.start_at,"{y}-{M}-{d}");
        _form.end_at = secToDate(_form.end_at,"{y}-{M}-{d}");
      }
      console.log(_form,"_form");
      setForm(_form);
    }
  }, []);

  const refs = "giftSelectGoods";
  useEffect(() => {
    eventCenterOn(refs, (res) => {
      if(!!res && !!res[0]){
        handleValueChange(res[0], "goods_id");
      }
    });
    return () => {
      eventCenterOff(refs);
    };
  }, []);
  const [goods, setGoods] = useState("");
  useEffect(() => {
    if(!!form.goods_id){
      shopApi.goods.get({ id: form.goods_id }).then(res => {
        if (!!res && res.code === 0) {
          setGoods(res?.data?.name || "");
        }
      });
    }else{
      setGoods("");
    }
  }, [form.goods_id]);

  const handleValueChange = (val, ref) =>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };
  const updateState = (type) => {
    if(!!form.id){
      const obj = {
        id: form.id,
        state: type
      };
      setLoading(true);
      pluginApi.plugin("PUT", 327, "state", JSON.stringify(obj))
        .then(res => {
          if (!!res && res.code === 0) {
            eventCenterTrigger("giftEdit");
            navigateTo({ method:"navigateBack" });
          }else{
            Taro.showToast({ title: res.message, icon: "none" });
          }
        }).catch(res=>{
          Taro.showToast({ title: res.message, icon: "none" });
        }).finally(()=>{
          setLoading(false);
        });
    }
  };
  const saveClick = () => {
    let verify = true;
    if (!form.name) {
      Taro.showToast({ title: "赠品活动名称不能为空", icon: "none" });
      return false;
    }
    if (!form.goods_id) {
      Taro.showToast({ title: "请选择商品", icon: "none" });
      return false;
    }
    if (!form.expire_day) {
      Taro.showToast({ title: "领取期限不能为空", icon: "none" });
      return false;
    }else{
      form.expire_day = Number(form.expire_day);
    }
    if (form.expire_type === 1) {
      if (!form.start_at) {
        Taro.showToast({ title: "请选择活动开始日期", icon: "none" });
        return false;
      }
      if (!form.end_at) {
        Taro.showToast({ title: "请选择活动结束日期", icon: "none" });
        return false;
      }
    }
    if (form.limit_type === 1) {
      if (!form.limit_nums) {
        Taro.showToast({ title: "请设置限领次数", icon: "none" });
        return false;
      }else{
        form.limit_nums = Number(form.limit_nums);
      }
    }else{
      delete form.limit_nums;
    }
    if(!verify) return;

    setLoading(true);
    pluginApi.plugin("POST", 327, "save", JSON.stringify(form))
      .then(res => {
        console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("giftEdit");
          navigateTo({ method:"navigateBack" });
        }else{
          Taro.showToast({ title: res.message, icon: "none" });
        }
      }).catch(res=>{
        Taro.showToast({ title: res.message, icon: "none" });
      }).finally(()=>{
        setLoading(false);
      });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <KeyboardAwareScrollView extraScrollHeight={40}>
        <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
          <View className="card" style={{ marginTop: addUnit(12) }}>
            <Field
              border={false}
              required
              title="活动名称"
              titleWidth={90}
              placeholder="赠品活动名称"
              value={form.name}
              onChange={(val)=>{handleValueChange(val,"name");}}
            />
            <Field
              required
              title="商品"
              titleWidth={90}
              input={false}
              placeholder="请选择商品"
              value={goods}
              arrow
              clickable
              onClick={()=>{
                navigateTo({
                  method:"navigateTo",
                  url: "/pages/com/goods-select/index",
                  params: {
                    refs: refs,
                    ids: form.goods_id
                  }
                });
              }}
            />
            <Field
              required
              title="领取期限"
              titleWidth={90}
              type="digit"
              placeholder="请输入天数"
              value={form.expire_day}
              right="天"
              onChange={(val)=>{handleValueChange(val,"expire_day");}}
            />
          </View>
          <View className="card">
            <Field
              border={false}
              title="活动有效期"
              titleWidth={90}
              input={false}
              value={form.expire_type === - 1 ? "长期有效" : "固定日期"}
              arrow
              clickable
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: ["长期有效", "固定日期"],
                  success: function (res) {
                    handleValueChange(res.tapIndex === 0 ? -1 : 1,"expire_type");
                  }
                });
              }}
            />
            {form.expire_type === 1 ? (
              <React.Fragment>
                <Picker
                  mode="date"
                  value={form.start_at}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time,"start_at");
                  }}
                >
                  <Cell
                    titleStyle={{ width: addUnit(90) }}
                    title="开始日期"
                    contentAlign="left"
                    contentStyle={!form.start_at ? { color: "#ccc" } : {}}
                    content={!!form.start_at ? form.start_at : "请选择活动开始日期"}
                    arrow
                  />
                </Picker>
                <Picker
                  mode="date"
                  value={form.end_at}
                  start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                  // end={new Date(2030,5,12).toLocaleDateString().replace(/\//g, "-")}
                  onChange={(e)=>{
                    const time = e.detail.value.replace(/\//g, "-");
                    handleValueChange(time,"end_at");
                  }}
                >
                  <Cell
                    titleStyle={{ width: addUnit(90) }}
                    title="结束日期"
                    contentAlign="left"
                    contentStyle={!form.end_at ? { color: "#ccc" } : {}}
                    content={!!form.end_at ? form.end_at : "请选择结束日期"}
                    arrow
                  />
                </Picker>
              </React.Fragment>
            ) : null}
          </View>
          <View className="card">
            <Field
              border={false}
              title="每人限领"
              titleWidth={90}
              input={false}
              value={form.limit_type === - 1 ? "不限次数" : "固定次数"}
              arrow
              clickable
              onClick={()=>{
                Taro.showActionSheet({
                  itemList: ["不限次数", "固定次数"],
                  success: function (res) {
                    handleValueChange(res.tapIndex === 0 ? -1 : 1,"limit_type");
                  }
                });
              }}
            />
            {form.limit_type === 1 ? (
              <Field
                required
                title="设置次数"
                titleWidth={90}
                type="digit"
                placeholder="请输入整数"
                value={form.limit_nums}
                right="次/人"
                onChange={(val)=>{handleValueChange(val,"limit_nums");}}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
      <BottomBar>
        {!!form?.id  ? (
          <React.Fragment>
            {form.state === 1 ? (
              <Button
                hairline
                loading={loading}
                type="warning"
                style={{ marginRight: addUnit(12) }}
                onClick={()=>{
                  updateState(2);
                }}
              >
                禁用
              </Button>
            ) : form.state === 2 ? (
              <Button
                loading={loading}
                type="warning"
                style={{ marginRight: addUnit(12) }}
                onClick={()=>{
                  updateState(1);
                }}
              >
                启用
              </Button>
            ) : null}
          </React.Fragment>
        ) : null}
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

export default GiftEdit;
