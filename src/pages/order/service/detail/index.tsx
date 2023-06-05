import React, { FC, useEffect, useState } from "react";
import { getCurrentInstance } from "@tarojs/taro";
import { ScrollView, View, Image } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { orderApi } from "@/api/co_admin";
import { base } from "@/api/config";
import { formatPrice , secToDate } from "@/utils/common";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { config, findLabel } from "@/pages/order/utils/config";
import Steps from "@/components/steps";
import Cell from "@/components/cell";
import Field from "@/components/field";
import Button from "@/components/button";
import Popup from "@/components/popup";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const OrderServiceDetail: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [form, setForm] = useState<any>({
    visable: false,
    mag: "",
    type: 0
  });

  const getDetail = (id) => {
    setLoading(true);
    orderApi.serviceOrder.info({ id: id })
      .then(res => {
        if (res.code === 0 && res.data) {
          setDetail(res.data);
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

  const operate = () => {
    if (detail.id) {
      orderApi.serviceOrder.operate({ id: detail.id, msg: form.msg, type: form.type })
        .then(res => {
          if (res.code === 0) {
            eventCenterTrigger("serviceOrder");
            navigateTo({ method:"navigateBack" });
          }
        });
    }
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
                          title={findLabel(item.state, config.serviceOrder.stateList)}
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
                    contentStyle={{ fontSize: addUnit(14), fontWeight: "bold", color: "#ff2340" }}
                    content={`¥${formatPrice(detail?.pay_amount || 0)}`}
                  />
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
                    title="服务编号"
                    content={detail.id}
                  />
                  <Cell
                    border={false}
                    style={{ paddingTop: 0 }}
                    title="平台来源"
                    content={findLabel(detail.platform, config.platformList)}
                  />
                  {detail.state === 2 && detail.state_ats && detail.state_ats.length > 0 ? (
                    <React.Fragment>
                      {detail.state_ats.map((item, index)=>{
                        if(item.state !== 2 && !item.msg) return null;
                        return (
                          <Cell
                            key={`step-${index}`}
                            border={false}
                            style={{ paddingTop: 0 }}
                            title="受理备注"
                            content={item.msg}
                          />
                        );
                      })}
                    </React.Fragment>
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
                <View className="card-title">服务明细</View>
                <View className="card">
                  <Cell
                    border={false}
                    icon={base.file_host + "/" + detail.service_logo}
                    title={detail.subject}
                  />
                  {detail.list && detail.list.length > 0 ? (
                    <React.Fragment>
                      {detail.list.map((item,index)=>{
                        return (
                          <Cell
                            key={`rule-${index}`}
                            border={index === 0}
                            style={index !== 0 ? { paddingTop: 0 } : {}}
                            title={item.name}
                            label={`x${item.pay_num}`}
                            contentStyle={{ fontSize: addUnit(18), fontWeight: "bold" }}
                            content={`¥${formatPrice(item.price)}`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ) : null}
                  {detail.word && detail.word.length > 0 ? (
                    <React.Fragment>
                      {detail.word.map((item,index)=>{
                        if(item.type === 9){
                          return null;
                        }else{
                          return (
                            <Cell
                              key={`word-${index}`}
                              border={index === 0}
                              style={index !== 0 ? { paddingTop: 0 } : {}}
                              title={item.name}
                              contentStyle={
                                item.type === 7 ? {
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "flex-end"
                                } : {}
                              }
                              content={
                                item.type === 7 ? (
                                  <React.Fragment>
                                    {item.value.map((img, idx)=>{
                                      return (
                                        <Image
                                          key={`img-${index}-${idx}`}
                                          style={{ width: addUnit(48), height: addUnit(48), marginLeft: addUnit(12), borderRadius: addUnit(6) }}
                                          src={base.file_host + "/" + img + "??100x100"}
                                          mode="aspectFill"
                                        />
                                      );
                                    })}
                                  </React.Fragment>
                                ) : item.value.join(",")
                              }
                            />
                          );
                        }
                      })}
                    </React.Fragment>
                  ) : null}
                </View>
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment></React.Fragment>
        )}
      </ScrollView>
      {detail.state === 3 || detail.state === 4 ? (
        <BottomBar>
          {detail.state === 3 ? (
            <Button
              type="info"
              style={{ flex: 1, marginRight: addUnit(12) }}
              onClick={()=>{
                setForm({
                  visable: true,
                  msg: "",
                  type: 1
                });
              }}
            >
              立即受理
            </Button>
          ) : detail.state === 4 ? (
            <Button
              type="info"
              style={{ flex: 1, marginRight: addUnit(12) }}
              onClick={()=>{
                setForm({
                  visable: true,
                  msg: "",
                  type: 2
                });
              }}
            >
              处理完成
            </Button>
          ) : null}
          {detail.state === 3 || detail.state === 4 ? (
            <Button
              type="primary"
              style={{ flex: 1 }}
              onClick={()=>{
                setForm({
                  visable: true,
                  msg: "",
                  type: 3
                });
              }}
            >
              失败
            </Button>
          ) : null}
        </BottomBar>
      ) : null}
      <Popup
        show={form.visable}
        position="pageSheet"
        title="备注"
        bgColor="#f7f8f8"
        onClose={()=>{
          setForm(prevState=>{
            let temp = JSON.parse(JSON.stringify(prevState));
            temp.msg = "";
            temp.visable = false;
            return temp;
          });
        }}
        action={
          <React.Fragment>
            <Button
              plain
              style={{ flex: 1, marginRight: addUnit(12) }}
              onClick={()=>{
                setForm(prevState=>{
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.msg = "";
                  temp.visable = false;
                  return temp;
                });
              }}
            >
              取消
            </Button>
            <Button type="info" style={{ flex: 1 }} onClick={operate}>确定</Button>
          </React.Fragment>
        }
      >
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            title="备注"
            border={false}
            value={form.msg}
            placeholder="请输入处理原因"
            onChange={(val)=>{
              setForm(prevState=>{
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.msg = val;
                return temp;
              });
            }}
          />
        </View>
      </Popup>
    </View>
  );
};

export default OrderServiceDetail;
