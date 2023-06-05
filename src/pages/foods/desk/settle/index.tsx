import React, { FC, useEffect, useState } from "react";
import { useRouter } from "@tarojs/taro";
import { orderApi } from "@/api/co_admin";
import { ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { navigateTo } from "@/utils/library";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const FoodsDeskSettle: FC = () => {
  const route = useRouter();

  const defult = {
    pay_amount:0,
    order_ids:[]
  };
  const [orders,setOrders] = useState<any>(defult);

  useEffect(()=>{
    if(route.params?.flow_id){
      mergeOrder(route.params?.flow_id);
    }
    return ()=>{
    };
  },[]);

  const mergeOrder = (flow_id)=>{
    orderApi.mergeOrder.submit({ apply:"food",apply_be:[flow_id],type:2,end_mode:true,is_query:true }).then(res=>{
      console.log(res,"res");
      if(res.code === 0){
        setOrders(res.data);
      }
    });
  };
  const goPay = ()=>{
    orderApi.mergeOrder.submit({ apply:"food",apply_be:[route.params?.flow_id],type:2,end_mode:true,is_query:false }).then(res=>{
      if(res.code === 0){
        // order_type 1 企业用户订单 2企业订单 3合并订单
        // delta 支付成功后回退 几级
        // eventLabel 通知 标签
        navigateTo({ url:"/pages/com/pay/index",method:"navigateTo",params:{ order_id:res.data.id ,order_type:3,delta:2 ,eventLabel:"" } });
      }
    });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <React.Fragment>
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Cell
                border={false}
                title="支付金额"
                size="large"
                contentStyle={{ fontSize: addUnit(20), color: "#ff2340" }}
                content={`¥${formatPrice(orders.pay_amount)}`}
              />
            </View>
          </React.Fragment>
          {orders?.order_ids ? orders.order_ids.map((item,index)=>{
            return (
              <React.Fragment key={`item-${index}`}>
                <View className="card" style={{ paddingBottom: addUnit(8) }}>
                  <Cell
                    border={false}
                    style={{ paddingBottom: 0 }}
                    title="订单号"
                    content={item.order_id}
                  />
                  <Cell
                    border={false}
                    style={{ paddingBottom: 0 }}
                    title="合计金额"
                    content={"¥" + formatPrice(item.total_amount)}
                  />
                  <Cell
                    border={false}
                    style={{ paddingBottom: 0 }}
                    title="需付金额"
                    content={"¥" + formatPrice(item.pay_amount)}
                  />
                  <Cell
                    border={false}
                    style={{ paddingBottom: 0 }}
                    title="状态"
                    content={item.is_close ? (<Tag plain={false}>关闭</Tag>) : (<Tag  plain={false} type="success">正常</Tag>)}
                  />
                </View>
              </React.Fragment>
            );
          }) : null}
        </React.Fragment>
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="success"
          onClick={goPay}
        >
          立即支付
        </Button>
      </BottomBar>
    </View>
  );
};

export default FoodsDeskSettle;
