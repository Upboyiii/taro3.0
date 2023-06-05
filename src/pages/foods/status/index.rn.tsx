import React, { FC, useEffect, useState } from "react";
import { Text, View } from "@tarojs/components";
import { ImageBackground, SafeAreaView } from "react-native";
import { addUnit, createNamespace } from "@/components/utils";
import { closeScene, connectScene } from "@/utils/socket";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import ScrollView from "@/components/scroll-view";
import Skeleton from "@/components/skeleton";
import Tag from "@/components/tag";
import Empty from "@/components/empty";
import classnames from "classnames";
import "./index.scss";

const TableStatus: FC = () => {

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [tableList, setTableList] = useState<any[]>([]);
  const states = {
    3: "已占桌",
    11: "来单啦",
    22: "待上菜",
    33: "用餐中",
    44: "已取消"
  };

  const getList = (refresh) => {
    if (pageList.length === 0 || refresh) {
      setErr(false);
      setLoading(true);
      return new Promise(resolve => {
        pluginApi.page({
          apply_id: 19848070,
          plugin_id: 312,
          plugin_label: "getStateList"
        }).then(res => {
          console.log(res,"res");
          if (!!res && res.code === 0) {
            if (res.data?.list && res.data?.list.length > 0) {
              let list = res.data.list ? res.data.list : [];
              setPageList(list);
              resolve(list);
            }
          } else {
            setErr(true);
          }
          resolve([]);
        }).catch(() => {
          setErr(true);
        }).finally(() => {
          setLoading(false);
        });
      });
    }
  };

  const getGroupList = (refresh)=> {
    if(groupList.length === 0 || refresh){
      setLoading(true);
      return new Promise(resolve => {
        pluginApi.plugin("GET", 312, "getTags", JSON.stringify({}),19848070)
          .then(res => {
            if (res.code === 0 && !!res?.data && res?.data.length > 0) {
              setGroupList(res?.data || []);
              resolve(res?.data || []);
            }
            resolve([]);
          })
          .finally(() => {
            setLoading(false);
          });
      });
    }
  };

  const getTableList = async () => {
    let pages:any = await getList(true);
    let tempGroup:any = await getGroupList(true);
    tempGroup.unshift({ name: "不分组", id: 0, mark: "餐桌少，不需要分组" });
    pages.forEach(table=>{
      const key = table.tags_id || 0;
      tempGroup.map(group=>{
        if (group.id === key) {
          if (!group.children) group.children = [];
          group.children.push(table);
        }
        return group;
      });
    });
    getState(tempGroup);
    setRefreshing(false);
  };

  useEffect(()  =>  {
    getTableList().then(()=>{});

    // 加入场景
    connectScene("coFood",{});

    eventCenterOn("coFood", (res) => {
      console.log(res,"res");
      const msg = res[0];
      if(msg){
        if (msg.err || !msg.desk_id) {
          return;
        }
        editList(msg);
      }
    });
    return () =>{
      eventCenterOff("coFood");
      closeScene("coFood");
    };
  }, []);

  const filterList = (list,value,label) => {
    for (let i = 0; i < list.length; i++) {
      let child = list[i].children;
      if(child && child.length > 0){
        for (let a = 0; a < child.length; a++) {
          if (value === child[a][label]) {
            return { obj: child[a], i: i, a: a };
          }
        }
      }
    }
  };
  const editList = (msg)=>{
    setTableList(val=>{
      let list = JSON.parse(JSON.stringify(val));
      let data = filterList(list,msg.desk_id,"desk_id");
      if(data){
        let { obj, i, a } = JSON.parse(JSON.stringify(data));
        switch (msg.type) {
          case 1: // 订单状态变更
            // 是否新桌
            if (!obj.flow_id) {
              // @ts-ignore
              obj.created_at = Date.parse(new Date()) / 1000;
              obj.flow_id = msg.flow_id;
              obj.is_new = 0;
              obj.state = 11;
              obj.person_nums = msg.person_nums;
            }
            // 来新订单
            if (msg.state === 1) {
              if (!obj.order || obj.order.length < 0) {
                obj.order = [];
              }
              obj.order.push({ order_id: msg.order_id, state: msg.state });
              obj.is_new = obj.is_new ? obj.is_new + 1 : 1; // 新订单数量
            }
            // 其他改变订单状态
            if (msg.state > 1) {
              if (obj.order && obj.order.length > 0) {
                let index = obj.order.findIndex(item => {
                  return item.order_id === msg.order_id;
                });
                if (index >= 0) {
                  obj.order[index].state = msg.state;
                }
              }
            }
            obj.total_amount = msg.total_amount;
            if (msg.pay_amount) {
              obj.pay_amount = msg.pay_amount;
            }
            console.log(obj,"obj");
            list[i].children[a] = obj;
            break;
          case 2: // 确认订单菜品 plan_state
          case 4: {
            // 上菜完成
            let index = obj.order.findIndex(item => item.order_id === msg.order_id);
            if (index >= 0) {
              obj.order[index].plan_state = msg.type == 2 ? 1 : 2;
              list[i].children[a] = obj;
            }
            break;
          }
          case 5: {
            // 清桌
            list[i].children[a] = { name: obj.name, desk_id: obj.desk_id };
            break;
          }
          case 6: // 取消菜品
            obj.total_amount = msg.total_amount;
            if (msg.pay_amount) {
              obj.pay_amount = msg.pay_amount;
            }
            obj.is_cancel = 1; // 有取消
            list[i].children[a] = obj;
            break;
          default:
            break;
        }
        list[i].children[a].state = getOrderState(list[i].children[a].order);
        eventCenterTrigger("foodsDesk",{ type:"order",data:list[i].children[a].order });
      }

      return list;
    });
  };

  const getOrderState = (order)=>{
    if (order && order.length > 0) {
      const list = order;
      let state = 33;
      for (let i = 0; i < list.length; i++) {
        if (list[i].state == 2) {
          if (i == list.length - 1) {
            state = 44;
          }
          continue;
        }
        if (!list[i].plan_state) {
          state = 11;
          break;
        }
        if (list[i].plan_state === 1) {
          state = 22;
          break;
        }
      }
      return state;
    }
    return 0;
  };

  // 获取桌号显示状态
  const getState = (tempGroup)=> {
    if (tempGroup && tempGroup.length > 0) {
      tempGroup.forEach(item => {
        item.children && item.children.forEach(ite => {
          if (ite.order && ite.order.length > 0) {
            ite.state = getOrderState(ite.order);
          }
        });
      });
      setTableList(tempGroup);
    }
  };

  const itemClick = (item,index:any = null,indx:any = null) =>{
    if (!!item.flow_id) {
      if(item.is_new && item.is_new > 0){
        setTableList(val=> {
          let list = JSON.parse(JSON.stringify(val));
          list[index].children[indx].is_new = 0;
          return list;
        });
      }
      navigateTo({ url: "/pages/foods/desk/index", method: "navigateTo", params: item });
    }else{
      // 在线点餐
      let form = { tableNumber: item.name, desk_id: item.desk_id };
      navigateTo({ url: "/pages/foods/order/index", method: "navigateTo", params: form });
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () =>{
    setRefreshing(true);
    setTimeout(()=>{
      getTableList().then(()=>{});
    },500);
  };

  const [bem] = createNamespace("status", "foods");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {loading ? (
          <View className={classnames(bem("list"))}>
            {Array(12)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    title
                    titleSize={[96, 24]}
                    row={2}
                    style={{ flex: 1, minWidth: "40%", marginLeft: addUnit(6), marginRight: addUnit(6), height: addUnit(100) }}
                  />
                );
              })}
          </View>
        ) : (
          <React.Fragment>
            {tableList.length > 0 ? (
              <View className={classnames(bem())}>
                {tableList.map((group, index) => {
                  if((!group.desk_nums && group.id !== 0) || !group.children) return null;
                  return (
                    <React.Fragment key={`group-${index}`}>
                      {tableList.length > 1 && group.id !== 0 ? (
                        <View className={classnames(bem("title"))}>
                          <Text className={classnames(bem("title-name"))}>{group.name}</Text>
                          <Tag
                            round
                            size="small"
                            style={{ fontWeight: "bold", marginLeft: addUnit(6), minWidth: addUnit(16) }}
                          >
                            {group.desk_nums || group.children.length}
                          </Tag>
                        </View>
                      ) : null}
                      <View className={classnames(bem("list"))}>
                        {group.children.map((item,idx)=>{
                          return (
                            <View
                              key={`item-${index}-${idx}`}
                              className={classnames(bem("item"))}
                              onClick={() => {itemClick(item,index,idx);}}
                            >
                              <ImageBackground
                                // @ts-ignore
                                className={classnames(bem("desk",{ [`${item.state}`]: !!item.state }))}
                                source={require("@/assets/others/linear-white.png")}
                              >
                                <Text className={classnames(bem("desk-name",{ [`${item.state}`]: !!item.state }))}>
                                  {item.name}
                                </Text>
                              </ImageBackground>
                              <View className={classnames(bem("info"))}>
                                {!!item.person_nums ? (
                                  <View className={classnames(bem("row", "people"))}>
                                    <Text className={classnames(bem("row-label"))}>人数：</Text>
                                    <Text className={classnames(bem("row-num"))}>{item.person_nums}</Text>
                                    <Text className={classnames(bem("row-unit"))}>人</Text>
                                  </View>
                                ) : null}
                                {!!item.total_amount ? (
                                  <View className={classnames(bem("row", "total"))}>
                                    <Text className={classnames(bem("row-label"))}>总额：</Text>
                                    <Text className={classnames(bem("row-num"))}>{item.total_amount / 100}</Text>
                                    <Text className={classnames(bem("row-unit"))}>元</Text>
                                  </View>
                                ) : null}
                                {item.total_amount && item.pay_amount !== item.total_amount ? (
                                  <View className={classnames(bem("row", "people"))}>
                                    <Text className={classnames(bem("row-label"))}>待付：</Text>
                                    <Text className={classnames(bem("row-num"))}
                                      style={{ color: "#ff2340" }}>{(item.total_amount - (item.pay_amount ? item.pay_amount : 0)) / 100}
                                    </Text>
                                    <Text className={classnames(bem("row-unit"))}
                                      style={{ color: "#ff2340" }}>元
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                              <View className={classnames(bem("footer"))}>
                                <View className={classnames(bem("state"))}>
                                  {!!item.order ? (
                                    <React.Fragment>
                                      <Tag
                                        size="small"
                                        plain={false}
                                        type={item.state === 11 ? "warning" : item.state === 22 ? "primary" : item.state === 22 ? "info" : "default"}
                                      >
                                        {states[item.state]}
                                      </Tag>
                                      {item.state === 11 && item.is_new > 0 ? (
                                        <Tag size="mini" dark round type="primary" style={{ marginLeft: addUnit(4), fontWeight: "bold" }}>
                                          {item.is_new}
                                        </Tag>
                                      ) : null}
                                    </React.Fragment>
                                  ) : (
                                    <Tag size="small" plain={false}>空桌</Tag>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
            ) : (
              <Empty desc="暂无相关餐桌" image="table" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TableStatus;
