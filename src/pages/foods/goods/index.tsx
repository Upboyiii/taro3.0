import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { pluginApi } from "@/api/base";
import { base } from "@/api/config";
import { eventCenterOn, navigateTo } from "@/utils/library";
import ScrollView from "@/components/scroll-view";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import Empty from "@/components/empty";
import "./index.scss";

const FoodsGoods: FC = () => {

  const [pageList, setPageList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getList();
    eventCenterOn("foodsGoods", () => {
      getList();
    });
  }, []);

  const getList = () => {
    setErr(false);
    setLoading(true);
    pluginApi.page({
      apply_id: 19848070,
      plugin_id: 312,
      plugin_label: "getShop"
    }).then(res => {
      if (!!res && res.code === 0) {
        if (res?.data && res?.data.length > 0) {
          let list = res?.data || [];
          setPageList(list);
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
            {Array(5)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    align="start"
                    card
                    image
                    imageSize={48}
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
                {pageList.map((item, index) => {
                  return (
                    <View className="card" key={`goods-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={index !== 0}
                        align="start"
                        iconSize={48}
                        icon={base.file_host + "/" + item.cover}
                        title={item.name}
                        labelStyle={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center"
                        }}
                        label={
                          <React.Fragment>
                            <Text style={{ color: "#ff2340", fontSize: addUnit(15) }}>
                              ¥{(item.price / 100).toFixed(2)}
                            </Text>
                            <Text style={{ color: "#666", fontSize: addUnit(12) }}>
                              /{item.unit}
                            </Text>
                            {item.is_nums ? (
                              <Text style={{ color: "#666", fontSize: addUnit(12) }}>·按人数计算</Text>
                            ) : null}
                            {item.is_must ? (
                              <Text style={{ color: "#ff2340", fontSize: addUnit(12) }}>·必选</Text>
                            ) : null}
                          </React.Fragment>
                        }
                        extra={item.state === -1 && <Tag type="warning" plain={false}>禁用</Tag>}
                        onClick={() => {
                          navigateTo({ url: "/pages/foods/goods/edit/index", method: "navigateTo", params: { form: item } });
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关商品" image="goods" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/foods/goods/edit/index" });
          }}
        >
          添加附加商品
        </Button>
      </BottomBar>
    </View>
  );
};

export default FoodsGoods;
