import React, { FC, useEffect, useState } from "react";
import { View, Image } from "@tarojs/components";
import { createNamespace } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { assetsApi } from "@/api/co_admin";
import { navigateTo } from "@/utils/library";
import classnames from "classnames";
import "./index.scss";

const Finance: FC = () => {

  const [loading, setLoading] = useState(false);
  const [finance, setFinance] = useState({
    balance: 0,
    wait_balance: 0
  });

  const getFinance = () => {
    setLoading(true);
    assetsApi.finance.balance({ type: 1 })
      .then(res => {
        if (res.code === 0) {
          setFinance({
            balance: res.data?.balance || 0,
            wait_balance: res.data?.wait_balance || 0
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(()=>{
    getFinance();
  },[]);

  const assetList = [
    {
      icon: require("@/assets/icons/data/tally.png"),
      name: "记账本",
      url: "/pages/data/asset/tally/index"
    },
    {
      icon: require("@/assets/icons/data/prepay.png"),
      name: "储值资金",
      url: "/pages/data/asset/prepay/index"
    },
    {
      icon: require("@/assets/icons/data/stats.png"),
      name: "收支汇总",
      url: "/pages/data/asset/stats/index"
    },
    {
      icon: require("@/assets/icons/data/bill.png"),
      name: "对账单",
      url: "/pages/data/asset/bill/index"
    },
    {
      icon: require("@/assets/icons/data/flow.png"),
      name: "流水号",
      url: "/pages/data/asset/flow/index"
    }
  ];

  const [bem] = createNamespace("preview","finance");
  const [tools] = createNamespace("tools","finance");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View
        className={classnames(bem())}
        onClick={()=>{
          navigateTo({ method: "navigateTo", url: "/pages/data/asset/balance/index" });
        }}
      >
        <View className={classnames(bem("header"))}>
          <View className={classnames(bem("title"))}>资金账户</View>
          <View className={classnames(bem("arrow"))} />
        </View>
        <View className={classnames(bem("body"))}>
          <View className={classnames(bem("item"))}>
            <View className={classnames(bem("item-title"))}>可用店铺余额(元)</View>
            <View className={classnames(bem("item-nums"))}>
              {!loading ? formatPrice(finance.balance) : "-.--"}
            </View>
          </View>
          <View className={classnames(bem("item"))}>
            <View className={classnames(bem("item-title"))}>待结算金额(元)</View>
            <View className={classnames(bem("item-nums"))}>
              {!loading ? formatPrice(finance.wait_balance) : "-.--"}
            </View>
          </View>
        </View>
      </View>
      <View className="card">
        <View className="card-header card-header--border">
          <View className="card-header__title">资产服务</View>
        </View>
        <View className={classnames(tools())}>
          {assetList.map((item, index)=>{
            return (
              <React.Fragment key={index}>
                <View
                  className={classnames(tools("item"))}
                  onClick={()=>{
                    navigateTo({ method: "navigateTo", url: item.url });
                  }}
                >
                  {index < 3 ? <View className="hairline hairline--bottom" style={{ borderColor: "#eee" }} /> : null}
                  {index % 3 !== 2 ? <View className="hairline hairline--right"  style={{ borderColor: "#eee" }} /> : null}
                  <Image className={classnames(tools("icon"))} src={item.icon} mode="aspectFill" />
                  <View className={classnames(tools("title"))}>{item.name}</View>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default Finance;
