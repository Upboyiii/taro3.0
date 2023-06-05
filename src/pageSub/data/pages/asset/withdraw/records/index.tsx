import React, { FC, useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { secToDate } from "@/utils/common";
import { assetsApi } from "@/api/co_admin";
import ScrollView from "@/components/scroll-view";
import Skeleton from "@/components/skeleton";
import Cell from "@/components/cell";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import "./index.scss";

const Finance: FC = () => {

  const stateList = {
    1: "提现申请中",
    2: "扣款成功",
    3: "打款中",
    4: "提现成功",
    5: "打款失败"
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
    assetsApi.finance.withdrawRecords({ page: page, page_size: pageSize }).then(res => {
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
                  return (
                    <View className="card" key={`order-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={false}
                        textStyle={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                        title={
                          <React.Fragment>
                            <Tag
                              style={{ marginRight: addUnit(6) }}
                              mark
                              plain={false}
                              dark
                              type={item.type === 1 ? "success" : item.type === 2 ? "info" : "primary"}
                            >
                              {item.type === 1 ? "微信" : item.type === 2 ? "支付宝" : "银行卡"}
                            </Tag>
                            <Text style={{ fontSize: addUnit(16) }}>{item.account_no}</Text>
                          </React.Fragment>
                        }
                        label={item.note}
                      />
                      {item.sub_msg ? (
                        <Cell
                          size="small"
                          contentAlign="left"
                          content={item.sub_msg}
                        />
                      ) : null}
                      <Cell
                        size="small"
                        contentAlign="left"
                        content={secToDate(item.created_at)}
                        contentStyle={{ color: "#666" }}
                        extra={
                          <Tag
                            size="small"
                            plain={false}
                            type={item.state === 1 || item.state === 3 ? "info" : item.state === 4 ? "success" : item.state === 5 ? "primary" : "default"}
                          >
                            {stateList[item.state]}
                          </Tag>
                        }
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

export default Finance;
