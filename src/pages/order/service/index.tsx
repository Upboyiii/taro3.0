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

  const stateList = config.serviceOrder.stateList;
  const [tabsActive, setTabsActive] = useState(0);
  const handelTabs = (val) => {
    setTabsActive(val);
    handleFilterChange(val === 0 ? [] : [val], "state");
  };
  const [filter, setFilter] = useState(config.serviceOrder.filterInit);
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
    orderApi.serviceOrder.page({ page: page, page_size: pageSize, ..._filter }).then(res => {
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
      setRefreshing(false);
      setPulling(false);
    });
  };

  useEffect(() => {
    eventCenterOn("serviceOrder", res => {
      if (!!res && !!res[0]) {
        setFilter(res[0]);
      } else {
        getList(1, true);
      }
    });
    return () => {
      eventCenterOff("serviceOrder");
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
        title="服务订单"
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
          navigateTo({ url: "/pages/order/filter/index", method: "navigateTo", params: { form: filter, refs: "serviceOrder" } });
        }}
      />
      <Tabs active={tabsActive} options={stateList} onChange={handelTabs} bgColor="#fff" border scroll space={12} />
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
                        navigateTo({ method: "navigateTo", url: "/pages/order/service/detail/index?id=" + item.id });
                      }}
                    >
                      <Cell
                        border={false}
                        size="small"
                        title="订单号"
                        content={item.id}
                      />
                      {item.subject ? (
                        <Cell
                          style={{ paddingBottom: addUnit(8) }}
                          contentAlign="left"
                          contentStyle={{ fontWeight: "bold" }}
                          content={item.subject}
                        />
                      ) : null}
                      <Cell
                        style={!!item.subject ? { paddingTop: 0 } : {}}
                        border={!item.subject}
                        contentStyle={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <View>
                          <View style={{ fontSize: addUnit(10), color: "#999" }}>平台来源</View>
                          <View style={{ fontSize: addUnit(14), color: "#333", marginTop: addUnit(2) }}>
                            {findLabel(item.platform, config.platformList)}
                          </View>
                        </View>
                        <View>
                          <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>订单总额</View>
                          <View style={{ fontSize: addUnit(16), color: "#333", textAlign: "right", fontWeight: "bold", marginTop: addUnit(2) }}>
                            {formatPrice(item.pay_amount || 0)}
                          </View>
                        </View>
                      </Cell>
                      <Cell
                        size="small"
                        textStyle={{ color: "#999" }}
                        title={secToDate(item.created_at)}
                        content={
                          <Tag
                            plain={false}
                            type={
                              item.state === 1 ? "primary" :
                                item.state === 3 || item.state === 4 ? "info" :
                                  item.state === 6 ? "warning" : "default"
                            }
                            style={{ width: "60px", float: "right" }}
                          >
                            {findLabel(item.state, stateList)}
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
