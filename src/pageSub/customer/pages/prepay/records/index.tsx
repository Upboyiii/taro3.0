import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { formatPrice, secToDate } from "@/utils/common";
import { pluginApi } from "@/api/base";
import ScrollView from "@/components/scroll-view";
import Skeleton from "@/components/skeleton";
import Cell from "@/components/cell";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import "./index.scss";

const RechargeRecords: FC = () => {

  const stateList = {
    1: "成功",
    2: "失败"
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

    pluginApi.page({ apply_id: undefined, plugin_label: "getList", plugin_id: 317, page: page, page_size: pageSize }).then(res => {
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
                        style={{ paddingBottom: addUnit(10) }}
                        title={formatPrice(item.amount)}
                        textStyle={{ fontSize: addUnit(20) }}
                        label={item.fund_status === 1 && item.discount && item.type === 1 ? `赠送${formatPrice(item.discount)}` : item.mark}
                        extraStyle={item.state !== 1 ? { alignSelf: "flex-start", marginTop: addUnit(4) } : {}}
                        extra={
                          <Tag
                            plain={false}
                            type={item.fund_status === 1 ? "success" : item.fund_status === 2 ? "warning" : "default"}
                          >
                            {!item.fund_status ? "已取消" : stateList[item.fund_status]}
                          </Tag>
                        }
                      />
                      <Cell
                        size="small"
                        title={`充值时间${secToDate(item.updated_at)}`}
                        textStyle={{ color: "#666" }}
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
