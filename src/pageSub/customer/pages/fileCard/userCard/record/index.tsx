import React, { FC, useState, useEffect } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { customerApi } from "@/api/co_admin";
import { secToDate } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Empty from "@/components/empty";
import Skeleton from "@/components/skeleton";
import "./index.scss";

const UserCardRecord: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _title = getCurrentInstance().router?.params?.title;

  const pageSize = 10;
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);

  const getList = (page, refresh = false)=>{
    if(refresh){
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    customerApi.cardRecord.page({ card_id: Number(_id), page: page, page_size: pageSize }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data?.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          setPageList(list => {
            return [...list, ...res.data.list];
          });
        }else {
          setIsPage(false);
        }
      }else{
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
    if(!!_title) Taro.setNavigationBarTitle({ title: _title });
    getList(1, true);
  }, []);

  const onScrollToLower = () => {
    if(isPage){
      setPulling(true);
      setPage(val=>{
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
                    titleSize={[120, 20]}
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
                {pageList.map((item: any, index) => {
                  return (
                    <View
                      className="card"
                      key={index}
                      style={index === 0 ? { marginTop: addUnit(12) } : {}}
                    >
                      <Cell
                        border={false}
                        align="start"
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        title={item.note}
                        label={`更新时间：${secToDate(item?.updated_at || item?.created_at || 0)}`}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关档案卡记录" image="goods" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default UserCardRecord;

