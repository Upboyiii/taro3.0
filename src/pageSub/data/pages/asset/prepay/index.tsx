import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { assetsApi } from "@/api/co_admin";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import "./index.scss";

const FinancePrepay: FC = () => {

  const [financeLoading, setFinanceLoading] = useState(false);
  const [finance, setFinance] = useState({
    balance: 0,
    wait_balance: 0,
    not_balance: 0
  });
  const getFinance = () => {
    setFinanceLoading(true);
    assetsApi.finance.balance({ type: 1 })
      .then(res => {
        if (res.code === 0) {
          setFinance({
            balance: res.data?.balance || 0,
            wait_balance: res.data?.wait_balance || 0,
            not_balance: res.data?.not_balance || 0
          });
        }
      })
      .finally(() => {
        setFinanceLoading(false);
      });
  };
  useEffect(()=>{
    getFinance();
  },[]);

  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);

  const getList = (page, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
      setIsPage(true);
    }
    assetsApi.finance.customerpage({ page: page, page_size: pageSize }).then(res=>{
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          let list = res.data.list ? res.data.list : [];
          setPageList(prv => {
            return [...prv, ...list];
          });
        }
      } else {
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    }).finally(()=>{
      setLoading(false);
      setRefreshing(false);
      setPulling(false);
    });
  };

  useEffect(() => {
    getList(1,true);
  }, []);

  const onScrollToLower = () => {
    if (isPage) {
      setPulling(true);
      setPage(val => {
        let page = parseInt(val) + 1;
        getList(page);
        return page;
      });
    }
  };

  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getList(1, true);
    },500);
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View
        className="card"
        style={{
          marginTop: addUnit(12),
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: addUnit(16),
          backgroundColor: "#ff2340"
        }}
      >
        <View>
          <View style={{ fontSize: addUnit(10), color: "rgba(255,255,255,.75)" }}>储值余额(元)</View>
          <View style={{ fontSize: addUnit(18), color: "#fff", fontWeight: "bold", marginTop: addUnit(6) }}>
            {!financeLoading ? formatPrice(finance.balance) : "-.--"}
          </View>
        </View>
        <View>
          <View style={{ fontSize: addUnit(10), color: "rgba(255,255,255,.75)", textAlign: "center" }}>待结算金额(元)</View>
          <View style={{ fontSize: addUnit(18), color: "#fff", textAlign: "center", fontWeight: "bold", marginTop: addUnit(6) }}>
            {!financeLoading ? formatPrice(finance.wait_balance) : "-.--"}
          </View>
        </View>
        <View>
          <View style={{ fontSize: addUnit(10), color: "rgba(255,255,255,.75)", textAlign: "right" }}>不可用余额(元)</View>
          <View style={{ fontSize: addUnit(18), color: "#fff", textAlign: "right", fontWeight: "bold", marginTop: addUnit(6) }}>
            {!financeLoading ? formatPrice(finance.not_balance) : "-.--"}
          </View>
        </View>
      </View>
      <View className="card" style={{ flex: 1 }}>
        <View className="card-header card-header--border">
          <View className="card-header__title">储值列表</View>
        </View>
        <ScrollView
          err={err}
          refresh
          refreshing={refreshing}
          onRefresh={onRefresh}
          pullUp={!loading}
          loading={pulling}
          loadMore={total > pageSize}
          loadStart={total > page * pageSize}
          onPullUp={onScrollToLower}
        >
          {loading ? (
            <React.Fragment>
              {Array(6)
                .fill("")
                .map((_, i) => {
                  return (
                    <Skeleton
                      key={i}
                      border={i !== 0}
                      title
                      titleSize={[120, 24]}
                      row={1}
                      rowWidth={160}
                      action
                    />
                  );
                })}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {pageList.length > 0 ? (
                <React.Fragment>
                  {pageList.map((item: any, index) => {
                    return (
                      <Cell
                        key={index}
                        border={index !== 0}
                        title={item.name}
                        label={item.phone}
                        labelStyle={{ marginTop: 0 }}
                        content={`¥${formatPrice(item.balance || 0)}`}
                        contentStyle={{ fontSize: addUnit(16) }}
                      />
                    );
                  })}
                </React.Fragment>
              ) : (
                <Empty desc="暂无相关储值列表" />
              )}
            </React.Fragment>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default FinancePrepay;
