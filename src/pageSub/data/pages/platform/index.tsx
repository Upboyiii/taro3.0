// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { createNamespace } from "@/components/utils";
import { formatPrice, secToDate } from "@/utils/common";
import { userApi } from "@/api/user";
import { statsApi } from "@/api/stats";
import ScrollView from "@/components/scroll-view";
import shopConfig from "@/locales/shopConfig";
import store from "@/store";
import Dropdown from "@/components/dropdown";
// @ts-ignore
import Tabs from "@/components/tabs";
import DateFilter from "@/components/date-fliter";
import classnames from "classnames";
import "../revenue/index.scss";

const DataGoods: FC = () => {

  // @ts-ignore
  const tabs = [
    { label: "日汇总", value: "day" },
    { label: "月汇总", value: "month" }
  ];
  // @ts-ignore
  const [tabActive, setTabActive] = useState("day");
  // @ts-ignore
  const handelTabs = (val) => {
    const format = val === "month" ? "{y}" : "{y}-{M}";
    const today = secToDate(new Date().getTime(),format);
    handleChange(val === "day" ? 1 : 2, "state");
    handleChange(today,"start_at");
    setTabActive(val);
  };

  const { store_id, coid } = store.getState().storeInfo;
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

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const [filter, setFilter] = useState({
    start_at: secToDate(new Date().getTime(),"{y}-{M}"),
    store_id: store_id,
    stat_mark: 0,
    stat_type: 1,
    state: 1
  });
  const handleChange = (val, ref) => {
    setFilter(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  const getList = () => {
    setErr(false);
    setPageList([]);
    setLoading(true);
    console.log(filter,"filter");
    statsApi.access.details({ page: 1, page_size: 99, ...filter }).then(res=>{
      console.log(res,"res");
      if (!!res && res.code === 0) {
        setPageList(res.data.list || []);
      } else {
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    }).finally(()=>{
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    getList();
  }, [filter.store_id, filter.start_at, filter.stat_mark]);

  const statsTabs = [
    { label: "商品总销量", value: "goods_sales" },
    { label: "商品总取消", value: "goods_cancel" },
    { label: "下单总数", value: "order_nums" },
    { label: "支付订单数", value: "order_pay" },
    { label: "支付金额", value: "order_amount", price: true },
    { label: "支付优惠金额", value: "order_discount", price: true },
    { label: "订单结算数", value: "order_settle" },
    { label: "订单取消数", value: "order_cancel" },
    { label: "总运费", value: "order_freight", price: true },
    { label: "退款笔数", value: "refund_nums" },
    { label: "退款订单数", value: "order_refund" },
    { label: "退款金额", value: "refund_amount", price: true }
  ];
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
    goods_cancel: 0,
    order_freight: 0
  };
  const [statsTotal, setStatsTotal] = useState<any>(init);
  const getStatsTotal = () => {
    let total = init;
    if(pageList.length > 0){
      pageList.forEach(item=>{
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
  useEffect(()=>{
    getStatsTotal();
  },[pageList]);

  const renderStats = (row) => {
    if(row){
      return (
        <View className={classnames(bem("body"))}>
          {statsTabs.map((tab, idx)=>{
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
      <Dropdown
        border="top-bottom"
        style={{ justifyContent: "space-between" }}
        // prefix={
        //   <Tabs
        //     space={10}
        //     active={tabActive}
        //     options={tabs}
        //     onChange={handelTabs}
        //     style={{ paddingLeft: addUnit(4), paddingRight: addUnit(4) }}
        //   />
        // }
      >
        <Dropdown.item
          title="平台来源"
          value={filter.stat_mark}
          options={[{ label: "全部平台", value: 0 },...shopConfig.platformList]}
          style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto" }}
          onChange={(val)=>{handleChange(val,"stat_mark"); }}
        />
        {storeList.length > 1 ? (
          <Dropdown.item
            title="选择店铺"
            value={filter.store_id}
            options={storeList}
            format={{ label: "name", value:"store_id" }}
            style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "56%", justifyContent: "flex-end" }}
            onChange={(val)=>{handleChange(val,"store_id"); }}
          />
        ) : null}
      </Dropdown>
      <DateFilter
        type={tabActive === "day" ? "month" : "year"}
        value={filter.start_at}
        onChange={(val)=>{handleChange(val,"start_at");}}
      />
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <View className="card">
          {renderStats(statsTotal)}
        </View>
      </ScrollView>
    </View>
  );
};

export default DataGoods;
