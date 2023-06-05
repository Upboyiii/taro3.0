import React, { FC, useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { customerApi } from "@/api/co_admin";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { secToDate } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const UserCard: FC = () => {

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
    customerApi.userCard.page({ page: page, page_size: pageSize }).then(res=>{
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
    getList(1, true);
    eventCenterOn("userCardEdit", () => {
      getList(1, true);
    });
    return () => {
      eventCenterOff("userCardEdit");
    };
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

  const handleClick = (index, item) => {
    if(index === 0){
      navigateTo({ url: "/pages/customer/userCard/record/index", method:"navigateTo", params: { id: item.id, title: item.name + "-" + item.profile_name + "-" + "档案记录" } });
    }else if(index === 1){
      navigateTo({ url: "/pages/customer/userCard/remind/index", method:"navigateTo", params: { id: item.id, customer_id: item.customer_id, profile_name: item.profile_name } });
    }else if(index === 2){
      navigateTo({ url: "/pages/customer/userCard/edit/index", method:"navigateTo", params: { item: item } });
    }
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
                    action
                    actionSize={[48,12]}
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
                        Taro.showActionSheet({
                          itemList: ["档案记录", "添加提醒", "编辑"],
                          success: function (res) {
                            handleClick(res.tapIndex, item);
                          }
                        });
                      }}
                    >
                      <Cell
                        border={false}
                        align="start"
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        title={item.name}
                        label={item.phone}
                        extraStyle={{ marginTop: addUnit(2), display: "flex", flexDirection: "row" }}
                        extra={item.profile_name ? <Tag plain={false} type="info">{item.profile_name}</Tag> : null}
                      />
                      <Cell
                        size="small"
                        title={`更新时间：${secToDate(item?.updated_at || item?.created_at || 0)}`}
                        textStyle={{ color: "#666" }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关客户档案" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          loading={loading}
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/customer/userCard/edit/index" });
          }}
        >
          新建客户档案卡
        </Button>
      </BottomBar>
    </View>
  );
};

export default UserCard;

