import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, ScrollView, Text } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { orderApi } from "@/api/co_admin";
import { pluginApi } from "@/api/base";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
// import { Linking } from "react-native";
import Cell from "@/components/cell";
import NavBar from "@/components/navbar";
import Button from "@/components/button";
import Radio from "@/components/radio";
import BottomBar from "@/components/bottom-bar";
import Empty from "@/components/empty";
import "./index.scss";

const Recharge: FC = () => {

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [customerID, setCustomerdID] = useState(0);
  const [customer, setCustomer] = useState<any>({});
  const [checkID, setCheckId] = useState(0);
  const [prepayList, setPrepayList] = useState<any[]>([]);

  const getBenefit = (id, index) => {
    if(prepayList[index].benefit) return;
    pluginApi
      .plugin("get",317, "coBenefit", JSON.stringify({ id: id }),20462399, { load: false })
      .then(res => {
        if (res.code === 0) {
          const data = (res?.data || []).map(item=>item.name);
          setPrepayList(prevState => {
            let temp = JSON.parse(JSON.stringify(prevState));
            temp[index].benefit = data;
            return temp;
          });
        }
      });
  };
  const getPrepayList = () => {
    setLoading(true);
    pluginApi
      .page({
        plugin_label: "getCoFundList",
        plugin_id: 317,
        order_key: "",
        page: 1,
        page_size: 99
      })
      .then(res => {
        if (!!res && res.code === 0) {
          let _list = (res.data.list || []).filter(item => item.status === 1);
          setPrepayList(_list);
        }else{
          setErr(true);
        }
      })
      .catch(()=>{
        setErr(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(()=>{
    getPrepayList();
    eventCenterOn("prepay", () => {
      getPrepayList();
    });
    eventCenterOn("prepayRecharge", (res) => {
      if(!!res[0]){
        setCustomerdID(res[0].ids);
        setCustomer(res[0].customer);
      }
      console.log(res[0],"prepayRecharge");
    });
    return () => {
      eventCenterOff("prepay");
      eventCenterOff("prepayRecharge");
    };
  },[]);

  const saveRecharge = () => {
    if(!customerID){
      Taro.showToast({ title: "请选择要充值的用户", icon: "none" });
      return;
    }
    if(!checkID){
      Taro.showToast({ title: "请选择要充值的金额", icon: "none" });
      return;
    }
    setLoading(true);
    pluginApi
      .plugin("PUT",317,"coRecharge",JSON.stringify({ id: checkID, user_id: customerID }))
      .then(res => {
        if (res.code === 0) {
          if (res?.data?.id) {
            goPay(res?.data?.id);
          }else{
            eventCenterTrigger("prepayRecords" );
            navigateTo({ url:"/pages/customer/prepay/records/index", method:"navigateTo" });
          }
        }else{
          Taro.showToast({ title: res?.message || "充值失败", icon: "error" });
        }
      }).catch((res)=>{
      Taro.showToast({ title: res?.message || "充值失败", icon: "error" });
    }).finally(()=>{
      setLoading(false);
    });
  };
  const goPay = (order_id) => {
    orderApi.userOrder.getOrderPay({ order_id: order_id, order_type: 1 }).then(res=>{
      if(res.code === 0){
        // 打开网页支付
        if(res.data.pay_url){
          // Linking.openURL(res.data.pay_url);
        }
      }else{
        !!res?.message && Taro.showToast({ title: res?.message, icon: "error" });
      }
    }).catch((res)=>{
      Taro.showToast({ title: res?.message, icon: "error" });
    });
    // 跳转到支付页面
    // navigateTo({ method: "navigateTo", url: "/pages/com/pay/index",params:{ order_id:order_id ,order_type:2,delta:1 ,eventLabel:"" } });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <NavBar
        title="给用户充值"
        bgColor="#f7f8f8"
        right="充值记录"
        rightStyle={{ color: "#333", fontWeight: "bold" }}
        onClickRight={()=>{
          navigateTo({ method: "navigateTo", url: "/pages/customer/prepay/records/index" });
        }}
      />
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!err ? (
          <React.Fragment>
            <View className="card-title">充值用户</View>
            <View
              className="card"
              onClick={()=>{
                navigateTo({ method: "navigateTo", url: "/pages/com/search-customer/index", params: { ids: customerID, refs: "prepayRecharge" } });
              }}
            >
              {Object.keys(customer).length > 0 ? (
                <React.Fragment>
                  <Cell
                    border={false}
                    title={`${customer.name}-${customer.phone}`}
                    textStyle={{ fontWeight: "bold" }}
                    labelStyle={{ marginTop: 0 }}
                    label={`余额：¥${formatPrice(customer.reserve)}`}
                    arrow
                  />
                </React.Fragment>
              ) : (
                <Cell border={false} title="选择要充值的用户" arrow extra="去选择" />
              )}
            </View>
            <View className="card-title">充值金额</View>
            <React.Fragment>
              {prepayList.length > 0 ? (
                <React.Fragment>
                  {prepayList.map((item, index)=>{
                    return (
                      <View
                        className="card"
                        key={index}
                        onClick={()=>{
                          setCheckId(item.id);
                        }}
                      >
                        <Radio
                          border={false}
                          cell
                          labelStyle={{ display: "flex", flexDirection: "row", alignItems: "flex-end", paddingTop: addUnit(4) }}
                          label={
                            <React.Fragment>
                              <Text style={{ fontSize: addUnit(22), lineHeight: addUnit(24) }}>
                                {(item.amount / 100).toFixed(2).split(".")[0]}
                              </Text>
                              <Text style={{ fontSize: addUnit(16), paddingBottom: addUnit(1) }}>
                                {`.${(item.amount / 100).toFixed(2).split(".")[1]}`}
                              </Text>
                              <Text style={{ fontSize: addUnit(13), paddingBottom: addUnit(3) }}>元</Text>
                            </React.Fragment>
                          }
                          desc={
                            <React.Fragment>
                              {item.item && item.item.length > 0 ? (
                                <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                                  {item.item.map((row, idx)=>{
                                    let time = new Date().getTime() / 1000;
                                    if(row.type !== 1 || row.start_date > time || time > row.end_date) return null;
                                    return (
                                      <Text key={`discount-${index}-${idx}`} style={{ color: "#999", fontSize: addUnit(12) }}>
                                        {`送${formatPrice(row.discount)}元；`}
                                      </Text>
                                    );
                                  })}
                                </View>
                              ) : null}
                              {item.benefit && item.benefit.length > 0 ? (
                                <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                                  {item.benefit.map((row, idx)=>{
                                    return (
                                      <Text key={`benefit-${index}-${idx}`} style={{ color: "#999", fontSize: addUnit(12) }}>
                                        {`送${row}；`}
                                      </Text>
                                    );
                                  })}
                                </View>
                              ) : null}
                              <View style={{ color: "#999", fontSize: addUnit(12) }}>{item.mark}</View>
                            </React.Fragment>
                          }
                          checked={checkID === item.id}
                          value={item.id}
                          onChange={setCheckId}
                          onClick={()=>{
                            getBenefit(item.id, index);
                          }}
                        />
                      </View>
                    );
                  })}
                </React.Fragment>
              ) : (
                <Empty card desc="暂未设置储值金额">
                  <Button
                    type="info"
                    onClick={()=>{
                      navigateTo({ url: "/pages/customer/prepay/edit/index", method:"navigateTo" });
                    }}
                  >
                    添加储值金额
                  </Button>
                </Empty>
              )}
            </React.Fragment>
          </React.Fragment>
        ) : (
          <Empty desc="加载错误，请返回重试" image="error" />
        )}
      </ScrollView>
      {!err && prepayList.length > 0 ? (
        <BottomBar>
          <Button
            loading={loading}
            style={{ width: "70%" }}
            size="medium"
            type="primary"
            onClick={saveRecharge}
          >
            确认充值
          </Button>
        </BottomBar>
      ) : null}
    </View>
  );
};

export default Recharge;
