// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, ScrollView, Text, Picker } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { formatPrice, secToDate } from "@/utils/common";
import { findLabel } from "@/pages/order/utils/config";
import { userApi } from "@/api/user";
import { statsApi } from "@/api/stats";
import store from "@/store";
import Dropdown from "@/components/dropdown";
import Tabs from "@/components/tabs";
import Empty from "@/components/empty";
import classnames from "classnames";
import "../revenue/index.scss";

const DataProfit: FC = () => {

  const tabs = [
    { label: "商品总销量", value: "goods_sales" },
    { label: "商品总取消", value: "goods_cancel" },
    { label: "下单总数", value: "order_nums" },
    { label: "支付订单数", value: "order_pay" },
    { label: "支付金额", value: "order_amount", price: true },
    { label: "支付优惠金额", value: "order_discount", price: true },
    { label: "订单结算数", value: "order_settle" },
    { label: "订单取消数", value: "order_cancel" },
    { label: "退款笔数", value: "refund_nums" },
    { label: "退款订单数", value: "order_refund" },
    { label: "退款金额", value: "refund_amount", price: true }
  ];
  const [tabActive, setTabActive] = useState("goods_sales");

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

  const _now = secToDate(new Date().getTime(), "{y}-{M}-{d}");
  const [date, setDate] = useState(_now);
  const [loading, setLoading] = useState(false);
  const [unfold, setUnfold] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const init = {
    refund_amount: 0,
    refund_nums: 0,
    order_nums: 0,
    order_pay: 0,
    order_cancel: 0,
    order_amount: 0,
    order_discount: 0,
    order_settle: 0,
    order_refund: 0,
    goods_sales: 0,
    goods_cancel: 0
  };
  const [statsTotal, setStatsTotal] = useState<any>(init);
  const [err, setErr] = useState(false);
  const getList = (store_id, date) => {
    setStats([]);
    setErr(false);
    setLoading(true);
    const filter = {
      store_id: store_id,
      start_at: date,
      end_at: date
    };
    statsApi.access.hour({ page: 1, page_size: 999, ...filter }).then(res=>{
      if(!!res && res.code === 0){
        setStats(res?.data?.list || []);
      }else{
        setErr(true);
      }
    }).catch(res=>{
      setErr(true);
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(()=>{
      setLoading(false);
    });
  };
  useEffect(()=>{
    setUnfold(false);
    getList(storeID, date);
  },[storeID, date]);

  const getStatsTotal = () => {
    let total = init;
    if(stats.length > 0){
      stats.forEach(item=>{
        total.refund_amount += item?.refund_amount || 0;
        total.refund_nums += item?.refund_nums || 0;
        total.order_nums += item?.order_nums || 0;
        total.order_pay += item?.order_pay || 0;
        total.order_cancel += item?.order_cancel || 0;
        total.order_amount += item?.order_amount || 0;
        total.order_discount += item?.order_discount || 0;
        total.order_settle += item?.order_settle || 0;
        total.order_refund += item?.order_refund || 0;
        total.goods_sales += item?.goods_sales || 0;
        total.goods_cancel += item?.goods_cancel || 0;
      });
      setStatsTotal(total);
    }
  };
  useEffect(()=>{
    getStatsTotal();
  },[stats]);

  const renderStats = (row) => {
    if(row){
      return (
        <View className={classnames(bem("body"))}>
          {tabs.map((tab, idx)=>{
            return (
              <View className={classnames(bem("item"))} key={tab.value}>
                {idx % 2 !== 1 ? <View className={classnames("hairline","hairline--right")} /> : null}
                {idx < 10 ? <View className={classnames("hairline","hairline--bottom")} /> : null}
                <View className={classnames(bem("title"))}>{`${tab.label}${tab.price ? "(元)" : ""}`}</View>
                <View className={classnames(bem("num"))}>
                  {!loading ? (tab.price ? formatPrice(row[tab.value] || 0) : row[tab.value] || 0) : (tab.price ? "-.--" : "-")}
                </View>
              </View>
            );
          })}
        </View>
      );
    }
    return null;
  };

  const [bem] = createNamespace("stats","data");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Dropdown
        style={storeList.length > 1 ? { justifyContent: "space-between" } : {}}
        border="top-bottom"
        prefix={
          <View className={classnames(bem("filter"))}>
            <Picker
              value={date}
              mode="date"
              fields="day"
              start={secToDate(new Date(2020,0,1).getTime(),"{y}-{M}-{d}")}
              end={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
              onChange={(e)=>{
                setDate(e.detail.value);
              }}
            >
              <View className={classnames(bem("filter-date"))}>
                <View className={classnames(bem("filter-time"))}>
                  {secToDate(new Date(date).getTime(), "{y}年{M}月{d}日")}
                </View>
                <View className={classnames(bem("filter-arrow"))} />
              </View>
            </Picker>
          </View>
        }
      >
        {storeList.length > 1 ? (
          <Dropdown.item
            title="选择店铺"
            value={storeID}
            options={storeList}
            format={{ label: "name", value:"store_id" }}
            style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "56%", justifyContent: "flex-end" }}
            onChange={setStoreID}
          />
        ) : null}
      </Dropdown>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!err ? (
          <React.Fragment>
            {!unfold ? (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                <View className="card-header card-header--border">
                  <View className="card-header__title">营业概况</View>
                  {stats.length > 0 ? (
                    <View
                      className="card-header__extra"
                      style={{ padding: addUnit(10), margin: addUnit(-10) }}
                      onClick={()=>{setUnfold(true);}}
                    >
                      分时展示
                    </View>
                  ) : null}
                </View>
                {renderStats(statsTotal)}
              </View>
            ) : (
              <React.Fragment>
                {stats.map((item:any, index)=>{
                  return (
                    <View className="card" key={index} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <View className="card-header card-header--border">
                        <View className="card-header__title">{`时间：${secToDate(item.count_time, "{h}:{m}")}`}</View>
                        <View
                          className="card-header__extra"
                          style={{ padding: addUnit(10), margin: addUnit(-10) }}
                          onClick={()=>{setUnfold(false);}}
                        >
                          收起
                        </View>
                      </View>
                      <View className={classnames(bem("body"))}>
                        {tabs.map((tab, idx)=>{
                          return (
                            <View className={classnames(bem("item"))} key={tab.value}>
                              {idx % 2 !== 1 ? <View className={classnames("hairline","hairline--right")} /> : null}
                              {idx < 10 ? <View className={classnames("hairline","hairline--bottom")} /> : null}
                              <View className={classnames(bem("title"))}>{`${tab.label}${tab.price ? "(元)" : ""}`}</View>
                              <View className={classnames(bem("num"))}>
                                {!loading ? (tab.price ? formatPrice(item[tab.value] || 0) : item[tab.value] || 0) : (tab.price ? "-.--)" : "-")}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </React.Fragment>
            )}
            <View className={classnames("card", bem())}>
              <View className="card-header card-header--border">
                <View className="card-header__title">营业趋势</View>
              </View>
              <Tabs options={tabs} active={tabActive} onChange={setTabActive} scroll border color="#888" />
              <View className={classnames(bem("percentage"))}>
                <View className={classnames(bem("percent"))}>
                  <View className={classnames(bem("percent-icon","small"))} />
                  <Text className={classnames(bem("percent-text","small"))}>
                    {findLabel(tabActive, tabs)}
                  </Text>
                </View>
              </View>
              <View style={{ padding: addUnit(64) }}>
                小时折线图
              </View>
            </View>
          </React.Fragment>
        ) : (
          <Empty desc="加载错误，请返回重试" image="error" />
        )}
      </ScrollView>
    </View>
  );
};

export default DataProfit;
