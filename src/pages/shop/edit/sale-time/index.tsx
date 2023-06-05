// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Picker, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { secToDate } from "@/utils/common";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import Cell from "@/components/cell";
import Radio from "@/components/radio";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const GoodsSaleTime: FC = () => {
  const _time:any = getCurrentInstance().router?.params?.time;
  const _refs:any = getCurrentInstance().router?.params?.refs;
  const _type:any = getCurrentInstance().router?.params?.type;

  const types = [
    { label: "立即开售", value: 1 },
    { label: "指定开售时间", value: 2 }
  ];
  const [saleType, setSaleType] = useState(1);
  const [saleDate, setSaleDate] = useState("");
  const [saleTime, setSaleTime] = useState("");

  useEffect(()=>{
    if(!!_time){
      setSaleType(2);
      const _split = _time.split(" ");
      if(!!_split && _split.length > 0){
        setSaleDate(_split[0] || "");
        setSaleTime(_split[1] || "");
      }
    }else{
      setSaleType(1);
    }
  },[]);

  const saveClick = () => {
    let _time = "";
    if(saleType === 2){
      if(!saleDate){
        Taro.showToast({ title: "请选择开售日期", icon: "none" });
        return false;
      }
      if(!saleTime){
        Taro.showToast({ title: "请选择开售时间", icon: "none" });
        return false;
      }
      _time = saleDate + " " + saleTime;
    }
    if(!!_type){
      eventCenterTrigger(_refs, { time: _time, type: _type });
    }else{
      eventCenterTrigger(_refs, _time);
    }
    navigateTo({ method: "navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          {types.map((item, index)=>{
            return (
              <Radio
                key={item.value}
                border={index !== 0}
                cell
                type="dot"
                label={item.label}
                labelPosition="right"
                checked={saleType === item.value}
                value={item.value}
                onChange={(val)=>{setSaleType(val);}}
              />
            );
          })}
        </View>
        <View className="card-tips">
         商家设置了自定义开售时间后，买家端会倒计时显示可以购买的时间 。
        </View>
        {saleType === 2 ? (
          <View className="card">
            <Picker
              mode="date"
              value={saleDate}
              start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
              onChange={(e)=>{
                const date = e.detail.value.replace(/\//g, "-");
                setSaleDate(date);
              }}
            >
               <Cell
                 title="开售日期"
                 titleStyle={{ width: addUnit(72) }}
                 content={saleDate !== "" ? saleDate : "请选择开售日期"}
                 contentAlign="left"
                 contentStyle={saleDate !== "" ? undefined : { color: "#ccc" }}
                 arrow
               />
            </Picker>
            <Picker
              mode="time"
              value={saleTime}
              start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
              onChange={(e)=>{
                const date = e.detail.value.replace(/\//g, "-") + ":00";
                setSaleTime(date);
              }}
            >
              <Cell
                title="开售时间"
                titleStyle={{ width: addUnit(72) }}
                content={saleTime !== "" ? saleTime : "请选择开售时间"}
                contentAlign="left"
                contentStyle={saleTime !== "" ? undefined : { color: "#ccc" }}
                arrow
              />
            </Picker>
          </View>
        ) : null}
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
