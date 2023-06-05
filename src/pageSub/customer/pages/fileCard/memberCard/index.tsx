import React, { FC, useState, useEffect } from "react";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { customerApi, settingApi } from "@/api/co_admin";
import { eventCenterOn, navigateTo } from "@/utils/library";
import { formatLifeTime } from "./utils";
import { getMainStore } from "@/utils/app";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Tabs from "@/components/tabs";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const MemberCard: FC = () => {
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
            custom: _storeConfig?.custom_benefit || "1",
            approval: _storeConfig?.benefit_approval || "2"
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const tabs = [
    { label: "使用中", value: 1 },
    { label: "已禁用", value: 4 },
    { label: "已下架", value: 2 }
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

  useEffect(() => {
    getList(page, 1, true);
    if (mainStore > 2) {
      getStoreConfig();
    }
    eventCenterOn("memberCardEdit", () => {
      getList(page, 1, true);
    });
    eventCenterOn("memberCard", () => {
      getList(page, 1, true);
    });
  }, []);

  const getList = (page, state, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
      setIsPage(true);
    }
    customerApi.benefitCard.page({ page: page, page_size: pageSize, state: state }).then(res => {
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
    setTimeout(()=>{
      getList(page, tabsActive, true);
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
            {Array(6)
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
                    action
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
                        navigateTo({
                          url: "/pages/customer/memberCard/detail/index",
                          method: "navigateTo",
                          params: {
                            id: item.id,
                            approval: storeConfig.approval
                          }
                        });
                      }}
                    >
                      <Cell
                        border={false}
                        align="start"
                        title={item.name}
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        label={
                          item.claim_type === 1 ? "可直接领取" : item.claim_type === 2 ? "满足条件即可领取" : item.claim_type === 3 ? "需付费购买" : null
                        }
                        labelStyle={{ fontSize: addUnit(13), color: "#666" }}
                        extraStyle={{ marginTop: addUnit(2) }}
                        extra={
                          <Tag
                            plain={false}
                            type={item.state === 1 ? (item.claim_type === 1 ? "success" : item.claim_type === 2 ? "warning" : item.claim_type === 3 ? "primary" : "default") : "default"}
                          >
                            {item.claim_type === 1 ? "无门槛卡" : item.claim_type === 2 ? "规则卡" : item.claim_type === 3 ? "付费卡" : null}
                          </Tag>
                        }
                      />
                      <Cell
                        title={formatLifeTime(item.life_time, item.expire_at)}
                        textStyle={{ fontSize: addUnit(12), color: "#999" }}
                        style={{ paddingTop: addUnit(4), paddingBottom: addUnit(4) }}
                        content={item.state === 2 || item.state === 3 ? `此卡已${item.state === 2 ? "下架" : "禁用"}` : undefined}
                        contentStyle={{ fontSize: addUnit(12), color: "#999" }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关权益卡" image="memberCard" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        {!loading ? (
          <Button
            style={{ width: "70%" }}
            type="info"
            disabled={mainStore > 2 && storeConfig.custom === "2"}
            onClick={() => {
              navigateTo({ url: "/pages/customer/memberCard/edit/index", method: "navigateTo", params: { approval: storeConfig.approval } });
            }}
          >
            {mainStore > 2 && storeConfig.custom === "2" ? "此分店不可创建权益卡" : "新建权益卡"}
          </Button>
        ) : (
          <Skeleton compact title titleSize={["100%", 44]} round color="#fff" style={{ backgroundColor: "transparent" }} />
        )}
      </BottomBar>
    </View>
  );
};

export default MemberCard;

