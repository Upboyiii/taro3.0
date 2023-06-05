import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { eventCenterOn, eventCenterOff,navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import { secToDate } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Tabs from "@/components/tabs";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Groupon: FC = () => {

  const tabs = [
    { label: "普通拼团", value: 1 },
    { label: "老带新拼团", value: 2 },
    { label: "阶梯拼团", value: 3 }
  ];

  const [tabsActive, setTabsActive] = useState(1);
  const handelTabs = (val) => {
    setPage(1);
    setTabsActive(val);
    getList(page, val, true);
  };

  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const getList = (page, type, refresh = false)=>{
    if(refresh){
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    pluginApi.page({
      page: page,
      page_size: pageSize,
      plugin_id: 322,
      plugin_label: "getCollageList",
      type: type
    }).then(res=>{
      // console.log(res.data?.list,"res.data?.list");
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
    getList(page, 1, true);
    eventCenterOn("grouponEdit", () => {
      setTabsActive(1);
      getList(page, 1, true);
    });
    return () => {
      eventCenterOff("grouponEdit");
    };
  }, []);

  const onScrollToLower = () => {
    if (isPage) {
      setPulling(true);
      setPage(val => {
        let page = parseInt(val) + 1;
        getList(page, tabsActive);
        return page;
      });
    }
  };

  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () =>{
    setRefreshing(true);
    setTimeout(()=>{
      getList(1, tabsActive, true);
    },500);
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Tabs active={tabsActive} options={tabs} onChange={handelTabs} bgColor="#fff" border />
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
                {pageList.map((item, index) => {
                  return (
                    <View
                      className="card"
                      key={`card-${index}`}
                      style={index === 0 ? { marginTop: addUnit(12) } : {}}
                      onClick={() => {
                        navigateTo({
                          url: "/pages/shop/groupon/edit/index",
                          method: "navigateTo",
                          params: { id: item.id }
                        });
                      }}
                    >
                      <Cell
                        border={false}
                        align="start"
                        title={item.name}
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        extraStyle={{ marginTop: addUnit(2) }}
                        extra={
                          <Tag
                            plain={false}
                            type={item.state === 1 ? "primary" : item.state === 2 ? "info" : "default"}
                          >
                            {item.state === 9 ? "已失效" : ["未开始", "进行中", "已结束"][item.state - 1]}
                          </Tag>
                        }
                      />
                      <Cell
                        title={`活动时间：${secToDate(item.start_at, "{y}.{M}.{d} {h}:{m}:{s}")} - ${secToDate(item.end_at, "{y}.{M}.{d} {h}:{m}:{s}")}`}
                        textStyle={{ fontSize: addUnit(12), color: "#999" }}
                        style={{ paddingTop: addUnit(4), paddingBottom: addUnit(4) }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关拼团" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          disabled={loading}
          onClick={() => {
            navigateTo({ url: "/pages/shop/groupon/edit/index", method: "navigateTo" });
          }}
        >
          创建拼团活动
        </Button>
      </BottomBar>
    </View>
  );
};

export default Groupon;
