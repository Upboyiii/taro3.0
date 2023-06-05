import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { ScrollView, View } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { shopApi , orderApi } from "@/api/co_admin";
import { secToDate } from "@/utils/common";
import Cell from "@/components/cell";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import classnames from "classnames";
import "./index.scss";

const OrderExpress: FC = () => {
  const [bem] = createNamespace("delivery","express");

  const _id = getCurrentInstance().router?.params?.id;
  const _row:any = getCurrentInstance().router?.params?.row;

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [express, setExpress] = useState<any>({});
  const [cardList, setCardList] = useState<any[]>([]);
  const cardStates =  {
    1: "正常",
    2: "待核销",
    3: "已核销",
    4: "已作废",
    5: "已过期"
  };

  const getPwdInfo = (row) => {
    setLoading(true);
    shopApi.card
      .pwdInfo({ id: row.exp_nu })
      .then(res => {
        if (res.code === 0) {
          setCardList(res?.data || []);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getExpress = (id, row) => {
    setLoading(true);
    let obj:any = {
      id: id,
      express_nu: row.exp_nu,
      type: row.exp_genre === 2 ? 2 : 1
    };
    orderApi.userOrder.express(obj)
      .then(res => {
        if (res.code === 0) {
          let data = res?.data?.list || {};
          let step_list = data?.data || [];
          let current = "";
          step_list.forEach(item => {
            if (getExpressProcess(item.context, ["揽收", "揽件", "已收寄", "已交付"])) {
              if (current === "takeway") {
                item.status = "dot";
              } else {
                item.status = "takeway";
                current = "takeway";
              }
            } else if (getExpressProcess(item.context, ["派送", "派件", "安排投递"])) {
              if (current === "pai") {
                item.status = "dot";
              } else {
                item.status = "pai";
                current = "pai";
              }
            } else if (getExpressProcess(item.context, ["代收", "暂存"])) {
              if (current === "taking") {
                item.status = "dot";
              } else {
                item.status = "taking";
                current = "taking";
              }
            } else if (getExpressProcess(item.context, ["签收", "已取走"])) {
              if (current === "check") {
                item.status = "dot";
              } else {
                item.status = "check";
                current = "check";
              }
            } else if (
              getExpressProcess(item.context, ["到达", "离开", "已到达", "已经到达", "已发往", "准备送往", "分拣完成"])
            ) {
              if (current === "transiting") {
                item.status = "dot";
              } else {
                item.status = "transiting";
                current = "transiting";
              }
            } else {
              item.status = "dot";
            }
          });
          setExpress(data);
        }else{
          setErr(true);
        }
      }).catch(()=>{
      setErr(true);
    }).finally(()=>{
      setLoading(false);
    });
  };

  useEffect(()=>{
    if(_id && _row){
      const row = JSON.parse(_row);
      Taro.setNavigationBarTitle({ title: row.type === 2 ? "物流信息" : "发货信息" });
      if(row.type === 2){
        getExpress(parseInt(_id), row);
      }else{
        if (row.exp_type === "card") {
          getPwdInfo(row);
        }
      }
    }else{
      setErr(true);
    }
  },[]);

  const getExpressProcess = (str: string, keys: string[]) => {
    return keys.some(key => {
      if (!key) {
        return false;
      }
      return (str ?? "").includes(key);
    });
  };
  const expressStatusTitle = (status, index) => {
    let title = "";
    if (status === "check") {
      title = "已签收";
    } else if (status === "pai") {
      title = "派送中";
    } else if (status === "takeway") {
      title = "已揽件";
    } else if (status === "taking") {
      title = "待取件";
    } else if (status === "transiting") {
      title = "运输中";
    } else {
      title = "";
    }
    return title !== "" && <View className={classnames(bem("title", { current: index === 0 }))}>{title}</View>;
  };
  const expressStatus = (status, index) => {
    return (
      <View className={classnames(bem("status",{ dot: status === "dot" || status === "takeway", current: index === 0 }))}>
        {status === "check" ? (
          <View className={classnames(bem("check"))} />
        ) : status === "pai" ? (
          "派"
        ) : status === "taking" ? (
          "待"
        ) : status === "transiting" ? (
          "运"
        ) : null}
      </View>
    );
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!loading ? (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {JSON.parse(_row).type === 1 ? (
                  <React.Fragment>
                    {cardList.map((item, index)=>{
                      return (
                        <View
                          key={`card-${index}`}
                          className="card"
                          style={index === 0 ? { marginTop: addUnit(12) } : {}}
                        >
                          <Cell
                            border={false}
                            title="卡号"
                            content={item.card_num}
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="卡密"
                            content={item.card_pwd}
                          />
                          <Cell
                            size="small"
                            textStyle={{ color: "#999" }}
                            title={item.type === 1 ? "卡券库" : item.type === 2 ? "自定义卡券" : ""}
                            content={
                              item.type === 2 ? (
                                <Tag
                                  plain={false}
                                  type={
                                    item.state === 1 ? "success" :
                                      item.state === 2 ? "info" :
                                        item.state === 3 ? "success" :
                                          item.state === 3 ? "warning" : "default"
                                  }
                                >
                                  {cardStates[item.state]}
                                </Tag>
                              ) : null
                            }
                          />
                        </View>
                      );
                    })}
                  </React.Fragment>
                  ) : (
                  <React.Fragment>
                    <View className="card" style={{ marginTop: addUnit(12) }}>
                      <View className="card-header card-header--border">
                        <View className="card-header__title">{express.expTextName}</View>
                        <View className="card-header__extra" style={{ fontSize: addUnit(15), color: "#333" }}>{express.mailNo}</View>
                      </View>
                      {!!express.upgrade_info ? (
                        <Cell
                          size="small"
                          border={false}
                          contentStyle={{ color: "#ff7e00" }}
                          contentAlign="left"
                          content={express.upgrade_info}
                        />
                      ) : null}
                      {express?.data && express?.data.length > 0 ? (
                        <View className={classnames(bem())}>
                          {JSON.parse(_row)?.mailing ? (
                            <View className={classnames(bem("item","current"))}>
                              <View
                                className="hairline hairline--left"
                                style={{
                                  borderColor: "#ff2340",
                                  top: addUnit(12),
                                  bottom: addUnit(-14),
                                  left: addUnit(12)
                                }}
                              />
                              <View className={classnames(bem("status","current"))}>收</View>
                              <View className={classnames(bem("info"))}>
                                <View className={classnames(bem("text","address"))}>
                                  {`收货地址：${JSON.parse(_row)?.mailing?.address || "-"}`}
                                </View>
                                <View className={classnames(bem("time"))}>
                                  {`${JSON.parse(_row)?.mailing?.name}（${JSON.parse(_row)?.mailing?.phone}）`}
                                </View>
                              </View>
                            </View>
                          ) : null}
                          {express?.data.map((item,index)=>{
                            return (
                              <View
                                key={item.time + "_" + index}
                                className={classnames(bem("item",{ current: index === 0 }))}
                              >
                                <View
                                  className="hairline hairline--left"
                                  style={{
                                    borderColor: index === 0 ? "#ff2340" : "#e5e5e5",
                                    top: addUnit(12),
                                    bottom: addUnit(-14),
                                    left: addUnit(12)
                                  }}
                                />
                                {expressStatus(item.status, index)}
                                <View className={classnames(bem("info"))}>
                                  {expressStatusTitle(item.status, index)}
                                  <View className={classnames(bem("text",{ current: index === 0 }))}>{item.context}</View>
                                  <View className={classnames(bem("time"))}>{item.time}</View>
                                </View>
                              </View>
                            );
                          })}
                          {JSON.parse(_row)?.created_at ? (
                            <View className={classnames(bem("item"))}>
                              <View className={classnames(bem("status","dot"))} />
                              <View className={classnames(bem("info"))}>
                                <View className={classnames(bem("title"))}>已下单</View>
                                <View className={classnames(bem("text"))}>用户提交了订单</View>
                                <View className={classnames(bem("time"))}>
                                  {secToDate(JSON.parse(_row)?.created_at)}
                                </View>
                              </View>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  </React.Fragment>
                )}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment></React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderExpress;
