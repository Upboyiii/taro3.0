import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { eventCenterOn, eventCenterOff,navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import { formatPrice } from "@/utils/common";
import { getMainStore } from "@/utils/app";
import { settingApi } from "@/api/co_admin";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Tabs from "@/components/tabs";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Coupon: FC = () => {

  const mainStore = getMainStore();// 店铺类型
  const [storeConfig, setStoreConfig] = useState({
    custom: "1",
    approval: "2"
  });
  const getStoreConfig = () =>  {
    setLoading(true);
    settingApi.config.info({ alias: ["storeConfig"] })
      .then(res => {
        if (res?.code === 0 && res?.data && res?.data["storeConfig"]) {
          const _storeConfig = res?.data["storeConfig"];
          setStoreConfig({
            custom: _storeConfig?.custom_coupon || "1",
            approval: _storeConfig?.coupon_approval || "2"
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const tabs = [
    { label: "使用中", value: 1 },
    { label: "已下架", value: 2 },
    { label: "已禁用", value: 4 }
  ];
  if(mainStore === 1) tabs.unshift({ label: "待审批", value: 3 });
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

  const getList = (page, state, refresh = false)=>{
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
      plugin_id: 164,
      plugin_label: "page",
      state: state
    }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          // console.log(res.data?.list,"res.data?.list");
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
    if (mainStore > 2) {
      getStoreConfig();
    }
    eventCenterOn("couponEdit", () => {
      setTabsActive(1);
      getList(page, 1, true);
    });
    return () => {
      eventCenterOff("couponEdit");
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

  const faceAmount = (item) => {
    let content: any = null;
    switch (item.type) {
      case 1:
        // 满减
        // content = (
        //   <React.Fragment>
        //     <Text className={classnames(bem("small","currency"))}>¥</Text>
        //     <Text className={classnames(bem("value"))}>{formatAmount(item.discount.cut_money)}</Text>
        //   </React.Fragment>
        // );
        content = "满减" + formatPrice(item?.discount?.cut_money || 0) + "元";
        break;
      case 2: // 折扣
              // content = (
              //   <React.Fragment>
              //     <Text className={classnames(bem("value"))}>{formatDiscount(item.discount.discount)}</Text>
              //     <Text className={classnames(bem("small","unit"))}>折</Text>
              //   </React.Fragment>
              // );
        content = "打" + ((item?.discount?.discount || 0) / 10).toFixed(1) + "折";
        break;
      case 3: // 随机减
              // content = (
              //   <React.Fragment>
              //     <Text className={classnames(bem("small","currency"))}>¥</Text>
              //     <Text className={classnames(bem("value"))}>{formatAmount(item.discount.min_money)}</Text>
              //     <Text className={classnames(bem("small","to"))}>~</Text>
              //     <Text className={classnames(bem("value"))}>{formatAmount(item.discount.max_money)}</Text>
              //   </React.Fragment>
              // );
        content = "随机减" + formatPrice(item?.discount?.min_money || 0) + "~" + formatPrice(item?.discount?.max_money || 0) + "元";
        break;
      case 4:
        // content = <Text className={classnames(bem("dui"))}>兑换券</Text>;
        content = "指定商品兑换券";
        break;
      default:
        content = null;
        break;
    }
    return content;
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
                    <View className="card" key={`card-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={false}
                        align="start"
                        title={item.name}
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        labelStyle={{ fontSize: addUnit(14), marginTop: addUnit(4), marginBottom: addUnit(2), color: "#ff2340" }}
                        label={faceAmount(item)}
                        extraStyle={{ marginTop: addUnit(2) }}
                        extra={
                          <Tag
                            plain={false}
                            type={item.type === 1 ? "success" : item.type === 2 ? "primary" : item.type === 3 ? "warning" : "info"}
                          >
                            {["满减券", "折扣券", "随机金额券", "商品兑换券"][item.type - 1]}
                          </Tag>
                        }
                        onClick={() => {
                          navigateTo({
                            url: "/pages/shop/coupon/edit/index",
                            method: "navigateTo",
                            params: {
                              id: item.id,
                              approval: storeConfig.approval
                            }
                          });
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关优惠券" image="coupon" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          disabled={mainStore > 2 && storeConfig.custom === "2" || loading}
          onClick={() => {
            navigateTo({ url: "/pages/shop/coupon/edit/index", method: "navigateTo", params: { approval: storeConfig.approval } });
          }}
        >
          {mainStore > 2 && storeConfig.custom === "2" ? "此分店不可创建优惠券" : "创建优惠券"}
        </Button>
      </BottomBar>
    </View>
  );
};

export default Coupon;
