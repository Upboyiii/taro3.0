import React, { FC, useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { profileApi } from "@/api/co_admin";
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

const CustomerProfile: FC = () => {

  const statciWordTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码","地图","单选项","多选项","省市区"];
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
    profileApi.profile.page({ page: page, page_size: pageSize }).then(res=>{
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
    eventCenterOn("profileEdit", () => {
      getList(1, true);
    });
    return () => {
      eventCenterOff("profileEdit");
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
                    titleSize={[120, 24]}
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
                      onClick={()=>{
                        if(item.type === 1) return;
                        navigateTo({ url: "/pages/customer/profile/edit/index", method:"navigateTo", params: { id: item.id } });
                      }}
                    >
                      <Cell
                        border={false}
                        align="start"
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        title={item.name}
                        label={`创建时间：${secToDate(item.created_at || 0)}`}
                        labelStyle={{ color: "#666" }}
                        extraStyle={{ marginTop: addUnit(2), display: "flex", flexDirection: "row" }}
                        extra={
                          <React.Fragment>
                            {item.type === 1 ? <Tag plain={false} style={{ marginRight: addUnit(8) }}>系统</Tag> : null}
                            <Tag plain={false} type="info">{statciWordTypeList[item.data_type - 1]}</Tag>
                          </React.Fragment>
                        }
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关赠品活动" image="goods" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/customer/profile/edit/index" });
          }}
        >
          新增资料项
        </Button>
      </BottomBar>
    </View>
  );
};

export default CustomerProfile;

