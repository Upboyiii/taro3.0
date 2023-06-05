import React, { FC, useEffect, useState } from "react";
import { View, Image } from "@tarojs/components";
import { orderApi } from "@/api/co_admin";
import { addUnit } from "@/components/utils";
import { formatPrice, secToDate } from "@/utils/common";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { config, findLabel } from "@/pages/order/utils/config";
import ScrollView from "@/components/scroll-view";
import Navbar from "@/components/navbar";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Tabs from "@/components/tabs";
import "./index.scss";

const Order: FC = () => {

  const [tabsActive, setTabsActive] = useState(0);
  const handelTabs = (val) => {
    setTabsActive(val);
    handleFilterChange(val, "state");
  };
  const [filter, setFilter] = useState(config.afterSale.filterInit);
  const handleFilterChange = (val, ref) => {
    setFilter(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  const pageSize = 10;
  const [page, setPage] = useState<any>(1);
  const [total, setTotal] = useState<number>(0);
  const [isPage, setIsPage] = useState(true);
  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const getList = (page, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
      setIsPage(true);
    }
    let _filter = JSON.parse(JSON.stringify(filter));
    _filter.customer_id = !!_filter.customer_id ? parseInt(_filter.customer_id) : null;
    _filter.order_id = !!_filter.order_id ? parseInt(_filter.order_id) : null;

    orderApi.saleOrder.page({ page: page, page_size: pageSize, ..._filter }).then(res => {
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
    }).catch(() => {
      setErr(true);
    }).finally(() => {
      setLoading(false);
      setPulling(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    eventCenterOn("afterSale", res => {
      if (!!res && !!res[0]) {
        setFilter(res[0]);
      } else {
        getList(1, true);
      }
    });
    return () => {
      eventCenterOff("afterSale");
    };
  }, []);

  useEffect(() => {
    getList(1, true);
  }, [filter]);

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
    setTimeout(() => {
      getList(1, true);
    }, 500);
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Navbar
        title="售后维权"
        border
        right={
          <React.Fragment>
            <View style={{ fontSize: addUnit(14), color: "#333" }}>筛选</View>
            <Image
              style={{ width: addUnit(10), height: addUnit(12), marginLeft: addUnit(2) }}
              src={require("@/assets/icons/filter.png")}
              mode="aspectFill"
            />
          </React.Fragment>
        }
        onClickRight={() => {
          navigateTo({ url: "/pages/order/filter/index", method: "navigateTo", params: { form: filter, refs: "afterSale" } });
        }}
      />
      <Tabs active={tabsActive} options={config.afterSale.stateList} onChange={handelTabs} bgColor="#fff" border scroll space={12} />
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
            {Array(4)
              .fill("")
              .map((_, i) => {
                return (
                  <View key={i} className="card" style={i === 0 ? { marginTop: addUnit(12) } : {}}>
                    <Skeleton
                      title
                      align="start"
                      titleSize={[120, 24]}
                      row={1}
                      rowWidth={160}
                      action
                      actionSize={[48, 12]}
                    />
                    <Skeleton
                      border
                      title
                      align="start"
                      titleSize={[120, 24]}
                      row={1}
                      rowWidth={160}
                      action
                      actionSize={[48, 12]}
                    />
                  </View>
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {pageList.length > 0 ? (
              <React.Fragment>
                {pageList.map((item: any, index) => {
                  return (
                    <View
                      key={index}
                      className="card"
                      style={index === 0 ? { marginTop: addUnit(12) } : {}}
                      onClick={() => {
                        navigateTo({ method: "navigateTo", url: "/pages/order/aftersale/detail/index?id=" + item.id + "&order_id=" + item.order_id });
                      }}
                    >
                      <Cell
                        border={false}
                        size="small"
                        title="售后编号"
                        content={item.id}
                      />
                      {/* <Cell*/}
                      {/*  size="small"*/}
                      {/*  title="订单编号"*/}
                      {/*  content={item.order_id}*/}
                      {/*  arrow*/}
                      {/*  onClick={()=>{*/}
                      {/*    navigateTo({ method:"navigateTo", url: "/pages/order/index/detail/index?id=" + item.order_id });*/}
                      {/*  }}*/}
                      {/* />*/}
                      <Cell
                        style={{ paddingBottom: addUnit(8) }}
                        contentStyle={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <View>
                          <View style={{ fontSize: addUnit(10), color: "#999" }}>售后类型</View>
                          <View style={{ fontSize: addUnit(14), color: "#333", marginTop: addUnit(2) }}>
                            {findLabel(item.type, config.afterSale.typeList)}
                          </View>
                        </View>
                        <View>
                          <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>退款金额</View>
                          <View style={{ fontSize: addUnit(16), color: "#ff2340", textAlign: "right", fontWeight: "bold", marginTop: addUnit(2) }}>
                            {formatPrice(item.refund_fee || 0)}
                          </View>
                        </View>
                      </Cell>
                      <Cell
                        border={false}
                        style={{ paddingTop: 0, paddingBottom: addUnit(8) }}
                        contentStyle={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <View>
                          <View style={{ fontSize: addUnit(10), color: "#999" }}>联系人</View>
                          <View style={{ fontSize: addUnit(14), color: "#333", marginTop: addUnit(2) }}>
                            {item?.contacts || "-"}
                          </View>
                        </View>
                        <View>
                          <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>联系方式</View>
                          <View style={{ fontSize: addUnit(14), color: "#333", textAlign: "right", marginTop: addUnit(2) }}>
                            {item?.phone || "-"}
                          </View>
                        </View>
                      </Cell>
                      <Cell
                        size="small"
                        textStyle={{ color: "#999" }}
                        title={secToDate(item.updated_at || item.created_at)}
                        content={
                          <Tag
                            plain={false}
                            type={
                              item.state === 2 || item.state === 10 ? "primary" :
                                item.state === 3 || item.state === 4 ? "warning" :
                                  item.state === 1 || item.state === 5 || item.state === 7 ? "info" : "default"
                            }
                            style={{ width: "60px", float: "right" }}
                          >
                            {findLabel(item.state, config.afterSale.stateList)}
                          </Tag>
                        }
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关数据" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default Order;
