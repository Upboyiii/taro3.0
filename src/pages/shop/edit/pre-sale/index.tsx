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
  const _data:any = getCurrentInstance().router?.params?.data;
  const _refs:any = getCurrentInstance().router?.params?.refs;
  const _type:any = getCurrentInstance().router?.params?.type;

  const types = [
    { label: "全款预售", value: 1 },
    { label: "定金预售", value: 2 }
  ];
  const percentageList = Array(19).fill("").map((_,i) => (i + 1) * 5 + "%");
  const [saleType, setSaleType] = useState(1);
  const [percentage, setPercentage] = useState<any>(null);
  const [depositStart, setDepositStart] = useState({ date: "", time: "" });
  const [depositEnd, setDepositEnd] = useState({ date: "", time: "" });
  const [surplusStart, setSurplusStart] = useState({ date: "", time: "" });
  const [surplusEnd, setSurplusEnd] = useState({ date: "", time: "" });

  useEffect(()=>{
    if(!!_data && !!JSON.parse(_data)){
      const _obj = JSON.parse(_data);
      setSaleType(_obj.pre_sale === 0 ? 1 : _obj.pre_sale);
      if(!!_obj.pre_percentage){
        setPercentage(percentageList.indexOf(_obj.pre_percentage + "%"));
      }
      if(!!_obj.time_deposit_start){
        const _deposit_start = _obj.time_deposit_start.split(" ");
        setDepositStart({
          date: _deposit_start[0],
          time: _deposit_start[1]
        });
      }
      if(!!_obj.time_deposit_end){
        const _deposit_end = _obj.time_deposit_end.split(" ");
        setDepositEnd({
          date: _deposit_end[0],
          time: _deposit_end[1]
        });
      }
      if(!!_obj.time_surplus_start){
        const _surplus_start = _obj.time_surplus_start.split(" ");
        setSurplusStart({
          date: _surplus_start[0],
          time: _surplus_start[1]
        });
      }
      if(!!_obj.time_deposit_end){
        const _surplus_end = _obj.time_surplus_end.split(" ");
        setSurplusEnd({
          date: _surplus_end[0],
          time: _surplus_end[1]
        });
      }
    }
  },[]);

  const saveClick = () => {
    let _data:any = { pre_sale: saleType };

    if(saleType === 2){
      if(percentage === null){
        Taro.showToast({ title: "请选择预售定金比例", icon: "none" });
        return false;
      }else{
        _data.pre_percentage = percentageList[percentage].replace(/%/g, "");
        _data.pre_percentage = parseInt(_data.pre_percentage);
      }
    }

    // 定金支付时间
    if(!depositStart.date){
      Taro.showToast({ title: "请选择定金支付开始日期", icon: "none" });
      return false;
    }
    if(!depositStart.time){
      Taro.showToast({ title: "请选择定金支付开始时间", icon: "none" });
      return false;
    }
    let _time_deposit_start = depositStart.date + " " + depositStart.time;
    if(!depositEnd.date){
      Taro.showToast({ title: "请选择定金支付结束日期", icon: "none" });
      return false;
    }
    if(!depositEnd.time){
      Taro.showToast({ title: "请选择定金支付结束时间", icon: "none" });
      return false;
    }
    let _time_deposit_end = depositEnd.date + " " + depositEnd.time;

    _data.time_deposit_start = _time_deposit_start;
    _data.time_deposit_end = _time_deposit_end;

    const start_time = new Date(_data.time_deposit_start).getTime();
    const end_time = new Date(_data.time_deposit_end).getTime();
    if(start_time > end_time){
      Taro.showToast({ title: "定金支付结束时间不能小于支付开始时间", icon: "none" });
      return;
    }

    if(saleType === 2){
      // 定金支付时间
      if(!surplusStart.date){
        Taro.showToast({ title: "请选择尾款支付开始日期", icon: "none" });
        return false;
      }
      if(!surplusStart.time){
        Taro.showToast({ title: "请选择尾款支付开始时间", icon: "none" });
        return false;
      }
      let _time_surplus_start = surplusStart.date + " " + surplusStart.time;
      if(!surplusEnd.date){
        Taro.showToast({ title: "请选择尾款支付结束日期", icon: "none" });
        return false;
      }
      if(!surplusEnd.time){
        Taro.showToast({ title: "请选择尾款支付结束时间", icon: "none" });
        return false;
      }
      let _time_surplus_end = surplusEnd.date + " " + surplusEnd.time;

      _data.time_surplus_start = _time_surplus_start;
      _data.time_surplus_end = _time_surplus_end;

      const start_time = new Date(_data.time_surplus_start).getTime();
      const end_time = new Date(_data.time_surplus_end).getTime();
      if(start_time > end_time){
        Taro.showToast({ title: "尾款支付结束时间不能小于支付开始时间", icon: "none" });
        return;
      }
    }

    eventCenterTrigger(_refs, { data: _data, type: _type });
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
        {saleType === 2 ? (
          <React.Fragment>
            <View className="card-title">预售定金比例</View>
            <View className="card">
              <Picker
                mode="selector"
                range={percentageList}
                onChange={(e)=>{
                  const idx = +e.detail.value;
                  setPercentage(idx);
                }}
              >
                <Cell
                  title="定金比例"
                  titleStyle={{ width: addUnit(90) }}
                  content={percentage !== null ? percentageList[percentage] : "请选择定金比例"}
                  contentAlign="left"
                  contentStyle={percentage !== null ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
            </View>
          </React.Fragment>
        ) : null}
        <View className="card-title">定金支付时间</View>
        <View className="card">
          <Picker
            mode="date"
            value={depositStart.date}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            onChange={(e)=>{
              const _date = e.detail.value.replace(/\//g, "-");
              setDepositStart(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.date = _date;
                return temp;
              });
            }}
          >
            <Cell
              title="开始日期"
              titleStyle={{ width: addUnit(90) }}
              content={depositStart.date !== "" ? depositStart.date : "请选择定金开始日期"}
              contentAlign="left"
              contentStyle={depositStart.date !== "" ? undefined : { color: "#ccc" }}
              arrow
            />
          </Picker>
          <Picker
            mode="time"
            value={depositStart.time}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            onChange={(e)=>{
              const _time = e.detail.value.replace(/\//g, "-") + ":00";
              setDepositStart(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.time = _time;
                return temp;
              });
            }}
          >
            <Cell
              title="开始时间"
              titleStyle={{ width: addUnit(90) }}
              content={depositStart.time !== "" ? depositStart.time : "请选择定金开始时间"}
              contentAlign="left"
              contentStyle={depositStart.time !== "" ? undefined : { color: "#ccc" }}
              arrow
            />
          </Picker>
        </View>
        <View className="card">
          <Picker
            mode="date"
            value={depositEnd.date}
            start={depositStart.date}
            onChange={(e)=>{
              const _date = e.detail.value.replace(/\//g, "-");
              setDepositEnd(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.date = _date;
                return temp;
              });
            }}
          >
            <Cell
              title="结束日期"
              titleStyle={{ width: addUnit(90) }}
              content={depositEnd.date !== "" ? depositEnd.date : "请选择定金结束日期"}
              contentAlign="left"
              contentStyle={depositEnd.date !== "" ? undefined : { color: "#ccc" }}
              arrow
            />
          </Picker>
          <Picker
            mode="time"
            value={depositEnd.time}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            onChange={(e)=>{
              const _time = e.detail.value.replace(/\//g, "-") + ":00";
              setDepositEnd(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.time = _time;
                return temp;
              });
            }}
          >
            <Cell
              title="结束时间"
              titleStyle={{ width: addUnit(90) }}
              content={depositEnd.time !== "" ? depositEnd.time : "请选择定金结束时间"}
              contentAlign="left"
              contentStyle={depositEnd.time !== "" ? undefined : { color: "#ccc" }}
              arrow
            />
          </Picker>
        </View>
        {saleType === 2 ? (
          <React.Fragment>
            <View className="card-title">尾款支付时间</View>
            <View className="card">
              <Picker
                mode="date"
                value={surplusStart.date}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  const _date = e.detail.value.replace(/\//g, "-");
                  setSurplusStart(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.date = _date;
                    return temp;
                  });
                }}
              >
                <Cell
                  title="开始日期"
                  titleStyle={{ width: addUnit(90) }}
                  content={surplusStart.date !== "" ? surplusStart.date : "请选择尾款支付开始日期"}
                  contentAlign="left"
                  contentStyle={surplusStart.date !== "" ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
              <Picker
                mode="time"
                value={surplusStart.time}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  const _time = e.detail.value.replace(/\//g, "-") + ":00";
                  setSurplusStart(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.time = _time;
                    return temp;
                  });
                }}
              >
                <Cell
                  title="开始时间"
                  titleStyle={{ width: addUnit(90) }}
                  content={surplusStart.time !== "" ? surplusStart.time : "请选择尾款支付开始时间"}
                  contentAlign="left"
                  contentStyle={surplusStart.time !== "" ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
            </View>
            <View className="card">
              <Picker
                mode="date"
                value={surplusEnd.date}
                start={surplusEnd.date}
                onChange={(e)=>{
                  const _date = e.detail.value.replace(/\//g, "-");
                  setSurplusEnd(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.date = _date;
                    return temp;
                  });
                }}
              >
                <Cell
                  title="结束日期"
                  titleStyle={{ width: addUnit(90) }}
                  content={surplusEnd.date !== "" ? depositEnd.date : "请选择尾款支付结束日期"}
                  contentAlign="left"
                  contentStyle={surplusEnd.date !== "" ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
              <Picker
                mode="time"
                value={surplusEnd.time}
                start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
                onChange={(e)=>{
                  const _time = e.detail.value.replace(/\//g, "-") + ":00";
                  setSurplusEnd(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.time = _time;
                    return temp;
                  });
                }}
              >
                <Cell
                  title="结束时间"
                  titleStyle={{ width: addUnit(90) }}
                  content={surplusEnd.time !== "" ? surplusEnd.time : "请选择尾款支付结束时间"}
                  contentAlign="left"
                  contentStyle={surplusEnd.time !== "" ? undefined : { color: "#ccc" }}
                  arrow
                />
              </Picker>
            </View>
          </React.Fragment>
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
