// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { View, ScrollView, Text } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { secToDate } from "@/utils/common";
import { userApi } from "@/api/user";
import store from "@/store";
import Tabs from "@/components/tabs";
import Dropdown from "@/components/dropdown";
import Tag from "@/components/tag";
import DateFilter from "@/components/date-fliter";
import classnames from "classnames";
import "../revenue/index.scss";

const DataProfit: FC = () => {

  const tabs = [{ label: "日盈亏", value: 1 }, { label: "月盈亏", value: 2 }];
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
          <View className={classnames(bem("title","large"))}>超盈亏已赚(元)</View>
          <View className={classnames(bem("body"))} style={{ justifyContent: "space-between", paddingBottom: addUnit(4) }}>
            <View className={classnames(bem("item","large"))}>
              <View className={classnames(bem("num",["primary","large"]))}>14458852.85</View>
              <View className={classnames(bem("unit","primary"))}>元</View>
            </View>
            <View className={classnames(bem("item","large"))} style={{ alignItems: "center" }}>
              <Tag plain={false} type="success">较昨日+2.77.00</Tag>
            </View>
          </View>
          <View className={classnames(bem("body"))}>
            <View className="hairline hairline--top" />
            <View className={classnames(bem("item"))}>
              <View className={classnames(bem("title"))}>日盈亏平衡点(元)</View>
              <View className={classnames(bem("num"))}>58852.85</View>
            </View>
            <View className={classnames(bem("item"))}>
              <View className="hairline hairline--left" />
              <View className={classnames(bem("title"))}>营业收入(元)</View>
              <View className={classnames(bem("num"))}>1445885.00</View>
              <View className={classnames(bem("desc-wrap"))}>
                <View className={classnames(bem("desc"))}>较昨日+2.77.00</View>
                <View className={classnames(bem("desc", "green"))}>+1%</View>
              </View>
            </View>
          </View>
        </View>
        <View className={classnames("card", bem())}>
          <View className="card-header">
            <View className="card-header__title">按小时累计营业收入趋势</View>
          </View>
          <View className={classnames(bem("percentage"))}>
            <View className={classnames(bem("percent"))}>
              <View className={classnames(bem("percent-icon", "profit"))} />
              <Text className={classnames(bem("percent-text"))}>营业收入</Text>
            </View>
            <View className={classnames(bem("percent"))}>
              <View className={classnames(bem("percent-icon", "loss"))} />
              <Text className={classnames(bem("percent-text"))}>日盈亏红线</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DataProfit;
