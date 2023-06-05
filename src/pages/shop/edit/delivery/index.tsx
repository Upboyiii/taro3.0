// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Picker, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { secToDate } from "@/utils/common";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import Cell from "@/components/cell";
import Radio from "@/components/radio";
import Field from "@/components/field";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const GoodsSaleTime: FC = () => {
  const _data:any = getCurrentInstance().router?.params?.data;
  const _refs:any = getCurrentInstance().router?.params?.refs;
  const _type:any = getCurrentInstance().router?.params?.type;

  const [delivery, setDelivery] = useState(1);
  const [days, setDays] = useState("");
  const [time, setTime] = useState({
    date: "",
    time: ""
  });

  useEffect(()=>{
    if(!!_data && !!JSON.parse(_data)){
      const _obj = JSON.parse(_data);
      setDelivery(_obj.delivery === 0 ? 1 : _obj.delivery);
      setDays(_obj.delivery_day);
      if(!!_obj.time_delivery_time){
        const _split = _obj.time_delivery_time.split(" ");
        setTime({
          date: _split[0],
          time: _split[1]
        });
      }
    }
  },[]);

  const saveClick = () => {
    let _data:any = { delivery: delivery };
    if(delivery === 1){
      if(!days){
        Taro.showToast({ title: "天数不能为空", icon: "none" });
        return false;
      }
      _data.delivery_day = parseInt(days);
    }
    if(delivery === 2){
      if(!time.date){
        Taro.showToast({ title: "请选择发货日期", icon: "none" });
        return false;
      }
      if(!time.time){
        Taro.showToast({ title: "请选择发货时间", icon: "none" });
        return false;
      }
      _data.time_delivery_time = time.date + " " + time.time;
    }

    eventCenterTrigger(_refs, { data: _data, type: _type });
    navigateTo({ method: "navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Radio
            border={false}
            cell
            type="dot"
            label="指定天数内发货"
            labelPosition="right"
            checked={delivery === 1}
            value={1}
            onChange={setDelivery}
          />
          {delivery === 1 ? (
            <Field
              style={{ marginLeft: addUnit(36) }}
              required
              title="付款成功后"
              titleWidth={100}
              type="digit"
              placeholder="请输入天数"
              value={days}
              right="天后发货"
              onChange={setDays}
            />
          ) : null}
        </View>
        <View className="card">
          <Radio
            border={false}
            cell
            type="dot"
            label="指定时间发货"
            labelPosition="right"
            checked={delivery === 2}
            value={2}
            onChange={setDelivery}
          />
          {delivery === 2 ? (
            <View style={{ marginLeft: addUnit(36) }}>
              <Picker
                mode="date"
                value={time.date}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  const _date = e.detail.value.replace(/\//g, "-");
                  setTime(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.date = _date;
                    return temp;
                  });
                }}
              >
                <Cell
                  title="发货日期"
                  titleStyle={{ width: addUnit(90) }}
                  content={time.date !== "" ? time.date : "请选择发货日期"}
                  contentAlign="left"
                  contentStyle={time.date !== "" ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
              <Picker
                mode="time"
                value={time.time}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  const _time = e.detail.value.replace(/\//g, "-") + ":00";
                  setTime(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.time = _time;
                    return temp;
                  });
                }}
              >
                <Cell
                  title="发货时间"
                  titleStyle={{ width: addUnit(90) }}
                  content={time.time !== "" ? time.time : "请选择发货时间"}
                  contentAlign="left"
                  contentStyle={time.time !== "" ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
            </View>
          ) : null}
        </View>
        <View className="card-tips">
          只允许设置 90 天内的发货时间 ，请务必按照约定时间发货以免引起客户投诉。
        </View>
      </ScrollView>
      <BottomBar>
        <Button
          style={{ marginRight: addUnit(12) }}
          plain
          onClick={()=>{
            navigateTo({ method:"navigateBack" });
          }}
        >
          返回
        </Button>
        <Button
          style={{ width: "70%" }}
          type="primary"
          onClick={saveClick}
        >
          确定
        </Button>
      </BottomBar>
    </View>
  );
};

export default GoodsSaleTime;
