import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { eventCenterOn, eventCenterOff, navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import { applyApi, settingApi } from "@/api/co_admin";
import { getMainStore } from "@/utils/app";
import { secToDate } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Tabs from "@/components/tabs";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Discount: FC = () => {

  const mainStore = getMainStore();// 店铺类型
  const [storeConfig, setStoreConfig] = useState({
    custom: "1",
    approval: "2"
  });
  const getStoreConfig = () => {
    setLoading(true);
    settingApi.config.info({ alias: ["storeConfig"] })
      .then(res => {
        if (res?.code === 0 && res?.data && res?.data["storeConfig"]) {
          const _storeConfig = res?.data["storeConfig"];
          setStoreConfig({
            custom: _storeConfig?.custom_activity || "1",
            approval: _storeConfig?.activity_approval || "2"
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const tabs = [
    { label: "进行中", value: 5 },
    { label: "未开始", value: 3 },
    { label: "已就绪", value: 4 },
    { label: "已结束", value: 6 },
    { label: "已驳回", value: 2 },
    { label: "已禁用", value: 7 }
  ];
  if (mainStore === 1) tabs.unshift({ label: "待审批", value: 1 });
  const [tabsActive, setTabsActive] = useState(5);
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
  const [applyID, setApplyID] = useState(undefined);

  const getList = (page, state, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    // console.log(applyID,"applyID");
    pluginApi.page({
      page: page,
      page_size: pageSize,
      plugin_id: 165,
      plugin_label: "page",
      apply_id: applyID,
      state: state
    }).then(res => {
      // console.log(res,"res");
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
  const getApplyInfo = () => {
    if (!applyID) {
      setLoading(true);
      applyApi.info({ label: "discount" }).then(res => {
        // console.log(res,"res");
        if (!!res && res.code === 0) {
          setApplyID(res?.data?.id);
        } else {
          setErr(true);
        }
      }).catch(() => {
        setErr(true);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    if (!!applyID) {
      getList(page, 5, true);
    }
  }, [applyID]);

  useEffect(() => {
    getApplyInfo();
    if (mainStore > 2) getStoreConfig();
    eventCenterOn("discountEdit", () => {
      setTabsActive(5);
      getList(page, 5, true);
    });
    return () => {
      eventCenterOff("discountEdit");
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
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      getList(1, tabsActive, true);
    }, 500);
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Tabs active={tabsActive} options={tabs} onChange={handelTabs} bgColor="#fff" border="top-bottom" />
      <ScrollView
        err={err}
        errText="没有相关应用权限"
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
                          url: "/pages/shop/discount/edit/index",
                          method: "navigateTo",
                          params: {
                            id: item.id,
                            approval: storeConfig.approval,
                            apply_id: applyID
                          }
                        });
                      }}
                    >
                      <Cell
                        border={false}
                        align="start"
                        title={item.name}
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                      />
                      <Cell
                        title={`活动时间：${secToDate(item.start_time, "{y}.{M}.{d} {h}:{m}:{s}")} - ${secToDate(item.end_time, "{y}.{M}.{d} {h}:{m}:{s}")}`}
                        textStyle={{ fontSize: addUnit(12), color: "#999" }}
                        style={{ paddingTop: addUnit(4), paddingBottom: addUnit(4) }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关限时折扣活动" image="coupon" />
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
            navigateTo({ url: "/pages/shop/discount/edit/index", method: "navigateTo", params: { approval: storeConfig.approval } });
          }}
        >
          {mainStore > 2 && storeConfig.custom === "2" ? "此分店不可创建限时折扣活动" : "创建限时折扣活动"}
        </Button>
      </BottomBar>
    </View>
  );
};

export default Discount;
