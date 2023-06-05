import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, Picker } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { formatPrice, secToDate } from "@/utils/common";
import { findLabel } from "@/pages/order/utils/config";
import { userApi } from "@/api/user";
import { statsApi } from "@/api/stats";
import ScrollView from "@/components/scroll-view";
import store from "@/store";
import Dropdown from "@/components/dropdown";
import Tabs from "@/components/tabs";
import DateFilter from "@/components/date-fliter";
import EchartLine from "@/components/Echarts/line";
import classnames from "classnames";
import "../revenue/index.scss";

const DataHour: FC = () => {

  const { store_id, coid } = store.getState().storeInfo;
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
  const [filter, setFilter] = useState({
    store_id: store_id,
    start_at: secToDate(new Date().getTime(), "{y}-{M}-{d}"),
    state: 1
  });
  const handleChange = (val, ref) => {
    setFilter(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };
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
  const [err, setErr] = useState(false);
  const getList = () => {
    setStats([]);
    setErr(false);
    setLoading(true);
    statsApi.access.hour({ page: 1, page_size: 999, ...filter }).then(res=>{
      console.log(res?.data?.list,"res?.data?.list");
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
      setRefreshing(false);
    });
  };
  useEffect(()=>{
    setUnfold(false);
    getList();
  },[filter.store_id, filter.start_at]);

  const [lineData, setLineData] = useState<any[]>([]);
  const [lineLabel, setLineLabel] = useState<any[]>([]);
  const [statsTotal, setStatsTotal] = useState<any>(init);
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
    }
    setStatsTotal(total);
  };
  const getLineLabel = () => {
    let labels:any = [];
    if(stats.length > 0){
      stats.map((item, index)=>{
        if(index === 0){
          labels.push(secToDate(item.count_time, "{h}:{m}"));
        }
        if(index !== 0 && index !== stats.length - 1){
          if(stats.length <= 8){
            labels.push(secToDate(item.count_time, "{h}:{m}"));
          }else if(stats.length <= 16 && index % 2 === 0){
            labels.push(secToDate(item.count_time, "{h}:{m}"));
          }else if(stats.length <= 24 && index % 3 === 0){
            labels.push(secToDate(item.count_time, "{h}:{m}"));
          }
        }
        if(index !== 0 && index === stats.length - 1){
          labels.push(secToDate(item.count_time, "{h}:{m}"));
        }
      });
    }
    setLineLabel(labels);
  };
  const getLineData = (ref) => {
    let _data:any = [];
    if(stats.length > 0){
      stats.map(item=>{
        let num = item[ref] || 0;
        const aaa = tabs.filter(item=>item.value === ref);
        if(aaa.length > 0 && aaa[0].price){
          num = (num / 100).toFixed(2);
        }
        _data.push(num);
      });
    }
    setLineData(_data);
  };
  useEffect(()=>{
    getStatsTotal();
    getLineLabel();
    getLineData("goods_sales");
  },[stats]);
  useEffect(()=>{
    getLineData(tabActive);
  },[stats, tabActive]);

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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getList();
    },500);
  };

  const [bem] = createNamespace("stats","data");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {storeList.length > 1 ? (
        <Dropdown
          border="top-bottom"
          style={{ justifyContent: "space-between" }}
          prefix={
            <View className={classnames(bem("filter"))}>
              <Picker
                value={filter.start_at}
                mode="date"
                fields="day"
                start={secToDate(new Date(2020,0,1).getTime(),"{y}-{M}-{d}")}
                end={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  handleChange(e.detail.value,"start_at");
                }}
              >
                <View className={classnames(bem("filter-date"))}>
                  <View className={classnames(bem("filter-time"))}>
                    {secToDate(new Date(filter.start_at).getTime(), "{y}年{M}月{d}日")}
                  </View>
                  <View className={classnames(bem("filter-arrow"))} />
                </View>
              </Picker>
            </View>
          }
        >
          <Dropdown.item
            title="选择店铺"
            value={filter.store_id}
            options={storeList}
            format={{ label: "name", value:"store_id" }}
            style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "56%", justifyContent: "flex-end" }}
            onChange={(val)=>{handleChange(val,"store_id"); }}
          />
        </Dropdown>
      ) : (
        <DateFilter value={filter.start_at} onChange={(val)=>{handleChange(val,"start_at");}} />
      )}
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {!unfold ? (
          <View className="card" style={storeList.length > 1 ? { marginTop: addUnit(12) } : {}}>
            <View className="card-header card-header--border">
              <View className="card-header__title">营业概况</View>
              {stats.length > 1 ? (
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
                <View className="card" key={index} style={index === 0 && storeList.length > 1 ? { marginTop: addUnit(12) } : {}}>
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
        {stats.length > 1 ? (
          <View className={classnames("card", bem())}>
            <View className="card-header card-header--border">
              <View className="card-header__title">营业趋势</View>
            </View>
            <Tabs options={tabs} active={tabActive} onChange={setTabActive} scroll border color="#888" />
            {lineLabel.length > 0 && lineLabel.length > 0 ? (
              <View style={{ marginLeft: addUnit(8) }}>
                <EchartLine
                  options={[{ data: lineData, name: findLabel(tabActive, tabs) }]}
                  label={{ data: lineLabel, interval: 0, rotate: lineLabel.length > 5 ? "30" : lineLabel.length > 10 ? "60" : "0" }}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default DataHour;
