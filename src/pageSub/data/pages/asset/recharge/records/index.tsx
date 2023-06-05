import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { formatPrice, secToDate } from "@/utils/common";
import { orderApi } from "@/api/co_admin";
import { navigateTo } from "@/utils/library";
import ScrollView from "@/components/scroll-view";
import Skeleton from "@/components/skeleton";
import Cell from "@/components/cell";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Button from "@/components/button";
import "./index.scss";

const RechargeRecords: FC = () => {

  const stateList = {
    1: "待付款",
    2: "已关闭",
    3: "支付成功",
    4: "预支付完成",
    10: "售后中",
    11: "售后完成"
  };

  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<any>(1);
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
    orderApi.coOrderQuery.page({ page: page, page_size: pageSize, type: 1 }).then(res => {
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

  useEffect(()=>{
    getList(1,true);
  },[]);

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
            {Array(7)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {pageList.length > 0 ? (
              <React.Fragment>
                {pageList.map((item, index) => {
                  console.log(item,"item");
                  return (
                    <View className="card" key={`order-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={false}
                        title={formatPrice(item.pay_amount)}
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        label={item.subject}
                        extraStyle={item.state !== 1 ? { alignSelf: "flex-start", marginTop: addUnit(4) } : {}}
                        extra={
                          item.state === 1 ? (
                            <Button
                              size="small"
                              type="primary"
                              onClick={()=>{
                                // 跳转到支付页面
                                navigateTo({ method: "navigateTo", url: "/pages/payment/index?id=" + item.id });
                              }}
                            >
                              立即支付
                            </Button>
                          ) : !!stateList[item.state] ? (
                            <Tag
                              plain={false}
                              type={item.state === 1 ? "primary" : item.state === 3 ? "success" : item.state === 10 ? "warning" : "default"}
                            >
                              {stateList[item.state]}
                            </Tag>
                          ) : null
                        }
                      />
                      <Cell
                        size="small"
                        title={`单号${item.id}`}
                        textStyle={{ color: "#666" }}
                        content={secToDate(item.created_at)}
                        contentStyle={{ color: "#666" }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关充值记录" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default RechargeRecords;
