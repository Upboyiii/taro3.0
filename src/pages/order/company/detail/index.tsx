import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { orderApi } from "@/api/co_admin";
import { formatPrice, secToDate } from "@/utils/common";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { config, findLabel } from "@/pages/order/utils/config";
import Steps from "@/components/steps";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const OrderDetail: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});

  const getDetail = (id) => {
    setLoading(true);
    orderApi.coOrderQuery.info({ id: id })
      .then(async(res) => {
        console.log(res.data,"res.data");
        if (res.code === 0 && res.data) {
          let _detail = JSON.parse(JSON.stringify(res.data || {}));

          // 获取退款明细
          if (_detail?.refund_id && _detail?.refund_id > 0) {
            await orderApi.saleOrder.refund({ order_id: _detail.id, order_type: 2 }).then(res => {
              if (res.code === 0 && res.data.list.length > 0) {
                _detail.refundList = res.data.list;
              }
            });
          }
          // 获取区县
          if (_detail?.order_data) {
            let key = Object.keys(_detail?.order_data).length > 0 ? Object.keys(_detail?.order_data)[0] : false;
            if (key) {
              _detail.dataKey = key;
              let order_shop = _detail?.order_data[key];
              if (_detail?.state_ats && _detail?.state_ats.length > 0) {
                let state_ats = _detail?.state_ats;
                if (order_shop.length > 0) {
                  order_shop.forEach((item, index) => {
                    return Object.assign(item, state_ats[index]);
                  });
                } else {
                  order_shop = [Object.assign(order_shop, state_ats[state_ats.length - 1])];
                }
              }
              _detail.order_shop = order_shop;
            }
          }

          setDetail(_detail);
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
    if(_id){
      getDetail(parseInt(_id));
    }else{
      setErr(true);
    }
  },[]);

  const getShopName = (id) => {
    if (parseInt(id) > 0 && parseInt(id) !== 1 && detail?.order_shop?.list && detail?.order_shop?.list.length > 0) {
      let item = JSON.parse(JSON.stringify(detail?.order_shop?.list)).find(item => {
        return item.id === parseInt(id);
      });
      return item.name;
    }
    return "";
  };

  const operate = (type, title) => {
    Taro.showModal({
      title: "提示",
      content: `确定要${title}此订单吗？`,
      cancelText: "我再想想",
      confirmText: `确定${title}`,
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          orderApi.coOrderQuery
            .operate({ order_id: detail.id, type: type })
            .then(() => {
              eventCenterTrigger("companyOrder");
              navigateTo({ method:"navigateBack" });
            });
        }
      }
    });
  };

  // @ts-ignore
  const goPay = () => {
    console.log("支付");
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!loading ? (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {detail.state_ats && detail.state_ats.length > 0 ? (
                  <Steps active={detail.state_ats.length - (detail.state_ats.length < 3 ? 0 : 1)} style={{ paddingBottom: 0 }}>
                    {detail.state_ats.length < 3 ? (
                      <Steps.item
                        title="提交订单"
                        time={secToDate(detail.created_at, "{y}-{M}-{d} {h}:{m}")}
                      />
                    ) : null}
                    {detail.state_ats.map((item, index)=>{
                      return (
                        <Steps.item
                          key={`step-${index}`}
                          title={findLabel(item.state, config.companyOrder.stateList)}
                          time={secToDate(item.at, "{y}-{M}-{d} {h}:{m}")}
                        />
                      );
                    })}
                  </Steps>
                ) : null}
                <View className="card" style={{ marginTop: addUnit(12) }}>
                  <Cell
                    border={false}
                    title="订单总金额"
                    content={`¥${formatPrice((detail?.pay_amount || 0) + (detail?.discount || 0))}`}
                  />
                  <Cell
                    style={{ paddingTop: 0, paddingBottom: 0 }}
                    border={false}
                    title="优惠金额"
                    content={`¥${formatPrice(detail?.discount || 0)}`}
                  />
                  <Cell
                    border={false}
                    title="应付金额"
                    contentStyle={{ fontWeight: "bold", color: "#ff2340" }}
                    content={`¥${formatPrice(detail?.pay_amount || 0)}`}
                  />
                  {!!detail.paid_amount ? (
                    <Cell
                      style={{ paddingTop: 0 }}
                      border={false}
                      title="已付金额"
                      contentStyle={{ fontWeight: "bold", color: "#00c35c" }}
                      content={`¥${formatPrice(detail?.paid_amount || 0)}`}
                    />
                  ) : null}
                  {!!detail.refund_fee ? (
                    <Cell
                      style={{ paddingTop: 0 }}
                      border={false}
                      title="退款金额"
                      contentStyle={{ color: "#ff7e00" }}
                      content={`¥${formatPrice(detail?.refund_fee || 0)}`}
                    />
                  ) : null}
                </View>
                <View className="card">
                  <Cell
                    border={false}
                    title="订单编号"
                    content={detail.id}
                  />
                  {detail?.params && detail?.params?.flow_id ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title="点餐流水号"
                      content={detail?.params?.flow_id}
                    />
                  ) : null}
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="平台来源"
                    content={findLabel(detail.platform, config.platformList)}
                  />
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="订单类型"
                    content={findLabel(detail.type, config.companyOrder.typeList)}
                  />
                  {detail.dataKey && detail.dataKey === "tp" && !!detail.order_shop.name ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title="模板名称"
                      content={detail.order_shop.name}
                    />
                  ) : null}
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="下单时间"
                    content={secToDate(detail.created_at)}
                  />
                  {detail.updated_at ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title="最后处理时间"
                      content={secToDate(detail.updated_at)}
                    />
                  ) : null}
                </View>
                {detail?.paid_infos && detail?.paid_infos.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">支付信息</View>
                    {detail?.paid_infos.map((item, index)=>{
                      return (
                        <View className="card" key={`paid-${index}`}>
                          <Cell
                            border={false}
                            title="流水号"
                            content={item.flow_id}
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="支付方式"
                            content={findLabel(item.pay_channel, config.payList)}
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="支付金额"
                            content={`¥${formatPrice(item.pay_amount || 0)}`}
                          />
                          {!!item.refund_fee ? (
                            <Cell
                              border={false}
                              style={{ paddingTop: 0 }}
                              title="退款金额"
                              content={`¥${formatPrice(item.refund_fee || 0)}`}
                            />
                          ) : null}
                          <Cell
                            size="small"
                            textStyle={{ color: "#999" }}
                            title={secToDate(item.at)}
                            content={
                              item.state ? (
                                <Tag
                                  plain={false}
                                  type={item.state === 1 ? "success" : "warning"}
                                >
                                  {item.state === 1 ? "支付完成" : item.state === 2 ? "全部退款" : item.state === 3 ? "部分退款" : null}
                                </Tag>
                              ) : null
                            }
                          />
                          {!!item.msg ? (
                            <Cell
                              size="small"
                              contentStyle={{ color: "#ff2340" }}
                              content={item.msg}
                            />
                          ) : null}
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : null}
                {detail?.refund_id && detail?.refundList && detail?.refundList.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">退款信息</View>
                    {detail?.refundList.map((item, index)=>{
                      return (
                        <View className="card" key={`refund-${index}`}>
                          <Cell
                            border={false}
                            title="售后编号"
                            content={item.after_id}
                            arrow
                            onClick={()=>{
                              navigateTo({ method:"navigateTo", url: "/pages/order/aftersale/detail/index?id=" + item.after_id + "&order_id=" + detail.id });
                            }}
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="售后状态"
                            content={
                              !!findLabel(item.state, config.orderRefundList) ? (
                                <Tag type={item.state === 1 ? "info" : item.state === 2 ? "default" : "warning"}>
                                  {findLabel(item.state, config.orderRefundList)}
                                </Tag>
                              ) : null
                            }
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="申请金额"
                            content={`¥${formatPrice(item.amount_fee || 0)}`}
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="退款金额"
                            contentStyle={{ fontSize: addUnit(16), color: "#ff2340",fontWeight: "bold" }}
                            content={`¥${formatPrice(item.refund_fee || 0)}`}
                          />
                          {item.refund_list && item.refund_list.length > 0 ? (
                            <React.Fragment>
                              {item.refund_list.map((refund, idx)=>{
                                return (
                                  <View
                                    key={`refund-${index}-${idx}`}
                                    style={{
                                      backgroundColor: "#f7f8f8",
                                      borderRadius: addUnit(6),
                                      overflow: "hidden",
                                      marginLeft: addUnit(14),
                                      marginRight: addUnit(14),
                                      marginBottom: addUnit(14)
                                    }}
                                  >
                                    <Cell
                                      border={false}
                                      size="small"
                                      title="退款流水号"
                                      content={refund.refund_flow_id}
                                    />
                                    <Cell
                                      border={false}
                                      style={{ paddingTop: 0 }}
                                      size="small"
                                      title="支付流水号"
                                      content={refund.flow_id}
                                    />
                                    <Cell
                                      border={false}
                                      style={{ paddingTop: 0 }}
                                      size="small"
                                      title="退款金额"
                                      contentStyle={{ fontSize: addUnit(14), fontWeight: "bold" }}
                                      content={`¥${formatPrice(refund.refund_fee)}`}
                                    />
                                    <Cell
                                      border={false}
                                      style={{ paddingTop: 0 }}
                                      size="small"
                                      title="入账账户"
                                      content={refund.msg}
                                    />
                                    {refund.ids && refund.ids.length > 0 ? (
                                      <Cell
                                        border={false}
                                        style={{ paddingTop: 0 }}
                                        size="small"
                                        title="商品"
                                        contentStyle={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          justifyContent: "flex-end"
                                        }}
                                        content={
                                          refund.ids.map(id=>{
                                            return (
                                              <View style={{ fontSize: addUnit(28), color:"#333" }} key={`good-${index}-${id}`}>
                                                {`${getShopName(id)}；`}
                                              </View>
                                            );
                                          })
                                        }
                                      />
                                    ) : null}
                                  </View>
                                );
                              })}
                            </React.Fragment>
                          ) : null}
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : null}
                {detail?.order_shop && detail?.order_shop.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">商品信息</View>
                    {detail?.order_shop.map(goods=>{
                      return (
                        <View className="card" key={`good-${goods.id}`}>
                          <Cell
                            border={false}
                            title={goods.name}
                            label={goods.sku_name}
                            extraStyle={{ alignSelf: "flex-start" }}
                            extra={
                              <Tag
                                plain={false}
                                size="small"
                                type={
                                  goods.state === 1 ? "primary" :
                                    goods.state === 3 || goods.state === 4 || goods.state === 23 ? "success" :
                                      goods.state === 6 ? "warning" :
                                        goods.state === 7 || goods.state === 10 || goods.state === 20 ? "info" : "default"
                                }
                              >
                                {findLabel(goods.state, config.companyOrder.stateList)}
                              </Tag>
                            }
                          />
                          <Cell
                            contentStyle={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}
                          >
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999" }}>金额(元)</View>
                              <View style={{ fontSize: addUnit(16), color: "#333", fontWeight: "bold", marginTop: addUnit(2) }}>
                                {formatPrice(goods.amount || 0)}
                              </View>
                            </View>
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "center" }}>优惠(元)</View>
                              <View style={{ fontSize: addUnit(16), color: "#333", textAlign: "center", fontWeight: "bold", marginTop: addUnit(2) }}>
                                {formatPrice((goods?.amount || 0) - (goods?.pay_amount || 0))}
                              </View>
                            </View>
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>实付(元)</View>
                              <View style={{ fontSize: addUnit(16), color: "#333", textAlign: "right", fontWeight: "bold", marginTop: addUnit(2) }}>
                                {formatPrice(goods.pay_amount || 0)}
                              </View>
                            </View>
                          </Cell>
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment></React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        {detail.state === 2 ? (
          <Button
            type="default"
            hairline
            style={{ width: "70%" }}
            onClick={()=>{
              operate(2, "删除");
            }}
          >
            删除订单
          </Button>
        ) : detail.state === 1 ? (
          <React.Fragment>
            <Button
              type="default"
              plain
              // style={{ marginRight: addUnit(12) }}
              style={{ width: "70%" }}
              onClick={()=>{
                operate(1, "取消");
              }}
            >
              取消订单
            </Button>
            {/* <Button*/}
            {/*  type="primary"*/}
            {/*  style={{ width: "70%" }}*/}
            {/*  onClick={goPay}*/}
            {/* >*/}
            {/*  立即支付*/}
            {/* </Button>*/}
          </React.Fragment>
        ) : null}
      </BottomBar>
    </View>
  );
};

export default OrderDetail;
