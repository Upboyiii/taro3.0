import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { shopApi } from "@/api/co_admin";
import { navigateTo, eventCenterOn, eventCenterOff } from "@/utils/library";
import { base } from "@/api/config";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Service: FC = () => {

  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getList(page, true);
    eventCenterOn("shopService", () => {
      getList(page, true);
    });
    return () => {
      eventCenterOff("shopService");
    };
  }, []);

  const getList = (page, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
      setIsPage(true);
    }
    shopApi.service.page({ page: page, page_size: pageSize }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data.list && res.data.list.length > 0) {
          setTotal(res.data.total || 0);
          if(page * pageSize > res.data.total){
            setIsPage(false);
          }
          let list = res.data.list ? res.data.list : [];
          setPageList(prv => {
            return [...prv, ...list];
          });
        }else {
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
            {Array(5)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    image
                    imageSize={48}
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
                {pageList.map((item,index)=>{
                  return (
                    <View className="card" key={`card-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={index !== 0}
                        icon={base.file_host + "/" + item.logo}
                        iconSize={40}
                        title={item.name}
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        label={item.title}
                        extraStyle={{ alignSelf: "flex-start" }}
                        extra={item.state !== 1 && <Tag plain={false} type="warning">已停用</Tag>}
                        onClick={()=>{
                          navigateTo( { method:"navigateTo",url:"/pages/shop/service/edit/index?id=" + item.id });
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关属性库" image="favorite" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/shop/service/edit/index" });
          }}
        >
          添加企业服务
        </Button>
      </BottomBar>
    </View>
  );
};

export default Service;
