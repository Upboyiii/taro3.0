import React, { FC, useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { formatPrice, secToDate } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import Navbar from "@/components/navbar";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Prepay: FC = () => {

  const pageSize = 10;
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);

  const getList = (page, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    pluginApi.page({
      page: page,
      page_size: pageSize,
      plugin_id: 317,
      plugin_label: "getCoFundList",
      apply_id: undefined
    }).then(res => {
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data?.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          setPageList(list => {
            return [...list, ...res.data.list];
          });
        } else {
          setIsPage(false);
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
    getList(1, true);
    eventCenterOn("prepay", () => {
      getList(1, true);
    });
    return () => {
      eventCenterOff("prepay");
    };
  }, []);

  const onScrollToLower = () => {
    if (isPage) {
      setPulling(true);
      setPage(val => {
        let _page = parseInt(val) + 1;
        getList(_page);
        return _page;
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
      <Navbar
        title="储值金额管理"
        bgColor="#f7f8f8"
        rightStyle={{ color: "#ff2340", fontWeight: "bold", fontSize: addUnit(16) }}
        right="充值"
        onClickRight={() => {
          navigateTo({ url: "/pages/customer/prepay/recharge/index", method: "navigateTo" });
        }}
      />
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
                    align="start"
                    card
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[48, 12]}
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
                    <View
                      className="card"
                      key={index}
                      style={index === 0 ? { marginTop: addUnit(12) } : {}}
                      onClick={() => {
                        navigateTo({ url: "/pages/customer/prepay/edit/index", method: "navigateTo", params: { form: item } });
                      }}
                    >
                      <Cell
                        border={false}
                        align={!!item.mark || !!item.item && Array.isArray(item.item) && item.item.length > 0 ? "start" : "center"}
                        textStyle={{ display: "flex", flexDirection: "row", alignItems: "flex-end" }}
                        title={
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
                        label={item.mark}
                        extraStyle={!!item.mark || !!item.item && Array.isArray(item.item) && item.item.length > 0 ? { marginTop: addUnit(2) } : {}}
                        extra={item.status === 2 ? (<Tag plain={false} type="default">禁用</Tag>) : null}
                      />
                      {!!item.item && Array.isArray(item.item) && item.item.length > 0 ? (
                        <Cell
                          size="small"
                          title={`送储备金¥${formatPrice(item.item[0]?.discount)}`}
                          content={`活动时间:${secToDate(item.item[0]?.start_date || 0, "{y}.{M}.{d}")}-${secToDate(item.item[0]?.end_date || 0, "{y}.{M}.{d}")}`}
                          contentStyle={{ color: "#999" }}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关储值金额" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          disabled={loading}
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            navigateTo({ url: "/pages/customer/prepay/edit/index", method:"navigateTo" });
          }}
        >
          添加储值金额
        </Button>
      </BottomBar>
    </View>
  );
};

export default Prepay;

