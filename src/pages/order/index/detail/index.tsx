import React, { FC, useEffect, useState } from "react";
import { getCurrentInstance } from "@tarojs/taro";
import { ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { orderApi } from "@/api/co_admin";
import { baseApi } from "@/api/base";
import { base } from "@/api/config";
import { formatPrice, secToDate } from "@/utils/common";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { config, findLabel, findState } from "@/pages/order/utils/config";
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
    orderApi.userOrder.info({ id: id })
      .then(async(res) => {
        if (res.code === 0 && res.data) {
          let _detail = JSON.parse(JSON.stringify(res.data || {}));
          if(_detail?.order_shop?.list && _detail?.order_shop?.list.length > 0){
            _detail?.order_shop?.list.forEach(item => {
              item.freight_type = res.data?.order_shop?.freight_type;
              item.dates = res.data?.order_shop?.dates;
            });
          }
          // 获取退款明细
          if (_detail?.refund_id && _detail?.refund_id > 0) {
            await orderApi.saleOrder.refund({ order_id: _detail.id, order_type: 1 }).then(res => {
              if (res.code === 0 && res.data.list.length > 0) {
                _detail.refundList = res.data.list;
              }
            });
          }
          // 获取区县
          if (_detail?.order_shop && _detail?.order_shop?.mailing) {
            await baseApi.region.regionName({ id: _detail.order_shop.mailing.county_id }).then(res => {
              if (res.code === 0) {
                _detail.order_shop.mailing.address = res.data.full_name + _detail.order_shop.mailing.address;
              }
            });
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
    eventCenterOn("operateOrder",() =>{
      if(_id){
        getDetail(parseInt(_id));
      }else{
        setErr(true);
      }
    });
    return ()=>{
      eventCenterOff("operateOrder");
    };
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

  const operateOpen = (type, title) => {
    let _form:any = {
      title: title,
      type: type,
      state: detail.state,
      order_id: detail.id
    };
    if(type === 1 || type === 3 || type === 5){
      _form.goods_list = (detail?.order_shop?.list || []).map(item => {
        return {
          id: item.id,
          name: item.name,
          discount: 0,
          freight: item.freight,
          pay_amount: item.pay_amount,
          sku_name: item.sku_name,
          deliver_state: item?.deliver_state || 0,
          refund_fee: item?.refund_fee || 0
        };
      });
    }
    if(type === 2 && detail?.order_shop && detail?.order_shop?.mailing){
      _form.mailing = detail?.order_shop?.mailing;
    }
    if(type === 3){
      _form.pay_amount = detail?.pay_amount || 0;
      _form.discount = detail?.discount || 0;
    }
    if(type === 5){
      _form.express_fail = detail?.express_fail;
    }
    if(type === 10 && detail?.order_shop && detail?.order_shop?.freight){
      _form.freight = detail?.order_shop?.freight;
    }

    navigateTo({ method:"navigateTo", url: "/pages/order/index/operate/index", params: _form });
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
                          title={findLabel(item.state, config.userOrder.stateList)}
                          time={secToDate(item.at, "{y}-{M}-{d} {h}:{m}")}
                        />
                      );
                    })}
                  </Steps>
                ) : null}
                <View className="card" style={{ marginTop: addUnit(12) }}>
                  {detail?.order_shop && detail?.order_shop?.sale_mode && detail?.order_shop?.sale_mode === 2 && detail?.order_shop?.surplus ? (
                    <React.Fragment>
                      <Cell
                        border={false}
                        title="本次需付金额"
                        contentStyle={{ fontSize: addUnit(14), fontWeight: "bold", color: "#ff2340" }}
                        content={`¥${formatPrice((detail?.pay_amount || 0) + (detail?.discount || 0) - (detail?.paid_amount || 0))}`}
                      />
                      <Cell
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                        border={false}
                        title="优惠金额"
                        content={`¥${formatPrice(detail?.discount || 0)}`}
                      />
                      <Cell
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                        border={false}
                        title="预付金额"
                        content={detail?.order_shop?.surplus?.pre_percentage ? ((detail?.order_shop?.surplus?.surplus_amount || 0) / (1 - detail?.order_shop?.surplus?.pre_percentage / 100)) * (detail?.order_shop?.surplus?.pre_percentage / 100) : `¥${formatPrice(detail?.total_amount || 0)}`}
                      />
                      <Cell
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                        border={false}
                        title={`预付比例${detail?.order_shop?.surplus?.pre_percentage || 100}%`}
                        content={`${secToDate(detail?.order_shop?.surplus?.deposit_start, "{y}-{M}-{d}")}-${secToDate(detail?.order_shop?.surplus?.deposit_end, "{y}-{M}-{d}")}`}
                      />
                      <Cell
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                        border={false}
                        title="尾款金额"
                        content={`¥${formatPrice(detail?.order_shop?.surplus?.surplus_amount || 0)}`}
                      />
                      <Cell
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                        border={false}
                        title="尾款支付日期"
                        content={`${secToDate(detail?.order_shop?.surplus?.surplus_start, "{y}-{M}-{d}")}-${secToDate(detail?.order_shop?.surplus?.surplus_end, "{y}-{M}-{d}")}`}
                      />
                      {!!detail?.order_shop?.surplus?.delivery_time ? (
                        <Cell
                          style={{ paddingTop: 0 }}
                          border={false}
                          title="开始发货时间"
                          content={secToDate(detail?.order_shop?.surplus?.delivery_time, "{y}-{M}-{d}")}
                        />
                      ) : null}
                      {!!detail?.order_shop?.surplus?.delivery_day ? (
                        <Cell
                          style={{ paddingTop: 0 }}
                          border={false}
                          title="发货时效"
                          content={`付款后${detail?.order_shop?.surplus?.delivery_day}天发货`}
                        />
                      ) : null}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
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
                    </React.Fragment>
                  )}
                  {detail.paid_amount > 0 ? (
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
                  {detail?.order_shop && detail?.order_shop?.freight && detail?.order_shop?.freight > 0 ? (
                    <Cell
                      style={{ paddingTop: 0 }}
                      border={false}
                      title="运费"
                      contentStyle={{ color: "#ff7e00" }}
                      content={`¥${formatPrice(detail?.order_shop?.freight || 0)}`}
                    />
                  ) : null}
                  {detail.use_points > 0 ? (
                    <Cell
                      style={{ paddingTop: 0 }}
                      border={false}
                      title="使用积分"
                      content={detail.use_points}
                    />
                  ) : null}
                </View>
                <View className="card">
                  <Cell
                    border={false}
                    title="订单编号"
                    content={detail.id}
                  />
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="订单名称"
                    content={detail.subject}
                  />
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
                    content={findLabel(detail.type, config.userOrder.typeList)}
                  />
                  {detail.state === 2 ? (
                    <React.Fragment>
                      {detail.state_ats && detail.state_ats.length > 0 ? (
                        <React.Fragment>
                          {!!detail.state_ats.find(item => item.state === 5) ? (
                            <Cell
                              border={false}
                              style={{ paddingTop: 0 }}
                              title="状态说明"
                              contentStyle={{ color: "#ff2340" }}
                              content="商品已开启付款减库存，买家付款后商品库存不足，已关闭订单并退款"
                            />
                          ) : detail.state_ats.map((item, index)=>{
                            if(item.state !== 2 && !item.msg) return null;
                            return (
                              <Cell
                                key={`step-${index}`}
                                border={false}
                                style={{ paddingTop: 0 }}
                                title="状态说明"
                                contentStyle={item.msg === "timeout" ? { color: "#ff2340" } : {}}
                                content={item.msg === "timeout" ? "订单支付超时" : item.msg}
                              />
                            );
                          })}
                        </React.Fragment>
                      ) : null}
                    </React.Fragment>
                  ) : detail.state === 6 ? (
                      <Cell
                        border={false}
                        style={{ paddingTop: 0 }}
                        title="状态说明"
                        contentStyle={{ color: "#ff2340" }}
                        content="账户余额不足，无法向供应商支付此订单的补贴价格，请充值余额后再点击补贴支付，或者直接关闭订单"
                      />
                  ) : detail.state === 10 ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title="结算时间"
                      content={secToDate(detail.expire_at)}
                    />
                  ) : null}
                  {!!detail.note ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title="订单备注"
                      content={detail.note}
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
                  {detail.deleted_at ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title="删除时间"
                      content={secToDate(detail.deleted_at)}
                    />
                  ) : null}
                  {detail.state === 8 || detail.state === 10 ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title={detail.state === 8 ? "自动收货时间" : "自动结算时间"}
                      content={secToDate(detail.expire_at)}
                    />
                  ) : null}
                  {detail.sales_state ? (
                    <Cell
                      border={false}
                      style={{ paddingTop: 0 }}
                      title="售后状态"
                      content={findLabel(detail.sales_state, config.userOrder.salesList)}
                      arrow={detail.sales_state !== 3}
                      onClick={()=>{
                        if(detail.sales_state === 3) return;
                        navigateTo({ method:"navigateTo", url: "/pages/order/aftersale/index?order_id=" + detail.id });
                      }}
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
                {detail?.order_shop && detail?.order_shop?.mailing ? (
                  <React.Fragment>
                    <View className="card-title">联系人信息</View>
                    <View className="card">
                      <Cell
                        border={false}
                        title="联系人"
                        content={detail?.order_shop?.mailing?.name || "-"}
                      />
                      <Cell
                        border={false}
                        style={{ paddingTop: 0 }}
                        title="联系电话"
                        content={detail?.order_shop?.mailing?.phone || "-"}
                      />
                      <Cell
                        border={false}
                        align="start"
                        style={{ paddingTop: 0 }}
                        title="联系人地址"
                        content={detail?.order_shop?.mailing?.address || "-"}
                      />
                    </View>
                  </React.Fragment>
                ) : null}
                {detail?.express && detail?.express.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">发货信息</View>
                    {detail?.express.map((express, idx)=>{
                      return (
                        <View className="card" key={`express-${idx}`}>
                          {express.type === 2 ? (
                            <React.Fragment>
                              <Cell
                                border={false}
                                title="物流类型"
                                content={findLabel(express.exp_type, config.expressList)}
                              />
                              <Cell
                                border={false}
                                style={{ paddingTop: 0 }}
                                title="物流单号"
                                content={express.exp_nu}
                                arrow
                                onClick={()=>{
                                  let _row = JSON.parse(JSON.stringify(express));
                                  _row.created_at = detail.created_at;
                                  if (express.type === 2 && express.exp_type !== "card" && express.exp_type !== "hotel") {
                                    _row.exp_genre = 1;
                                  }
                                  if(detail.order_shop && detail.order_shop.mailing){
                                    _row.mailing = detail.order_shop.mailing;
                                  }
                                  navigateTo({ url: "/pages/order/index/express/index", method:"navigateTo", params: { id: detail.id, row: _row } });
                                }}
                              />
                            </React.Fragment>
                          ) : express.exp_type === "card" ? (
                            <Cell
                              border={false}
                              title="卡券"
                              content={express.exp_nu}
                              arrow
                            />
                          ) : express.exp_type === "hotel" ? (
                            <Cell
                              border={false}
                              title="酒店"
                              content={express.exp_nu}
                            />
                          ) : (
                            <Cell
                              border={false}
                              title="标记"
                              content={express.exp_nu}
                            />
                          )}
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : null}
                {detail?.order_shop?.list && detail?.order_shop?.list.length > 0 ? (
                  <React.Fragment>
                    <View className="card-title">商品信息</View>
                    {detail?.order_shop?.list.map(goods=>{
                      return (
                        <View className="card" key={`good-${goods.id}`} style={{ paddingBottom: addUnit(12) }}>
                          <Cell
                            border={false}
                            iconSize={40}
                            icon={base.file_host + "/" + goods.cover}
                            title={goods.name}
                            labelStyle={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
                            label={
                              <React.Fragment>
                                {!!goods.sku_name ? <View style={{ fontSize: addUnit(12), color: "#999" }}>{`${goods.sku_name}；`}</View> : null}
                                {goods?.custom && goods?.custom?.attrs_ids && goods?.custom?.attrs_ids.length > 0 ? goods?.custom?.attrs_ids.map((sku, idx)=>{
                                  return (
                                    <React.Fragment key={`sku-${goods.id}-${idx}`}>
                                      <View style={{ fontSize: addUnit(12), color: "#999" }}>
                                        {`${sku.name}${sku.price ? `(¥${formatPrice(sku.price)})` : ""}；`}；
                                      </View>
                                    </React.Fragment>
                                  );
                                }) : null}
                              </React.Fragment>
                            }
                          />
                          <Cell
                            style={{ paddingBottom: addUnit(8) }}
                            contentStyle={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}
                          >
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999" }}>商品类型</View>
                              <View style={{ fontSize: addUnit(14), color: "#333", marginTop: addUnit(2) }}>
                                {findLabel(goods.type, config.goodsTypeList)}
                              </View>
                            </View>
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>商品状态</View>
                              <View style={{ fontSize: addUnit(14), color: "#333", textAlign: "right", marginTop: addUnit(2) }}>
                                {findState(detail.state, goods)}
                              </View>
                            </View>
                          </Cell>
                          <Cell
                            border={false}
                            style={{ paddingTop: 0, paddingBottom: addUnit(8) }}
                            contentStyle={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}
                          >
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999" }}>单价(元)</View>
                              <View style={{ fontSize: addUnit(16), color: "#333", fontWeight: "bold", marginTop: addUnit(2) }}>
                                {formatPrice(goods.price || 0)}
                              </View>
                            </View>
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "center" }}>数量(件)</View>
                              <View style={{ fontSize: addUnit(16), color: "#333", textAlign: "center", fontWeight: "bold", marginTop: addUnit(2) }}>
                                {goods.pay_num}
                              </View>
                            </View>
                            <View>
                              <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>金额(元)</View>
                              <View style={{ fontSize: addUnit(16), color: "#333", textAlign: "right", fontWeight: "bold", marginTop: addUnit(2) }}>
                                {formatPrice(goods.amount || 0)}
                              </View>
                            </View>
                          </Cell>
                          <Cell
                            border={false}
                            style={{ paddingTop: 0, paddingBottom: 0 }}
                            contentStyle={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}
                          >
                            {detail?.order_shop && detail?.order_shop?.sale_mode && detail?.order_shop?.sale_mode === 2 && detail?.order_shop?.surplus ? (
                              <React.Fragment>
                                <View>
                                  <View style={{ fontSize: addUnit(10), color: "#999" }}>预付(元)</View>
                                  <View style={{ fontSize: addUnit(16), color: "#333", fontWeight: "bold", marginTop: addUnit(2) }}>
                                    {formatPrice(((detail?.order_shop?.surplus?.surplus_amount / (1 - detail?.order_shop?.surplus?.pre_percentage / 100)) * (detail?.order_shop?.surplus?.pre_percentage / 100)))}
                                  </View>
                                </View>
                                <View>
                                  <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "center" }}>尾款(元)</View>
                                  <View style={{ fontSize: addUnit(16), color: "#333", textAlign: "center", fontWeight: "bold", marginTop: addUnit(2) }}>
                                    {formatPrice(detail?.order_shop?.surplus?.surplus_amount || 0)}
                                  </View>
                                </View>
                                <View>
                                  <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "center" }}>应付(元)</View>
                                  <View style={{ fontSize: addUnit(16), color: "#ff2340", textAlign: "center", fontWeight: "bold", marginTop: addUnit(2) }}>
                                    {formatPrice(goods?.pay_amount || 0)}
                                  </View>
                                </View>
                                <View>
                                  <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>已付(元)</View>
                                  <View style={{ fontSize: addUnit(16), color: "#ff2340", textAlign: "right", fontWeight: "bold", marginTop: addUnit(2) }}>
                                    {formatPrice(goods?.paid_amount || 0)}
                                  </View>
                                </View>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <View>
                                  <View style={{ fontSize: addUnit(10), color: "#999" }}>优惠(元)</View>
                                  <View style={{ fontSize: addUnit(16), color: "#333", fontWeight: "bold", marginTop: addUnit(2) }}>
                                    {formatPrice(goods?.total_amount ? goods?.amount - goods?.total_amount : goods?.amount)}
                                  </View>
                                </View>
                                {!!goods?.freight ? (
                                  <View>
                                    <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "center" }}>运费(元)</View>
                                    <View style={{ fontSize: addUnit(16), color: "#333", textAlign: "center", fontWeight: "bold", marginTop: addUnit(2) }}>
                                      {formatPrice(goods?.freight || 0)}
                                    </View>
                                  </View>
                                ) : null}
                                <View>
                                  <View style={{ fontSize: addUnit(10), color: "#999", textAlign: "right" }}>实付(元)</View>
                                  <View style={{ fontSize: addUnit(16), color: "#ff2340", textAlign: "right", fontWeight: "bold", marginTop: addUnit(2) }}>
                                    {formatPrice(goods?.freight ? goods?.freight + goods?.pay_amount : goods?.pay_amount)}
                                  </View>
                                </View>
                              </React.Fragment>
                            )}
                          </Cell>
                          {(goods.type === 6 && !!goods.dates && goods.dates.length > 1) || (!!goods?.discount && goods?.discount.length > 0) ? (
                            <React.Fragment>
                              {goods.type === 6 && !!goods.dates && goods.dates.length > 1 ? (
                                <React.Fragment>
                                  <Cell
                                    borderStyle={{ left: addUnit(14) }}
                                    style={{ marginTop: addUnit(8), paddingTop: addUnit(10) }}
                                    size="small"
                                    title="入住时间"
                                    content={secToDate(goods.dates[0])}
                                  />
                                  <Cell
                                    borderStyle={{ left: addUnit(14) }}
                                    style={{ marginTop: addUnit(8), paddingTop: addUnit(10) }}
                                    size="small"
                                    title="离店时间"
                                    content={secToDate(goods.dates[goods.dates.length - 1] + 86400)}
                                  />
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  {goods.discount.map((discount,idx)=>{
                                    return (
                                      <Cell
                                        border={idx === 0}
                                        borderStyle={{ left: addUnit(14) }}
                                        iconStyle={{ marginRight: addUnit(4) }}
                                        icon={
                                          <Tag
                                            size="small"
                                            dark
                                            plain={false}
                                            type={discount.type === 1 ? "info" : discount.type === 2 ? "primary" : discount.type === 3 ? "warning" : discount.type === 4 ? "success" : "default"}
                                          >
                                            {findLabel(discount.type, config.userOrder.discountType)}
                                          </Tag>
                                        }
                                        style={
                                          idx === 0 ? { marginTop: addUnit(8), paddingTop: addUnit(10), paddingBottom: addUnit(idx === goods.discount.length - 1 ? 0 : 4) } :
                                            { paddingTop: 0, paddingBottom: addUnit(idx === goods.discount.length - 1 ? 0 : 4) }
                                        }
                                        size="small"
                                        key={`discount-${goods.id}-${idx}`}
                                        title={discount.name}
                                        content={`-¥${formatPrice(discount?.amount || 0)}`}
                                      />
                                    );
                                  })}
                                </React.Fragment>
                              )}
                            </React.Fragment>
                          ) : null}
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
      {detail.state !== 2 || (detail.sales_state && detail.sales_state > 0 && detail.sales_state !== 3) ? (
        <BottomBar style={{ paddingLeft: addUnit(10), paddingRight: addUnit(10) }}>
          {detail.sales_state && detail.sales_state > 0 && detail.sales_state !== 3 ? (
            <Button
              type="info"
              style={{ width: "70%" }}
              onClick={()=>{
                navigateTo({ method:"navigateTo", url: "/pages/order/aftersale/index?order_id=" + detail.id });
              }}
            >
              售后
            </Button>
          ) : detail.state !== 2 ? (
            <React.Fragment>
              {detail.state < 8 ? (
                <Button
                  type="default"
                  plain
                  paddingHorizontal={0}
                  style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                  onClick={()=>{
                    operateOpen(1, "取消订单");
                  }}
                >
                  取消
                </Button>
              ) : null}
              {!loading ? (
                <Button
                  type="info"
                  paddingHorizontal={0}
                  style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                  onClick={()=>{
                    operateOpen(4, "添加标记");
                  }}
                >
                  标记
                </Button>
              ) : null}
              {detail.state < 8 && detail?.order_shop && detail?.order_shop?.mailing ? (
                <Button
                  type="warning"
                  paddingHorizontal={0}
                  style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                  textStyle={{ fontSize: addUnit(13) }}
                  onClick={()=>{
                    operateOpen(2, "修改邮寄地址");
                  }}
                >
                  修改地址
                </Button>
              ) : null}
              {detail.state === 5 ? (
                <Button
                  type="primary"
                  paddingHorizontal={0}
                  style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                  onClick={()=>{
                    operateOpen(2, "修改邮寄地址");
                  }}
                >
                  补货
                </Button>
              ) : null}
              {detail.state === 6 ? (
                <Button
                  type="success"
                  paddingHorizontal={0}
                  style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                  textStyle={{ fontSize: addUnit(13) }}
                  onClick={()=>{
                    operateOpen(6, "确认补货");
                  }}
                >
                  补贴支付
                </Button>
              ) : null}

              {detail.state === 1 ? (
                <React.Fragment>
                  <Button
                    type="warning"
                    paddingHorizontal={0}
                    style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                    textStyle={{ fontSize: addUnit(13) }}
                    onClick={()=>{
                      operateOpen(3, "修改订单价格");
                    }}
                  >
                    修改价格
                  </Button>
                  <Button
                    type="warning"
                    paddingHorizontal={0}
                    style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                    onClick={()=>{
                      navigateTo({ method:"navigateTo",url:"/pages/com/pay/index",params:{ order_id:detail.id ,order_type:1,delta:1 ,eventLabel:"operateOrder" } });
                    }}
                  >
                    支付
                  </Button>
                  {detail?.order_shop && detail?.order_shop?.freight_type && (detail?.order_shop?.freight_type === 1 || detail?.order_shop?.freight_type === 2) ? (
                    <Button
                      type="success"
                      paddingHorizontal={0}
                      style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                      textStyle={{ fontSize: addUnit(13) }}
                      onClick={()=>{
                        operateOpen(10, "修改运费");
                      }}
                    >
                      修改运费
                    </Button>
                  ) : null}
                </React.Fragment>
              ) : null}
              {detail.state === 7 ? (
                <React.Fragment>
                  {detail.apply !== "food" ? (
                    <Button
                      type="primary"
                      paddingHorizontal={0}
                      style={{ flex: 1, marginLeft: addUnit(6), marginRight: addUnit(6) }}
                      onClick={()=>{
                        operateOpen(5, "立即发货");
                      }}
                    >
                      发货
                    </Button>
                  ) : null}
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ) : null}
        </BottomBar>
      ) : null}
    </View>
  );
};

export default OrderDetail;
