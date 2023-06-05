import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { eventCenterOff, eventCenterOn } from "@/utils/library";
import { settingApi } from "@/api/co_admin";
import ScrollView from "@/components/scroll-view";
import store from "@/store";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Empty from "@/components/empty";
import Skeleton from "@/components/skeleton";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const Staff: FC = () => {

  const { store_id } = store.getState().storeInfo;
  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    getStateffPage(page, true);
    eventCenterOn("staffEdit", () => {
      getStateffPage(page, true);
    });
    return () => {
      eventCenterOff("staffEdit");
    };
  }, []);

  // 获取退货地址库数据
  const getStateffPage = (page, loading = false) => {
    if (loading){
      setErr(false);
      setStaffList([]);
      setLoading(true);
    }
    settingApi.staff.page({ page: page, page_size: pageSize, store_id: store_id,  order_key: "-created_at" }).then(res => {
      if (!!res && res.code === 0) {
        if (res.data.list && res.data.list.length > 0) {
          setTotal(res.data.total || 0);
          setStaffList(list => {
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
      setPulling(false);
      setRefreshing(false);
    });
  };

  const onScrollToLower = () => {
    if (isPage) {
      setPage(val => {
        let page = parseInt(val) + 1;
        getStateffPage(page);
        return page;
      });
    }
  };

  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getStateffPage(1, true);
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
                    card
                    image
                    imageShape="round"
                    imageSize={40}
                    title
                    row={1}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {staffList.length > 0 ? (
              <React.Fragment>
                {staffList.map((item, index) => {
                  return (
                    <View className="card" key={`staff-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={index !== 0}
                        size="large"
                        iconStyle={{ marginRight: addUnit(8) }}
                        icon={
                          <Image
                            style={{ width: addUnit(36), height: addUnit(36), opacity: 0.7 }}
                            src={require("@/assets/avatar.png")}
                            mode="aspectFill"
                          />
                        }
                        title={
                          <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ color: "#333", fontSize: addUnit(16) }}>{item.name}</Text>
                            <Text style={{ color: "#666", fontSize: addUnit(14) }}> - {item.phone}</Text>
                          </View>
                        }
                        label={
                          !!item.store_group && !!item.store_group[0]?.group && item.store_group[0]?.group.length > 0 ? (
                            <View style={{ display: "flex", flexDirection: "row" }}>
                              {item.store_group[0]?.group.map((role, idx) => {
                                return (
                                  <React.Fragment key={`role-${index}-${idx}`}>
                                    {idx !== 0 && <Text style={{ color: "#999", fontSize: addUnit(12) }}>、</Text>}
                                    <Text style={{ color: "#666", fontSize: addUnit(12) }}>{role.name}</Text>
                                  </React.Fragment>
                                );
                              })}
                            </View>
                          ) : undefined
                        }
                        extraStyle={{ alignSelf: "flex-start" }}
                        extra={item.state === 2 && <Tag type="info" size="small" plain={false}>邀请中</Tag>}
                        onClick={() => {
                          Taro.navigateTo({ url: `/pages/store/staff/edit/index?id=${item.id}` });
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关员工" image="user" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/store/staff/edit/index" });
          }}
        >
          添加员工
        </Button>
      </BottomBar>
    </View>
  );
};

export default Staff;
