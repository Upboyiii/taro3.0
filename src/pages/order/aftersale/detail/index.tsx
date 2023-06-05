import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { ScrollView, View, Text, Image } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { orderApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { formatPrice , secToDate } from "@/utils/common";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { config, findLabel } from "@/pages/order/utils/config";
import Steps from "@/components/steps";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const OrderServiceDetail: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _order_id = getCurrentInstance().router?.params?.order_id;

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});

  const getDetail = (id, order_id) => {
    setLoading(true);
    orderApi.saleOrder.info({ after_id: id, order_id: order_id })
      .then(res => {
        if (!!res && res.code === 0) {
          let _data = res?.data || {};
          _data.action = _data.state !== 9 && _data.state !== 8 && _data.state !== 2;
          setDetail(_data);
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
    if(!!_id && !!_order_id){
      getDetail(_id, parseInt(_order_id));
    }else{
      setErr(true);
    }
    eventCenterOn("operateAfterSale",() =>{
      if(!!_id && !!_order_id){
        getDetail(_id, parseInt(_order_id));
      }else{
        setErr(true);
      }
    });
    return ()=>{
      eventCenterOff("operateAfterSale");
    };
  },[]);

  const [bem] = createNamespace("sales","after");
  const handleImageClick = (pics, idx) => {
    const currentImg = base.file_host + "/" + pics[idx];
    Taro.previewImage({
      current: currentImg,
      urls: pics.map(pic => {
        return base.file_host + "/" + pic;
      })
    });
  };

  const operate = (type, title) => {
    let _form:any = {
      title: title,
      type: type,
      state: detail.state,
      id: detail.id
    };
    if((type === 3 && !(detail.type === 2 || detail.type === 3 || detail.type === 4)) || type === 4){
      Taro.showModal({
        title: "提示",
        content: `确定${title}？`,
        cancelText: "我再想想",
        confirmText: title,
        confirmColor: "#ff2340",
        success: function (res) {
          if (res.confirm) {
            orderApi.saleOrder
              .operate({ id: detail.id, type: type })
              .then(res => {
                if (!(!!res && res.code === 0)) {
                  Taro.showToast({ title: res?.message || "操作失败", icon: "error" });
                }
              })
              .catch(res => {
                Taro.showToast({ title: res?.message || "操作失败", icon: "error" });
              })
              .finally(()=>{
                setTimeout(()=>{
                  eventCenterTrigger("afterSale");
                  navigateTo({ method:"navigateBack" });
                },500);
              });
          }
        }
      });
    } else {
      navigateTo({ method:"navigateTo", url: "/pages/order/aftersale/operate/index", params: _form });
    }
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!loading ? (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                <Steps active={1} style={{ paddingBottom: 0 }}>
                  <Steps.item
                    title="申请售后"
                    time={secToDate(detail.created_at, "{y}-{M}-{d} {h}:{m}")}
                  />
                  <Steps.item
                    title={findLabel(detail.state, config.afterSale.stateList)}
                    time={secToDate(detail.updated_at, "{y}-{M}-{d} {h}:{m}")}
                  />
                </Steps>
                <View className="card" style={{ marginTop: addUnit(12) }}>
                  {!!detail?.order_refund ? (
                    <React.Fragment>
                      <Cell
                        border={false}
                        title="申请退款金额"
                        content={`¥${formatPrice(detail?.order_refund?.amount_fee || 0)}`}
                      />
                      <Cell
                        style={{ paddingTop: 0 }}
                        border={false}
                        title="已退款金额"
                        contentStyle={{ fontSize: addUnit(14), fontWeight: "bold", color: "#ff2340" }}
                        content={`¥${formatPrice(detail?.order_refund?.refund_fee || 0)}`}
                      />
                    </React.Fragment>
                  ) : (
                    <Cell
                      border={false}
                      title="退款金额"
                      contentStyle={{ fontSize: addUnit(14), fontWeight: "bold", color: "#ff2340" }}
                      content={`¥${formatPrice(detail?.refund_fee || 0)}`}
                    />
                  )}
                </View>
                <View className="card">
                  <Cell
                    border={false}
                    title="售后编号"
                    content={detail.id}
                  />
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="订单编号"
                    content={detail.order_id}
                    arrow
                    onClick={()=>{
                      navigateTo({ method:"navigateTo", url: "/pages/order/index/detail/index?id=" + detail.order_id });
                    }}
                  />
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="售后类型"
                    content={findLabel(detail.type, config.afterSale.typeList)}
                  />
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="申请时间"
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
                <View className="card-title">客户信息</View>
                <View className="card">
                  <Cell
                    border={false}
                    title="联系人"
                    content={detail?.contacts || "-"}
                  />
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="联系方式"
                    content={detail?.phone || "-"}
                  />
                </View>
                {detail?.list && detail?.list.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">订单信息</View>
                    {detail?.list.map(goods=>{
                      return (
                        <View className="card" key={`good-${goods.id}`}>
                          <Cell
                            border={false}
                            iconSize={40}
                            icon={base.file_host + "/" + goods.cover}
                            textStyle={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
                            title={goods.name}
                            label={goods.sku_name}
                            extraStyle={{ alignSelf: "flex-start", color: "#ff2340", fontSize: addUnit(14), paddingTop: addUnit(4) }}
                            extra={`¥${formatPrice(goods?.amount || 0)}`}
                          />
                          {findLabel(goods.state, config.afterSale.orderStateList) !== "-" ? (
                            <Cell
                              size="small"
                              title={findLabel(goods.type, config.goodsTypeList)}
                              content={
                                <Tag
                                  plain={false}
                                  type={
                                    goods.state === 1 || goods.state === 2 ? "info" :
                                      goods.state === 3 || goods.state === 4 ? "success" :
                                        goods.state === 5 ? "warning" :
                                          "default"
                                  }
                                >
                                  {findLabel(goods.state, config.afterSale.orderStateList)}
                                </Tag>
                              }
                            />
                          ) : null}
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : null}
                {!!detail?.order_refund && !!detail?.order_refund?.refund_list && detail?.order_refund?.refund_list.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">退款进度</View>
                    {detail?.order_refund?.refund_list.map(item=>{
                      return (
                        <View className="card" key={`order_refund-${item.flow_id}`}>
                          <Cell
                            border={false}
                            title="退款流水号"
                            content={item.refund_flow_id}
                          />
                          <Cell
                            border={false}
                            title="支付流水号"
                            style={{ paddingTop: 0 }}
                            content={item.flow_id}
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="退款金额"
                            contentStyle={{ color: "#ff2340", fontSize: addUnit(16) }}
                            content={`¥${formatPrice(item?.refund_fee || 0)}`}
                          />
                          <Cell
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="退款状态"
                            content={findLabel(item.state, config.orderRefundList)}
                          />
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : null}
                {!!detail?.speed && detail?.speed.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">售后进度</View>
                    <View className={classnames(bem(),"card")}>
                      {detail?.speed.map((item, index)=>{
                        return (
                          <React.Fragment key={`speed-${index}`}>
                            {item?.uid === -1 ? (
                              <View className={classnames(bem("system"))}>
                                <View className={classnames(bem("system-content"))}>
                                  {!!item.msg ? <Text className={classnames(bem("system-text"))}>{item.msg}</Text> : null}
                                  {!!item.state ? (
                                    <Text className={classnames(bem("system-text"))}>
                                      {findLabel(item.state, config.afterSale.stateList)}
                                    </Text>
                                  ) : null}
                                </View>
                                <View className={classnames(bem("system-time"))}>{secToDate(item.at)}</View>
                              </View>
                            ) : (
                              <View className={classnames(bem("item", { merchant: !!item.uid }))}>
                                <View className={classnames(bem("user"))}>
                                  {!!item.uid ? (
                                    <React.Fragment>
                                      <View className={classnames(bem("user-time"))}>{`（${secToDate(item.at)}）`}</View>
                                      <View className={classnames(bem("user-name","merchant"))}>商家</View>
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment>
                                      <View className={classnames(bem("user-name"))}>用户</View>
                                      <View className={classnames(bem("user-time"))}>{`（${secToDate(item.at)}）`}</View>
                                    </React.Fragment>
                                  )}
                                </View>
                                <View className={classnames(bem("content", { merchant: !!item.uid }))}>
                                  {!!item.pics && item.pics.length > 0 ? (
                                    <View className={classnames(bem("pics"))}>
                                      {item.pics.map((pic,idx)=>{
                                        return (
                                          <Image
                                            key={`pic_${index}_${idx}`}
                                            className={classnames(bem("pic"))}
                                            src={base.file_host + "/" + pic}
                                            mode="aspectFill"
                                            onClick={() => {
                                              handleImageClick(item.pics, idx);
                                            }}
                                          />
                                        );
                                      })}
                                    </View>
                                  ) : null}
                                  {!!item.msg ? <View className={classnames(bem("text"))}>{item.msg}</View> : null}
                                  {!!item.state ? (
                                    <React.Fragment>
                                      <View className={classnames(bem("text"))}>
                                        {findLabel(item.state, config.afterSale.stateList)}
                                      </View>
                                      {item.state === 5 && !!detail?.mailing && Object.keys(detail?.mailing).length > 0 ? (
                                        <React.Fragment>
                                          <View className={classnames(bem("text"))}>
                                            {`收货人：${detail?.mailing?.name}-${detail?.mailing?.phone}`}
                                          </View>
                                          <View className={classnames(bem("text"))}>
                                            {`地址：${detail?.mailing?.address}`}
                                          </View>
                                        </React.Fragment>
                                      ) : null}
                                      {item.state === 6 && !!item.express ? (
                                        <React.Fragment>
                                          <View className={classnames(bem("text"))}>
                                            {`快递：${findLabel(item.express.exp_type, config.expressList)}`}
                                          </View>
                                          <View
                                            className={classnames(bem("text","blue"))}
                                            onClick={()=>{
                                              navigateTo({ url: "/pages/order/index/express/index", method:"navigateTo", params: { id: detail.id, row: { express_nu: item.express.exp_nu, exp_genre: 2 } } });
                                            }}
                                          >
                                            {`单号：${item.express.exp_nu}`}
                                          </View>
                                          {!!detail?.event_at ? (
                                            <View className={classnames(bem("text"))}>
                                              {`自动确认收货时间：${secToDate(detail?.event_at)}`}
                                            </View>
                                          ) : null}
                                        </React.Fragment>
                                      ) : null}
                                    </React.Fragment>
                                  ) : null}
                                </View>
                              </View>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </View>
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
      {detail.action ? (
        <BottomBar>
          {detail.state === 1 ? (
            <Button
              type="info"
              style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
              onClick={()=>{
                operate(1, "添加凭证");
              }}
            >
              添加凭证
            </Button>
          ) : null}
          {detail.state !== 5 || detail.state !== 6 || detail.state !== 10 ? (
            <Button
              type="info"
              style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
              onClick={()=>{
                operate(3, "同意申请");
              }}
            >
              同意申请
            </Button>
          ) : null}
          {detail.state !== 3 || detail.state !== 4 || detail.state !== 10 ? (
            <Button
              type="warning"
              style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
              onClick={()=>{
                operate(2, "拒绝申请");
              }}
            >
              拒绝申请
            </Button>
          ) : null}
          {detail.state === 5 || detail.state === 6 ? (
            <Button
              type="success"
              style={{ flex: 1 }}
              onClick={()=>{
                operate(4, "完成退款");
              }}
            >
              完成退款
            </Button>
          ) : null}
        </BottomBar>
      ) : null}
    </View>
  );
};

export default OrderServiceDetail;
