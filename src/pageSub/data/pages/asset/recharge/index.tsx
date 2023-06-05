// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { assetsApi, orderApi } from "@/api/co_admin";
import { navigateTo } from "@/utils/library";
// import { Linking } from "react-native";
import store from "@/store";
import Field from "@/components/field";
import Button from "@/components/button";
import NavBar from "@/components/navbar";
import "./index.scss";
import Taro from "@tarojs/taro";

const Recharge: FC = () => {

  const { storeInfo } = store.getState();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const getFinance = () => {
    setLoading(true);
    assetsApi.finance .balance({ type: 1 })
      .then(res => {
        if (res.code === 0) {
          setBalance(res.data?.balance || 0);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(()=>{
    getFinance();
  },[]);

  const [form, setForm] = useState({ money: null, err: "" });
  const handleChange = (val, ref) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      // if(ref === "money"){
      //   temp.err = !val ? "请输入要充值的金额" : "";
      // }
      return temp;
    });
  };

  const saveRecharge = () => {
    if(!form.money){
      Taro.showToast({ title: "充值金额不能为空", icon: "none" });
      return;
    }else{
      if(form.money < 1){
        Taro.showToast({ title: "充值金额不可少于1元", icon: "none" });
        return;
      }
      if(form.money > 1000000){
        Taro.showToast({ title: "充值金额不可大于1000000元", icon: "none" });
        return;
      }
    }
    let money = form.money * 100;
    assetsApi.finance
      .recharge({ money: money })
      .then(res => {
        if (res.code === 0 && res.data.id) {
          goPay(res.data.id);
        }
      });
  };
  const goPay = (order_id) => {
    orderApi.userOrder.getOrderPay({ order_id:order_id ,order_type:2 }).then(res=>{
      if(res.code === 0){
        // 打开网页支付
        if(res.data.pay_url){
          // Linking.openURL(res.data.pay_url);
        }
      }
    });
    // 跳转到支付页面
    // navigateTo({ method: "navigateTo", url: "/pages/com/pay/index",params:{ order_id:order_id ,order_type:2,delta:1 ,eventLabel:"" } });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <NavBar
        title="充值"
        bgColor="#f7f8f8"
        right="充值记录"
        rightStyle={{ color: "#333", fontWeight: "bold" }}
        onClickRight={()=>{
          navigateTo({ method: "navigateTo", url: "/pages/data/asset/recharge/records/index" });
        }}
      />
      <View style={{ flex: 1 }}>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            border={false}
            title="店铺名称"
            input={false}
            inputAlign="right"
            inputStyle={{ color: "#666" }}
            value={!loading ? storeInfo.name : "-"}
          />
          <Field
            title="店铺余额"
            input={false}
            inputAlign="right"
            inputStyle={{ color: "#ff2340", fontSize: addUnit(16) }}
            value={!loading ? `${formatPrice(balance)}元` : "-.--"}
          />
        </View>
        <View className="card">
          <Field
            border={false}
            type="number"
            title="充值金额"
            titleRow
            icon={<View style={{ fontSize: addUnit(32) }}>¥</View>}
            inputStyle={!!form.money ? { fontSize: addUnit(32) } : { fontSize: addUnit(22) }}
            placeholder="输入要充值的金额"
            value={form.money}
            maxlength={7}
            errorIcon={false}
            error={!!form.err}
            errorMessage={form.err}
            intro="充值金额请在1.00～1000000.00元之间"
            introStyle={{ marginTop: addUnit(12) }}
            introPosition="bottom"
            onChange={(val)=>{
              handleChange(val, "money");
            }}
          />
        </View>
        <View className="bottom-bar">
          <Button
            style={{ width: "70%" }}
            size="medium"
            type="primary"
            onClick={saveRecharge}
          >
            确认充值
          </Button>
        </View>
      </View>
    </View>
  );
};

export default Recharge;
