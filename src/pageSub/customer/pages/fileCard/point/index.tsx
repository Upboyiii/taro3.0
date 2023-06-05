import React, { FC, useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { secToDate } from "@/utils/common";
import { pluginApi } from "@/api/base";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Tabs from "@/components/tabs";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Divider from "@/components/divider";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Point: FC = () => {

  const tabs = [
    { label: "积分规则", value: 1 },
    { label: "通用规则", value: 2 }
  ];
  const [tabsActive, setTabsActive] = useState(1);
  const handelTabs = (val) => {
    setTabsActive(val);
    if (val === 1) {
      getRuleList(1, true);
    } else {
      getPointsSet();
    }
  };

  const pageSize = 10;
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);

  const init = {
    name: "",
    deduct: {
      deduct_amount_limit: -1,
      min_order_amount: -1
    },
    expire_detail: {
      expire_type: 1,
      time_day: null,
      time_time_period: ""
    },
    general_ratio: 100,
    limit_per_day: -1,
    protected_time: -1,
    sign_in: {
      sign_use: -1,
      sign_cycle: [{ day: 1, points: 1 }]
    }
  };
  const [points, setPoints] = useState<any>(init);
  const getPointsSet = () => {
    setErr(false);
    setLoading(true);
    setErr(false);
    pluginApi.plugin("GET", 262, "setInfo", "{}").then(res => {
      if (!!res && res.code === 0) {
        const data = Object.assign({}, init, res.data);
        setPoints(data);
      }
    }).catch(() => {
      setErr(true);
    }).finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  };

  const getRuleList = (page, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    pluginApi.page({
      page: page,
      page_size: pageSize,
      plugin_id: 262,
      plugin_label: "rulePage"
    }).then(res => {
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

  useEffect(() => {
    getRuleList(1, true);
    eventCenterOn("pointEdit", (res) => {
      const msg = res[0];
      setTabsActive(msg.type);
      if (msg.type === 1) {
        getRuleList(1, true);
      } else if (msg.type === 2) {
        getPointsSet();
      }
    });
    return () => {
      eventCenterOff("pointEdit");
    };
  }, []);

  const onScrollToLower = () => {
    if (isPage && tabsActive === 1) {
      setPulling(true);
      setPage(val => {
        let _page = parseInt(val) + 1;
        getRuleList(_page);
        return _page;
      });
    }
  };

  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      if (tabsActive === 1) {
        getRuleList(1, true);
      } else if (tabsActive === 2) {
        getPointsSet();
      }
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
            {tabsActive === 1 ? (
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
                        actionSize={[32, 12]}
                      />
                    );
                  })}
              </React.Fragment>
            ) : (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                {Array(7)
                  .fill("")
                  .map((_, i) => {
                    return (
                      <Skeleton
                        key={i}
                        border={i !== 0}
                        contentDirection="row"
                        rowsAlign="between"
                        rowsDirection="row"
                        row={2}
                        rowWidth={[60, 60]}
                        rowHeight={14}
                      />
                    );
                  })}
              </View>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {tabsActive === 1 ? (
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
                                navigateTo({ url: "/pages/customer/point/rule/index", method: "navigateTo", params: { form: item } });
                              }}
                            >
                              <Cell
                                border={false}
                                align="start"
                                title={
                                  item.rule_type === 1 ? "关注我的微信" :
                                    item.rule_type === 2 ? `每成功交易${item.points_limit}笔` :
                                      item.rule_type === 3 ? `每购买金额${item.points_limit}元` : ""
                                }
                                label={`奖励${item?.points || 0}分`}
                                labelStyle={{ fontSize: addUnit(14), color: "#ff2340" }}
                                extra={item.send_message === 2 && <Tag plain={false}>通知</Tag>}
                              />
                            </View>
                          );
                        })}
                      </React.Fragment>
                    ) : (
                      <Empty desc="暂无相关积分规则" image="jifen" />
                    )}
                    {total > pageSize ? (
                      <React.Fragment>
                        {total > page * pageSize ? (
                          <Divider>{loading ? "加载中..." : "下拉加载更多..."}</Divider>
                        ) : (
                          <Divider>没有更多啦~</Divider>
                        )}
                      </React.Fragment>
                    ) : null}
                  </React.Fragment>
                ) : (
                  <View className="card" style={{ marginTop: addUnit(12) }}>
                    <Cell
                      border={false}
                      title="积分名称自定义"
                      textStyle={{ color: "#666" }}
                      content={points.name === "" ? "积分" : points.name}
                    />
                    <Cell
                      title="积分有效期"
                      textStyle={{ color: "#666" }}
                      content={
                        points.expire_detail?.expire_type === 3 ? `从获得开始至${secToDate(points.expire_detail.time_period, "{y}年{M}月{d}日")}` :
                          points.expire_detail?.expire_type === 2 ? `每笔积分有效期为${points.expire_detail.time_day % 365 === 0 ? `${points.expire_detail.time_day / 365}年` : points.expire_detail.time_day % 30 === 0
                              ? `${points.expire_detail.time_day / 30}个月`
                              : `${points.expire_detail.time_day}天`
                            }` : "永久有效"
                      }
                    />
                    <Cell
                      title="积分上限"
                      textStyle={{ color: "#666" }}
                      content={points.limit_per_day === -1 ? "不限制" : `每个客户每天最多获取${points.limit_per_day || 0}积分`}
                    />
                    <Cell
                      title="积分保护期"
                      textStyle={{ color: "#666" }}
                      content={points.protected_time === -1 ? "不启用" : `积分在发放后将进入${points.protected_time || 0}天保护期`}
                    />
                    <Cell
                      title="积分兑换比例"
                      textStyle={{ color: "#666" }}
                      content={!!points.general_ratio ? `${points.general_ratio || 0}积分=1元` : "-"}
                    />
                    <Cell
                      title="积分抵现"
                      align="start"
                      textStyle={{ color: "#666" }}
                      content={
                        <React.Fragment>
                          {points.deduct.deduct_amount_limit !== 0 ? (
                            <View style={{ lineHeight: addUnit(20) }}>
                              {points.deduct.deduct_amount_limit > 0 ? `订单最低为${points.deduct.deduct_amount_limit / 100}元可抵现` : points.deduct.deduct_amount_limit === -1 ? "订单金额不限制" : null}
                            </View>
                          ) : null}
                          {points.deduct.min_order_amount !== 0 ? (
                            <View style={{ lineHeight: addUnit(20) }}>
                              {points.deduct.min_order_amount > 0 ? `每笔订单最多抵扣${points.deduct.min_order_amount / 100}元可抵现` : points.deduct.min_order_amount === -1 ? "抵现金额不限制" : null}
                            </View>
                          ) : null}
                        </React.Fragment>
                      }
                    />
                    <Cell
                      title="连续签到送积分"
                      align="start"
                      textStyle={{ color: "#666" }}
                      content={points.sign_in.sign_use === -1 ? "不启用" : points.sign_in.sign_use === 1 && Array.isArray(points.sign_in.sign_cycle) && points.sign_in.sign_cycle.length > 0 ? (
                        <React.Fragment>
                          {points.sign_in.sign_cycle.map((item, idx) => {
                            return (
                              <View key={`sign_use-${idx}`} style={{ lineHeight: addUnit(20) }}>
                                {`签到${item.day}天奖励${item.points}积分`}
                              </View>
                            );
                          })}
                        </React.Fragment>
                      ) : "-"}
                    />
                  </View>
                )}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            if (tabsActive === 1) {
              Taro.navigateTo({ url: "/pages/customer/point/rule/index" });
            } else {
              Taro.navigateTo({ url: "/pages/customer/point/common/index" });
            }
          }}
        >
          {tabsActive === 1 ? "添加积分规则" : "编辑通用规则"}
        </Button>
      </BottomBar>
    </View>
  );
};

export default Point;

