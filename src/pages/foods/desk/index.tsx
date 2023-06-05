import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Text } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { orderApi } from "@/api/co_admin";
import { eventCenterOff, eventCenterOn, navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Popup from "@/components/popup";
import Checkbox from "@/components/checkbox";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const FoodsDesk: FC = () => {
  const deskDetail: any = getCurrentInstance().router?.params;

  useEffect(() => {
    if(deskDetail?.name){
      // Taro.setNavigationBarTitle({ title: `餐桌详情 - 桌号${deskDetail.name}` });
    }
    if(deskDetail?.flow_id){
      getOrderList(deskDetail?.flow_id, deskDetail?.order);
      eventCenterOn("foodsDesk",res=>{
        const msg = res[0];
        switch (msg.type) {
          case "order":
            getOrderList(deskDetail?.flow_id, JSON.stringify(msg.data));
            break;
          default:
            break;
        }
      });
    }
    return()=>{
      eventCenterOff("foodsDesk");
    };
  }, []);

  const planStates = { 0: "待确认", 1: "待上菜", 2: "上菜完成" };
  const orderPersonInit = {
    show: false,
    is_user: false,
    info: {},
    user: {},
    users: {}
  };
  // @ts-ignore
  const [orderPerson, setOrderPerson] = useState<any>(orderPersonInit);
  const [unpaid, setUnpaid] = useState(false);

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState<any>([]);
  const getOrderList = (flow_id, desk_order) => {
    setErr(false);
    setLoading(true);
    orderApi.userOrder
      .page({ apply: "food", apply_be: flow_id, page: 1, page_size: 99, is_shop: true })
      .then(res => {
        if (res.code === 0) {
          let _list = res?.data?.list || [];
          let _user = res.data?.user || {};
          if (_list.length > 0) {
            let foods_list:any = [];
            let is_pay = false;
            for (let i in _list) {
              if (_list[i].type !== 3) {
                _list[i].checkList = [];
                if(desk_order){
                  const _order = JSON.parse(desk_order);
                  _list[i].plan_state = _order.find(ite => ite.order_id === _list[i].id)?.plan_state ?? 0;
                }
                foods_list.push(_list[i]);
              }
              if (_list[i].state < 2) {
                // 如果有待支付订单 显示结账
                is_pay = true;
              }
            }
            setUnpaid(is_pay);
            setOrderList(foods_list);
          }
          setOrderPerson(Object.assign({},orderPersonInit, _user));
        }else{
          setErr(true);
        }
      }).catch(() => {
      setErr(true);
    })
      .finally(() => {
        setLoading(false);
      });
  };

  const [orderAmount, setOrderAmount] = useState({ total: 0, paid: 0, pay: 0, refound: 0, discount: 0 });
  const getOrderAmount = () => {
    if (orderList.length > 0) {
      let total = 0, paid = 0, pay = 0, refound = 0,  discount = 0;
      orderList.forEach(item => {
        if (item.state !== 2) {
          total += (item.pay_amount ? item.pay_amount : 0) + (item.discount ? item.discount : 0);
          discount += item.discount ? item.discount : 0;
        }
        if (item.state > 1) {
          paid += item.paid_amount ? item.paid_amount : 0;
          refound += item.refund_fee ? item.refund_fee : 0;
        }
      });
      setOrderAmount(prevState => {
        let temp = JSON.parse(JSON.stringify(prevState));
        temp.total = (total / 100).toFixed(2);
        temp.paid = (paid / 100).toFixed(2);
        temp.pay = (pay / 100).toFixed(2);
        temp.refound = (refound / 100).toFixed(2);
        temp.discount = (discount / 100).toFixed(2);
        return temp;
      });
    }
  };

  useEffect(() => {
    getOrderAmount();
  }, [orderList]);

  const [orderDetail, setOrderDetail] = useState({
    visable: false,
    detail: {
      id: 0,
      state: 0,
      plan_state: 0,
      order_shop: {
        list: []
      },
      order_data: {
        payment: "0"
      }
    },
    indeterminate: false,
    allChecked: false,
    checkList: [],
    disabled: 0
  });
  const orderDetailClose = () => {
    setOrderDetail(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.visable = false;
      temp.detail = {
        state: 0,
        plan_state: 0,
        order_shop: {
          list: []
        },
        order_data: {
          payment: "0"
        }
      };
      temp.indeterminate = false;
      temp.allChecked = false;
      temp.checkList = [];
      temp.disabled = 0;
      return temp;
    });
  };
  const allCheckedClick = (val) =>{
    setOrderDetail(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.indeterminate = false;
      temp.allChecked = val;
      if(val){
        let arrs:any = [];
        (temp.detail.order_shop.list || []).forEach(item => {
          if ((!item.deliver_state || item.deliver_state !== -1) && !item.disabled) {
            arrs.push(item.id);
          }
        });
        temp.checkList = arrs;
      }else{
        temp.checkList = [];
      }
      return temp;
    });
  };
  const operate = (state,order_id)=>{
    console.log(state,order_id);
    switch (state) {
      case 10: // 确认订单
      case 11: // 上菜
        if (order_id) {
          updateState({
            data_type: state,
            desk_id: Number(deskDetail.desk_id),
            flow_id: deskDetail.flow_id,
            order_id: order_id
          },"updateState",true);
        }
        break;
      case 30: // 清桌
        Taro.showModal({
          title: "提示",
          content: `确认将${deskDetail.name}清桌`,
          success:(res)=> {
            if (res.confirm) {
              updateState(
                {
                  desk_id: [Number(deskDetail.desk_id)]
                },
                "clearDesk",
                false,
                true
              );
            }
          }
        });
        break;
      case 40: // 取消菜品
        console.log("-----");
        if (orderDetail.checkList.length > 0) {
          let ids:any = orderDetail.checkList;
          if(orderList.length === orderDetail.checkList.length){
            ids = null;
          }
          let obj = { type: 1, order_id: order_id, close: { type: 1, ids: ids }, mark:"",cancel_ids: null };
          if (orderDetail.detail.state === 1 && ids && ids.length > 0) {
            // 待付款
            obj.type = 8;
            obj.cancel_ids = ids;
            // @ts-ignore
            delete obj.close;
          }
          orderApi.userOrder
            .operate(obj)
            .then(res => {
              console.log(res,"res");
              if (res.code === 0) {
                setOrderDetail(prv=>{
                  prv.visable = false;
                  return { ...prv };
                });
              }else {
                setErrOrderDetailMsg(res.message);
              }
            })
            .catch(() => {

            });
        }
        break;
    }
  };

  const updateState = (data, plugin_label = "updateState",close = false,back = false)=>{
    // @ts-ignore
    pluginApi.plugin(
      "put",
      312,
      plugin_label,
      JSON.stringify(data),
      19848070
    ).then(res=>{
      if(res.code === 0){
        if(close){
          setOrderDetail(prv=>{
            prv.visable = false;
            return { ...prv };
          });
        }
        if(back){
          navigateTo({ method:"navigateBack" });
        }
      }else {
        Taro.showToast({ title: res.message, icon: "none" });
        // setErrOrderDetailMsg(res.message);
      }
    }).catch((res)=>{
      Taro.showToast({ title: res.message, icon: "none" });
    });
  };

  const [errOrderDetailMsg,setErrOrderDetailMsg] = useState("");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!loading ? (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {deskDetail?.flow_id ? (
                  <React.Fragment>
                    <View className="card" style={{ marginTop: addUnit(12), paddingBottom: addUnit(8) }}>
                      <Cell
                        border={false}
                        style={{ paddingBottom: 0 }}
                        title="桌号"
                        content={deskDetail?.name}
                      />
                      <Cell
                        border={false}
                        style={{ paddingTop: 0,paddingBottom: 0 }}
                        title="流水号"
                        content={deskDetail?.flow_id}
                      />
                      <Cell
                        border={false}
                        style={{ paddingTop: 0, paddingBottom: addUnit(deskDetail?.person_nums ? 0 : 8) }}
                        title="订单数"
                        content={orderList?.length}
                      />
                      {deskDetail?.person_nums ? (
                        <Cell
                          border={false}
                          style={{ paddingTop: 0 }}
                          title="用餐人数"
                          content={deskDetail?.person_nums}
                        />
                      ) : null}
                      <Cell
                        style={{ paddingBottom: 0, paddingTop: addUnit(8) }}
                        title="总金额"
                        content={`¥${orderAmount.total}`}
                      />
                      {orderAmount.discount > 0 ? (
                        <Cell
                          border={false}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                          title="折扣"
                          contentStyle={{ color: "#ff3300" }}
                          content={`¥${orderAmount.discount}`}
                        />
                      ) : null}
                      {orderAmount.total > 0 ? (
                        <Cell
                          border={false}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                          title="应付"
                          contentStyle={{ color: "#ff2340" }}
                          content={`¥${orderAmount.total - orderAmount.discount}`}
                        />
                      ) : null}
                      <Cell
                        border={false}
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                        title="已付"
                        contentStyle={{ color: "#00c35c" }}
                        content={`¥${orderAmount.paid}`}
                      />
                      {orderAmount.pay > 0 ? (
                        <Cell
                          border={false}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                          title="待付"
                          content={`¥${orderAmount.pay}`}
                        />
                      ) : null}
                      {orderAmount.refound > 0 ? (
                        <Cell
                          border={false}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                          title="已退"
                          contentStyle={{ color: "#ff7e00" }}
                          content={`¥${orderAmount.refound}`}
                        />
                      ) : null}
                    </View>
                  </React.Fragment>
                ) : null}
                {orderList.map((item,index)=>{
                  return (
                    <React.Fragment key={`item-${item.id}-${index}`}>
                      <View className="card" style={{ paddingBottom: addUnit(8) }}>
                        <Cell
                          title={`订单号${ item.id }`}
                          arrow
                          label={!!item.note ? `备注：${item.note}` : null}
                          extra={
                            item.state === 2 ? (
                              <Tag plain={false}>已取消</Tag>
                            ) : !(item.order_data.payment === "1" && item.state === 1) && !!planStates[item.plan_state] ? (
                              <Tag
                                plain={false}
                                type={item.plan_state === 1 ? "primary" : item.plan_state === 2 ? "success" : "info"}
                              >
                                {planStates[item.plan_state]}
                              </Tag>
                            ) : (item.order_data.payment === "1" && item.state === 1 ? <Tag size="small" type="warning">待支付</Tag> : null)
                          }
                          onClick={()=>{
                            setOrderDetail(prevState => {
                              let temp = JSON.parse(JSON.stringify(prevState));
                              temp.visable = true;
                              temp.detail = item;
                              temp.detail.order_shop.list = (item?.order_shop?.list || []).map(foods=>{
                                foods.disabled = item.state === 2 ||
                                  (foods.refund_fee && foods.refund_fee > 0) ||
                                  (foods.deliver_state && foods.deliver_state === -1) ||
                                  item.state > 9 ||
                                  (item.order_data.payment === "1" && item.state === 1);
                                if(foods.disabled){ temp.disabled += 1;}
                                return foods;
                              });
                              return temp;
                            });
                            setErrOrderDetailMsg("");
                          }}
                        />
                        <React.Fragment>
                          <Cell
                            size="small"
                            style={{ paddingBottom: 0 }}
                            title="总金额"
                            content={`¥${(((item?.pay_amount || 0) + (item.discount || 0)) / 100).toFixed(2)}`}
                          />
                          {(!item.paid_amount || item.paid_amount < item.pay_amount) && item.state !== 2 ? (
                            <Cell
                              border={false}
                              size="small"
                              style={{ paddingTop: 0, paddingBottom: 0 }}
                              title="待付"
                              content={`¥${((item?.pay_amount || 0) / 100).toFixed(2)}`}
                            />
                          ) : null}
                          {!!item.paid_amount && item.paid_amount > 0 ? (
                            <Cell
                              border={false}
                              size="small"
                              style={{ paddingTop: 0, paddingBottom: 0 }}
                              title="已付"
                              content={`¥${(item.paid_amount / 100).toFixed(2)}`}
                            />
                          ) : null}
                          {!!item.discount && item.discount > 0 ? (
                            <Cell
                              border={false}
                              size="small"
                              style={{ paddingTop: 0, paddingBottom: 0 }}
                              title="折扣"
                              content={`¥${(item.discount / 100).toFixed(2)}`}
                            />
                          ) : null}
                          {!!item.refund_fee ? (
                            <Cell
                              size="small"
                              style={{ paddingBottom: 0, marginTop: addUnit(6) }}
                              title="退款"
                              arrow={!!item.refund_id}
                              content={`¥${(item.refund_fee / 100).toFixed(2)}`}
                              onClick={()=>{
                                if(!!item.refund_id){
                                  console.log("退款记录");
                                }
                              }}
                            />
                          ) : null}
                        </React.Fragment>
                      </View>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              {Array(6)
                .fill("")
                .map((_, i) => {
                  return (
                    <Skeleton
                      key={i}
                      border={i === 2}
                      contentDirection="row"
                      rowsAlign="between"
                      rowsDirection="row"
                      // row={2}
                      rowWidth={[60, 60]}
                      rowHeight={12}
                      style={i !== 0 && i !== 2 ? { paddingTop: addUnit(0) } : {}}
                    />
                  );
                })}
            </View>
            {Array(3)
              .fill("")
              .map((_, index) => {
                return (
                  <View className="card" key={`card-${index}`}>
                    {Array(3)
                      .fill("")
                      .map((_, i) => {
                        return (
                          <Skeleton
                            key={i}
                            border={i === 1}
                            contentDirection="row"
                            rowsAlign="between"
                            rowsDirection="row"
                            // row={2}
                            rowWidth={[60, 60]}
                            rowHeight={12}
                            style={i !== 0 && i !== 1 ? { paddingTop: addUnit(0) } : {}}
                          />
                        );
                      })}
                  </View>
                );
              })}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ flex: 1 }}
          type="success"
          onClick={() => {
            let form = { tableNumber: deskDetail?.name, desk_id: deskDetail?.desk_id,flow_id: deskDetail?.flow_id,person_nums: deskDetail?.person_nums };
            navigateTo({ url: "/pages/foods/order/index", method: "navigateTo", params: form });
          }}
        >
          加菜
        </Button>
        <Button
          style={{ marginLeft: addUnit(12), flex: 1 }}
          type="warning"
          onClick={() => {
            operate(30,null);
          }}
        >
          清桌
        </Button>
        {unpaid ? (
          <Button
            style={{ marginLeft: addUnit(12), flex: 1 }}
            type="primary"
            onClick={() => {
              navigateTo({ method:"navigateTo",url:"/pages/foods/desk/settle/index",params:{ flow_id:deskDetail?.flow_id } });
            }}
          >
            结账
          </Button>
        ) : null}
      </BottomBar>
      <Popup
        show={orderDetail.visable}
        title="菜品管理"
        position="pageSheet"
        bgColor="#f7f8f8"
        onClose={orderDetailClose}
        tips={errOrderDetailMsg}
        actionStyle={{ justifyContent: orderDetail.detail?.state <= 9 ? "space-between" : "center" }}
        action={
          orderDetail.detail?.state !== 2 ? (
            <React.Fragment>
              {orderDetail.detail?.state <= 9 ? (
                <Checkbox
                  disabled={orderDetail.disabled === orderDetail.detail?.order_shop.list.length}
                  indeterminate={orderDetail.indeterminate}
                  checked={orderDetail.allChecked}
                  onChange={(val)=>{allCheckedClick(val); }}
                >
                  全选
                </Checkbox>
              ) : null}
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                {orderDetail.detail?.state <= 9 && (orderDetail.detail?.order_data?.payment !== "1" ||
                  (orderDetail.detail?.order_data?.payment === "1" && orderDetail.detail?.state > 2)) ? (
                  <Button
                    style={{ marginLeft: addUnit(10) }}
                    plain
                    disabled={orderDetail.checkList.length === 0}
                    onClick={()=>operate(40,orderDetail.detail?.id)}
                  >
                    取消菜品
                  </Button>
                ) : null}
                {!orderDetail.detail?.plan_state && (orderDetail.detail?.order_data?.payment !== "1" || (orderDetail.detail?.order_data?.payment === "1" && orderDetail.detail?.state > 2)) ? (
                  <Button
                    style={{ marginLeft: addUnit(10) }}
                    type="warning"
                    onClick={()=>{operate(10,orderDetail.detail?.id);}}
                  >
                    确认菜品
                  </Button>
                ) : null}
                {orderDetail.detail?.plan_state === 1 ? (
                  <Button
                    style={{ marginLeft: addUnit(10) }}
                    type="success"
                    onClick={()=>{operate(11,orderDetail.detail?.id);}}
                  >
                    上菜完成
                  </Button>
                ) : null}
                {orderDetail.detail?.order_data.payment === "1" && orderDetail.detail?.state === 1 ? (
                  <Button
                    style={{ marginLeft: addUnit(10) }}
                    type="primary"
                    onClick={()=>{
                      setOrderDetail(prv=>{
                        prv.visable = false;
                        return { ...prv };
                      });
                      setTimeout(()=>{
                        navigateTo({ url:"/pages/com/pay/index",method:"navigateTo",params:{ order_id:orderDetail.detail.id ,order_type:1,delta:1 ,eventLabel:"" } });
                      },300);
                    }}
                  >
                    立即支付
                  </Button>
                ) : null}
              </View>
            </React.Fragment>
          ) : null
        }
      >
        {orderDetail.detail?.order_shop.list.map((item:any,index)=>{
          return (
            <View
              key={`foods-${item.id}-${index}`}
              className="card"
              style={index === 0 ? { marginTop: addUnit(12) } : {}}
            >
              <Checkbox
                cell
                disabled={item.disabled}
                checked={(orderDetail.checkList as any[]).indexOf(item.id) > -1}
                labelPosition="right"
                labelStyle={{ display: "flex", flexDirection:"row", alignItems: "center" }}
                label={
                  <React.Fragment>
                    <Text style={{ fontSize: addUnit(14), fontWeight: "bold" }}>{item.name}</Text>
                    {!!item.deliver_state && item.deliver_state === -1 ? (
                      <Tag size="small" plain={false}  style={{ marginLeft: addUnit(4) }}>已取消</Tag>
                    ) : !!item.staff_id ? (
                      <Tag size="small" plain={false} type="info" style={{ marginLeft: addUnit(4) }}>加菜</Tag>
                    ) : null}
                  </React.Fragment>
                }
                desc={
                  !!item?.sku_name || (!!item?.custom && !!item?.custom?.attrs_ids && item?.custom?.attrs_ids.length > 0) ? (
                    <Text style={{ fontSize: addUnit(10), color: "#999", lineHeight: addUnit(12) }}>
                      {!!item?.sku_name ? `${item.sku_name};` : null}
                      {!!item?.custom && !!item?.custom?.attrs_ids && item?.custom?.attrs_ids.length > 0 ? item?.custom?.attrs_ids.map(sku => {
                        return `${sku.name};`;
                      }) : null}
                    </Text>
                  ) : null
                }
                right={
                  <React.Fragment>
                    <Text style={{ fontSize: addUnit(14), color: "#ff2340", textAlign: "right" }}>{`¥${(item.amount / item.pay_num / 100).toFixed(2)}`}</Text>
                    <Text style={{ fontSize: addUnit(12), color: "#999", textAlign: "right", marginTop: addUnit(2) }}>{`x${item.pay_num}`}</Text>
                  </React.Fragment>
                }
                onChange={(val)=>{
                  if(!item.disabled){
                    setOrderDetail(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      if(val){
                        temp.checkList.push(item.id);
                      }else{
                        temp.checkList.splice(temp.checkList.indexOf(item.id), 1);
                      }
                      temp.allChecked = temp.checkList.length === temp.detail?.order_shop.list.length - temp.disabled;
                      temp.indeterminate = temp.checkList.length > 0 && temp.checkList.length !== temp.detail?.order_shop.list.length - temp.disabled;
                      return temp;
                    });
                  }
                }}
              />
            </View>
          );
        })}
      </Popup>
    </View>
  );
};

export default FoodsDesk;
