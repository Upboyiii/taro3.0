import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Navbar from "@/components/navbar";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Tabs from "@/components/tabs";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const FoodsTable: FC = () => {

  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableGroupID, setTableGroupID] = useState(0);
  const [tableGroup, setTableGroup] = useState<any[]>([]);

  const getList = (page, refresh = false) => {
    if (refresh) {
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
      setIsPage(true);
    }
    pluginApi.page({
      page: page,
      page_size: pageSize,
      plugin_id: 312,
      plugin_label: "getDesk",
      apply_id: 19848070,
      tags_id: tableGroupID
    }).then(res => {
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
  const getTabledGroup = (refresh = false) => {
    if (tableGroup.length === 0 || refresh) {
      setTableGroup([]);
      setLoading(true);
      pluginApi.plugin("GET", 312, "getTags", JSON.stringify({}), 19848070)
        .then(res => {
          if (!!res && res.code === 0) {
            const _list = (res?.data || []).filter(item => item.desk_nums);
            const _all = { name: "全部", id: 0 };
            setTableGroup([...[_all], ..._list]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    eventCenterOn("foodsTable", () => {
      getList(1, true);
    });
    return () => {
      eventCenterOff("foodsTable");
    };
  }, []);

  useEffect(() => {
    getList(1, true);
  }, [tableGroupID]);

  useEffect(() => {
    getTabledGroup(true);
  }, []);

  const findGroupName = (groupID) => {
    for (let i = 0; i < tableGroup.length; i++) {
      if (groupID === tableGroup[i].id) {
        return tableGroup[i].name;
      }
    }
    return null;
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
    setTimeout(() => {
      getList(1, true);
    }, 500);
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Navbar
        title="餐桌管理"
        border
        right={
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: 30,
              color: "#333"
            }}
          >
            分组管理
          </View>
        }
        onClickRight={() => {
          Taro.navigateTo({ url: "/pages/foods/group/index" });
        }}
      />
      {/*  Tabs问题,编译微信小程序样式无法滑动，全局Tab都有问题 */}
      {tableGroup.length > 0 ? (
        <Tabs
          active={tableGroupID}
          options={tableGroup}
          onChange={setTableGroupID}
          format={{ label: "name", value: "id" }}
          bgColor="#fff"
          border
          scroll
          space={12}
        />
        // <Dropdown border="top-bottom">
        //   <Dropdown.item
        //     title="全部分组"
        //     value={tableGroupID}
        //     options={tableGroup}
        //     format={{ label: "name", value: "id" }}
        //     columns={1}
        //     onChange={setTableGroupID}
        //   />
        // </Dropdown>
      ) : null}
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
                    align="start"
                    card
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[48, 12]}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {pageList.length > 0 ? (
                  <React.Fragment>
                    {pageList.map((item, index) => {
                      return (
                        <View className="card" key={`card-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                          <Cell
                            align={!!item.mark ? "start" : "center"}
                            border={index !== 0}
                            title={item.name}
                            textStyle={{ display: "flex", flexDirection: "row" }}
                            label={item.mark}
                            extraStyle={{ marginTop: addUnit(2), display: "flex", flexDirection: "row" }}
                            extra={
                              <React.Fragment>
                                {tableGroupID === 0 && !!item.tags_id && !!findGroupName(item.tags_id) ? <Tag plain={false}>{findGroupName(item.tags_id)}</Tag> : null}
                                {item.state === -1 ? <Tag plain={false} type="warning" style={{ marginLeft: addUnit(6) }}>禁用</Tag> : item.state === 2 ? <Tag style={{ marginLeft: addUnit(6) }} plain={false} type="info">占用</Tag> : null}
                              </React.Fragment>
                            }
                            onClick={() => {
                              navigateTo({ url: "/pages/foods/table/edit/index", method: "navigateTo", params: { id: item.id, form: item } });
                            }}
                          />
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无相关餐桌" image="table" />
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
            Taro.navigateTo({ url: "/pages/foods/table/edit/index" });
          }}
        >
          添加餐桌
        </Button>
      </BottomBar>
    </View>
  );
};

export default FoodsTable;
