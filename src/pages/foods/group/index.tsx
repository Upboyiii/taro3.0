import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { eventCenterOn, navigateTo } from "@/utils/library";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const TableGroup: FC = () => {

  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const getList = () => {
    setErr(false);
    setLoading(true);
    pluginApi.plugin("GET", 312, "getTags", JSON.stringify({}), 19848070)
      .then(res => {
        if (!!res && res.code === 0) {
          if (res.code === 0) {
            setPageList(res?.data || []);
          }
        } else {
          setErr(true);
        }
      }).catch(() => {
        setErr(true);
      }).finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    getList();
    eventCenterOn("deskGroup", () => {
      getList();
    });
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () =>{
    setRefreshing(true);
    setTimeout(()=>{
      getList();
    },500);
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {loading ? (
          <React.Fragment>
            {Array(7)
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
            {pageList.length > 0 ? (
              <React.Fragment>
                {pageList.map((item, index) => {
                  return (
                    <View className="card" key={`card-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={index !== 0}
                        align={!!item.mark ? "start" : "center"}
                        title={item.name}
                        textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                        label={item.mark}
                        extraStyle={{ marginTop: addUnit(2) }}
                        extra={item.state === -1 ? <Tag plain={false} type="warning">禁用</Tag> : null}
                        onClick={() => {
                          navigateTo({ url: "/pages/foods/group/edit/index", method: "navigateTo", params: { id: item.id, form: item } });
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关餐桌分组" image="table" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/foods/group/edit/index" });
          }}
        >
          添加餐桌分组
        </Button>
      </BottomBar>
    </View>
  );
};

export default TableGroup;
