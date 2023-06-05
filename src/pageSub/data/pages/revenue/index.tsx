// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { secToDate } from "@/utils/common";
import { userApi } from "@/api/user";
import store from "@/store";
import Tabs from "@/components/tabs";
import Dropdown from "@/components/dropdown";
import DateFilter from "@/components/date-fliter";
import classnames from "classnames";
import "./index.scss";

const DataRevenue: FC = () => {

  const tabs = [{ label: "日报", value: 1 }, { label: "月报", value: 2 }];
  const [tabActive, setTabActive] = useState(1);

  const { store_id, coid } = store.getState().storeInfo;
  const [storeID, setStoreID] = useState(store_id);
  const [storeList, setStoreList] = useState<any[]>([]);
  const getStoreList = ()=>{
    userApi.admin.adminList({ page: 1, page_size: 999, coid: coid, order_key: "+created_at" }).then(res=>{
      if(!!res && res.code === 0){
        setStoreList(res.data?.list || []);
      }
    });
  };
  useEffect(()=>{
    getStoreList();
  },[]);


  const [date, setDate] = useState("");
  useEffect(()=>{
    const format = tabActive === 1 ? "{y}-{M}-{d}" : "{y}-{M}";
    const _now = secToDate(new Date().getTime(),format);
    setDate(_now);
  },[tabActive]);

  // @ts-ignore
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [stats, setStats] = useState<any>({});
  const getStats = (store_id, date) => {
    console.log(store_id, date,"store_id, date");
  };
  useEffect(()=>{
    getStats(storeID, date);
  },[storeID, date]);

  const [bem] = createNamespace("stats","data");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Dropdown
        border="top-bottom"
        style={{ justifyContent: storeList.length > 1 ? "space-between" : "center" }}
        prefix={
          <Tabs options={tabs} active={tabActive} onChange={setTabActive} space={12} style={storeList.length < 2 ? { flex: 1 } : {}} />
        }
      >
        {storeList.length > 1 ? (
          <Dropdown.item
            title="选择店铺"
            value={storeID}
            options={storeList}
            format={{ label: "name", value:"store_id" }}
            style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "60%", justifyContent: "flex-end" }}
            onChange={setStoreID}
          />
        ) : null}
      </Dropdown>
      {!!date ? <DateFilter type={tabActive === 2 ? "month" : "day"} value={date} onChange={setDate} /> : null}
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY >
        <View className={classnames("card", bem())}>
          <View className={classnames(bem("title","large"))}>订单实收</View>
          <View className={classnames(bem("body"))}>
            <View className={classnames(bem("item","large"))}>
              <View className={classnames(bem("num", ["primary", "large"]))}>15415151.00</View>
              <View className={classnames(bem("unit","primary"))}>元</View>
            </View>
            <View className={classnames(bem("item","large"))}>
              <View className={classnames("hairline","hairline--left")} style={{ top: addUnit(16), bottom: addUnit(16), borderColor: "#ddd" }} />
              <View className={classnames(bem("num", "large"))}>301</View>
              <View className={classnames(bem("unit"))}>单</View>
            </View>
          </View>
          <View className={classnames(bem("footer"))}>
            包含记账不打款订单，不包含会员储值和无订单的纯扫码支付。
          </View>
        </View>
        <View className={classnames("card", bem())}>
          <View className={classnames(bem("title","large"))}>扫码收款</View>
          <View className={classnames(bem("body"))}>
            <View className={classnames(bem("item","large"))}>
              <View className={classnames(bem("num", ["primary", "large"]))}>15.00</View>
              <View className={classnames(bem("unit","primary"))}>元</View>
            </View>
            <View className={classnames(bem("item","large"))}>
              <View className={classnames("hairline","hairline--left")} style={{ top: addUnit(16), bottom: addUnit(16), borderColor: "#ddd" }} />
              <View className={classnames(bem("num", "large"))}>1</View>
              <View className={classnames(bem("unit"))}>单</View>
            </View>
          </View>
          <View className={classnames(bem("footer"))}>
            店内微信/支付宝/银联收款扣除退款后金额之和，包含会员扫码储值.
          </View>
        </View>
        <View className={classnames("card", bem())}>
          <View className={classnames(bem("title","large"))}>会员储值</View>
          <View className={classnames(bem("body"))}>
            <View className={classnames(bem("item","large"))}>
              <View className={classnames(bem("num", ["primary", "large"]))}>2000.00</View>
              <View className={classnames(bem("unit","primary"))}>元</View>
            </View>
          </View>
          <View className={classnames(bem("footer"))}>
            店内会员储值金额之和，包含记账储值。
          </View>
        </View>
        <View className={classnames("card", bem())}>
          <View className="card-header card-header--border">
            <View className="card-header__title">店内营业指标</View>
          </View>
          <View className={classnames(bem("body"))}>
            <View className={classnames(bem("item"))}>
              <View className={classnames(bem("title"))}>应收金额(元)</View>
              <View className={classnames(bem("num"))}>2555252.20</View>
            </View>
            <View className={classnames(bem("item"))}>
              <View className={classnames("hairline","hairline--left")} />
              <View className={classnames(bem("title"))}>订单数</View>
              <View className={classnames(bem("num"))}>369</View>
            </View>
            <View className={classnames(bem("item"))}>
              <View className={classnames("hairline","hairline--top")} />
              <View className={classnames("hairline","hairline--left")} />
              <View className={classnames(bem("title"))}>今日目标(元)</View>
              <View className={classnames(bem("num"))}>1521.00</View>
            </View>
            <View className={classnames(bem("item"))}>
              <View className={classnames("hairline","hairline--top")} />
              <View className={classnames("hairline","hairline--left")} />
              <View className={classnames(bem("title"))}>实收金额(元)</View>
              <View className={classnames(bem("num"))}>2548.20</View>
            </View>
            <View className={classnames(bem("item"))}>
              <View className={classnames("hairline","hairline--top")} />
              <View className={classnames("hairline","hairline--left")} />
              <View className={classnames(bem("title"))}>就餐人数</View>
              <View className={classnames(bem("num"))}>1587</View>
            </View>
            <View className={classnames(bem("item"))}>
              <View className={classnames("hairline","hairline--top")} />
              <View className={classnames("hairline","hairline--left")} />
              <View className={classnames(bem("title"))}>目标达成率</View>
              <View className={classnames(bem("num"))}>52.20%</View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DataRevenue;
