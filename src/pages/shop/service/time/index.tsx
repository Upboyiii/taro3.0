import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { secondToTime, timeToSecond, week2ZH } from "@/utils/common";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import Cell from "@/components/cell";
import Radio from "@/components/radio";
import Checkbox from "@/components/checkbox";
import Button from "@/components/button";
import Popup from "@/components/popup";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ServiceTime: FC = () => {
  const _params = getCurrentInstance().router?.params;

  const weekdaysList = [
    { label:"周一", value: 1 },
    { label:"周二", value: 2 },
    { label:"周三", value: 3 },
    { label:"周四", value: 4 },
    { label:"周五", value: 5 },
    { label:"周六", value: 6 },
    { label:"周日", value: 7 }
  ];

  const [weekdays, setWeekdays] = useState<any>({
    visible: false,
    selected: [], // 所有被选中
    selectable :[], // 临时选中
    item: [], // 当前选中
    index: -1
  });
  const [serviceTimeType, setServiceTimeType] = useState(3);
  const [serviceTime, setServiceTime] = useState<any[]>([]);

  useEffect(()=>{
    if(_params?.business_type){
      setServiceTimeType(parseInt(_params?.business_type));
      if(_params?.business_time){
        let business_time = JSON.parse(_params?.business_time);
        if(business_time.length > 0){
          let _weekdays:any = [];
          business_time.forEach(item=>{
            if ("time_sections" in item && item["time_sections"].length > 0) {
              item.time_sections = item["time_sections"].map(item_i => {
                if ("open_time" in item_i && "close_time" in item_i) {
                  return {
                    open_time: secondToTime(item_i.open_time),
                    close_time: secondToTime(item_i.close_time)
                  };
                }
              });
            }
            if("weekdays" in item){
              let newArr  = [..._weekdays,...item.weekdays] ;
              _weekdays = [...new Set(newArr)];
            }
          });
          setWeekdays(prv=>{
            let temp = JSON.parse(JSON.stringify(prv));
            temp.selected = _weekdays;
            return temp;
          });
        }
        setServiceTime(business_time);
      }
    }
  },[]);

  const handleTimeChange = (e, idx , name, index) => {
    const time = e.detail.value;
    setServiceTime(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(temp && temp.length > 0){
        temp[index].time_sections[idx][name] = time;
        return temp;
      }
    });
  };
  const handleTimeAdd = (index) => {
    setServiceTime(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let idx = temp[index].time_sections.length - 1;
      if(idx >= 0){
        let lastItem = temp[index].time_sections[idx];
        let timeItem = {
          open_time: lastItem.close_time,
          close_time: "23:59"
        };
        temp[index].time_sections.push(timeItem);
      }else{
        temp[index].time_sections = [{ open_time: "08:00", close_time: "18:00" }];
      }
      return temp;
    });
  };
  const handleTimeRemove = (idx, index) => {
    setServiceTime(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[index].time_sections.splice(idx,1);
      return temp;
    });
  };
  const handelSelectWeekday = (checked, day) => {
    setWeekdays(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(checked){
        if(temp.item.indexOf(day) === -1){
          temp.item.push(day);
        }
      }else{
        if(temp.item.indexOf(day) > -1){
          temp.item.splice(temp.item.indexOf(day),1);
        }
      }
      return temp;
    });
  };
  const handleEditWeekday = (index, selects:number[] = []) => {
    setWeekdays(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.index = index;
      let _weekdays = weekdaysList.map(item=>item.value);
      temp.selectable = _weekdays.filter(i=>{
        return temp.selected.indexOf(i) === -1 || selects.indexOf(i) > -1;
      });
      temp.item = selects;
      temp.visible = true;
      console.log(temp,"handleEditWeekday");
      return temp;
    });
  };
  const handleRemoveWeekday = (index, selects:number[] = []) => {
    setServiceTime(prevState => {
      let tempTime = JSON.parse(JSON.stringify(prevState));
      if(tempTime && tempTime.length > 0){
        let _weekdays = JSON.parse(JSON.stringify(tempTime[index].weekdays));
        setWeekdays(prevState => {
          let temWeek = JSON.parse(JSON.stringify(prevState));
          _weekdays.map(day=>{
            if(temWeek.selected.indexOf(day) > -1){
              temWeek.selected.splice(temWeek.selected.indexOf(day),1);
            }
          });
          return temWeek;
        });
        tempTime.splice(index,1);
      }
      return tempTime;
    });
    setWeekdays(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.selected = temp.selected.filter(i=>{
        return selects.indexOf(i) === -1;
      });
      return temp;
    });
  };
  const handelSaveWeekdays = () => {
    setServiceTime(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(weekdays.index > -1){
        temp[weekdays.index].weekdays = weekdays.item;
      }else{
        temp.push({
          weekdays: weekdays.item,
          time_sections: [
            { open_time: "08:00", close_time: "18:00" }
          ]
        });
      }
      return temp;
    });
    setWeekdays(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let _weekdays = weekdaysList.map(item=>item.value);
      temp.selected = _weekdays.filter(i=>{
        return temp.selectable.indexOf(i) === -1 || temp.item.indexOf(i) > -1;
      });
      temp.visible = false;
      return temp;
    });
  };
  const changeServiceTimeType = (val)=>{
    setServiceTimeType(()=>{
      return val;
    });
    if(val == 2){
      setServiceTime(()=>{
        return [
          {
            time_sections: [{ open_time: "08:00", close_time: "18:00" }],
            weekdays: [1,2,3,4,5,6,7]
          }
        ];
      });
    }
    if(val == 3){
      setServiceTime(()=>{
        return [
          {
            time_sections: [{ open_time: "08:00", close_time: "18:00" }],
            weekdays: [1,2,3,4,5]
          },
          {
            time_sections: [{ open_time: "06:00", close_time: "22:00" }],
            weekdays: [6,7]
          }
        ];
      });
    }
  };

  const saveTime = ()=>{
    let business_time = JSON.parse(JSON.stringify(serviceTime));
    let Obj = {
      business_type:serviceTimeType,
      business_time:[]
    };
    if(serviceTimeType === 1){
      business_time = [];
    }else{
      if(business_time.length === 0){
        Taro.showToast({ title: `请设置${serviceTimeType === 3 ? "营业周期" : "每天重复时间"}`, icon:"none" });
        return;
      }
      for(let j = 0; j < business_time.length; j++){
        let _time_sections = business_time[j].time_sections;
        let _weekdays = business_time[j].weekdays;
        if(_time_sections.length === 0){
          const tips = serviceTimeType === 3 ? `请设置${week2ZH(_weekdays)}的重复时间` : "请设置每天重复时间";
          Taro.showToast({ title: tips, icon:"none" });
          return;
        }else{
          for(let i = 0; i < _time_sections.length; i++){
            let item = _time_sections[i];
            const tips = serviceTimeType === 3 ? `${week2ZH(_weekdays)}${i + 1}` : `每天重复${i + 1}`;
            if (!item.open_time) {
              Taro.showToast({ title: `请选择${tips}开始时间`, icon: "none" });
              return false;
            }else{
              item.open_time = timeToSecond(item.open_time);
            }
            if (!item.close_time) {
              Taro.showToast({ title: `请选择${tips}结束时间`, icon: "none" });
              return false;
            }else{
              item.close_time = timeToSecond(item.close_time);
            }
            if (item.open_time >= item.close_time) {
              Taro.showToast({ title: `${tips}结束时间必须大于开始时间`, icon: "none" });
              return false;
            }
          }
        }
      }
    }

    Obj.business_time = business_time;
    eventCenterTrigger("serviceEdit",{ type:"business",data:Obj });
    navigateTo({ url: "", method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Radio
            border={false}
            cell
            type="dot"
            label="全天"
            labelPosition="right"
            checked={serviceTimeType === 1}
            value={1}
            onChange={()=>changeServiceTimeType(1)}
          />
          <Radio
            cell
            type="dot"
            label="每天重复"
            labelPosition="right"
            checked={serviceTimeType === 2}
            value={2}
            onChange={()=>changeServiceTimeType(2)}
          />
          <Radio
            cell
            type="dot"
            label="每周重复"
            labelPosition="right"
            checked={serviceTimeType === 3}
            value={3}
            onChange={()=>changeServiceTimeType(3)}
          />
        </View>
        {serviceTimeType === 2 ? (
          <React.Fragment>
            <Cell
              border={false}
              title="每天重复"
              textStyle={{ fontWeight: "bold" }}
              content={
                <View className="plus plus--border" style={{ width: addUnit(16), height: addUnit(16), borderColor: "#ff2340", borderWidth: addUnit(1) }}>
                  <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
                  <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#ff2340", top: "50%", marginTop: addUnit(-4) }} />
                </View>
              }
              extra="添加时间"
              extraStyle={{ color: "#ff2340", fontSize: addUnit(14), marginLeft: addUnit(5) }}
              onClick={()=>{
                handleTimeAdd(0);
              }}
            />
            <View className="card">
              {serviceTime[0] && serviceTime[0].time_sections.map((item:any, idx)=>{
                return (
                  <Cell
                    key={idx}
                    contentAlign="left"
                    contentStyle={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      height: addUnit(24)
                    }}
                    rightIcon={
                      <View
                        className="plus plus--border"
                        style={{
                          width: addUnit(20),
                          height: addUnit(20),
                          borderColor: "#666",
                          borderWidth: addUnit(1),
                          opacity: serviceTime[0].time_sections.length > 1 ? 1 : 0.3
                        }}
                        onClick={()=>{
                          if(serviceTime[0].time_sections.length === 1) return;
                          handleTimeRemove(idx,0);
                        }}
                      >
                        <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#666", left: "50%", marginLeft: addUnit(-4) }} />
                      </View>
                    }
                    rightStyle={{ marginLeft: addUnit(24) }}
                    onRight={()=>{
                      if(serviceTime[0].time_sections.length === 1) return;
                      handleTimeRemove(idx,0);
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Picker
                        mode="time"
                        value={item.open_time}
                        onChange={(e)=>{
                          handleTimeChange(e, idx, "open_time", 0);
                        }}
                      >
                        <View style={{ color: !!item.open_time ? "#333" : "#ccc", fontSize: addUnit(!!item.open_time ? 16 : 14) }}>{item.open_time || "选择开始时间"}</View>
                      </Picker>
                    </View>
                    <View style={{ color: "#ccc", paddingLeft: addUnit(12), paddingRight: addUnit(12) }}>至</View>
                    <View
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Picker
                        mode="time"
                        value={item.close_time}
                        onChange={(e)=>{
                          handleTimeChange(e, idx, "close_time", 0);
                        }}
                      >
                        <View style={{ color: !!item.close_time ? "#333" : "#ccc", fontSize: addUnit(!!item.close_time ? 16 : 14) }}>{item.close_time || "选择结束时间"}</View>
                      </Picker>
                    </View>
                  </Cell>
                );
              })}
            </View>
          </React.Fragment>
        ) : null}
        {serviceTimeType === 3 ? (
          <React.Fragment>
            <Cell
              border={false}
              title="每周重复"
              textStyle={{ fontWeight: "bold" }}
              content={
                <View className="plus plus--border" style={{ width: addUnit(16), height: addUnit(16), borderColor: "#ff2340", borderWidth: addUnit(1) }}>
                  <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
                  <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#ff2340", top: "50%", marginTop: addUnit(-4) }} />
                </View>
              }
              extra="添加星期"
              extraStyle={{ color: "#ff2340", fontSize: addUnit(14), marginLeft: addUnit(5) }}
              onClick={()=>{handleEditWeekday(-1);}}
            />
            {serviceTime.map((weekday, index)=>{
              return (
                <View className="card" key={`weekdays-item-${index}`}>
                  <Cell
                    border={false}
                    title={week2ZH(weekday.weekdays)}
                    textStyle={{ fontWeight: "bold" }}
                    extraStyle={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}
                    extra={
                      <React.Fragment>
                        <Button
                          type="info"
                          size="mini"
                          hairline
                          onClick={()=>{
                            handleEditWeekday(index, weekday.weekdays);
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          type="primary"
                          size="mini"
                          hairline
                          disabled={serviceTime.length < 2}
                          style={{ marginLeft: addUnit(10) }}
                          onClick={()=>{
                            handleRemoveWeekday(index, weekday.weekdays);
                          }}
                        >
                          删除
                        </Button>
                      </React.Fragment>
                    }
                  />
                  {weekday.time_sections.map((item,idx)=>{
                    return (
                      <React.Fragment key={`weekdays-time-${index}-${idx}`}>
                        <Cell
                          contentAlign="left"
                          contentStyle={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            height: addUnit(24)
                          }}
                          extra={
                            <React.Fragment>
                              <View
                                className="plus plus--border"
                                style={{
                                  width: addUnit(20),
                                  height: addUnit(20),
                                  borderColor: "#666",
                                  borderWidth: addUnit(1)
                                }}
                                onClick={()=>{
                                  handleTimeAdd(index);
                                }}
                              >
                                <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#666", left: "50%", marginLeft: addUnit(-4) }} />
                                <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#666", top: "50%", marginTop: addUnit(-4) }} />
                              </View>
                              <View
                                className="plus plus--border"
                                style={{
                                  width: addUnit(20),
                                  height: addUnit(20),
                                  borderColor: "#666",
                                  borderWidth: addUnit(1),
                                  marginLeft: addUnit(10),
                                  opacity: weekday.time_sections.length > 1 ? 1 : 0.3
                                }}
                                onClick={()=>{
                                  if(weekday.time_sections.length === 1) return;
                                  handleTimeRemove(idx,index);
                                }}
                              >
                                <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#666", left: "50%", marginLeft: addUnit(-4) }} />
                              </View>
                            </React.Fragment>
                          }
                          extraStyle={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            marginLeft: addUnit(24)
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Picker
                              mode="time"
                              value={item.open_time}
                              onChange={(e)=>{
                                handleTimeChange(e, idx, "open_time", index);
                              }}
                            >
                              <View style={{ color: !!item.open_time ? "#333" : "#ccc", fontSize: addUnit(!!item.open_time ? 16 : 14) }}>{item.open_time || "选择开始时间"}</View>
                            </Picker>
                          </View>
                          <View style={{ color: "#ccc", paddingLeft: addUnit(12), paddingRight: addUnit(12) }}>至</View>
                          <View
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Picker
                              mode="time"
                              value={item.close_time}
                              onChange={(e)=>{
                                handleTimeChange(e, idx, "close_time", index);
                              }}
                            >
                              <View style={{ color: !!item.close_time ? "#333" : "#ccc", fontSize: addUnit(!!item.close_time ? 16 : 14) }}>{item.close_time || "选择结束时间"}</View>
                            </Picker>
                          </View>
                        </Cell>
                      </React.Fragment>
                    );
                  })}
                </View>
              );
            })}
          </React.Fragment>
        ) : null}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ marginRight: addUnit(12) }}
          type="default"
          plain
          onClick={()=>{
            navigateTo({ method:"navigateBack" });
          }}
        >
          返回
        </Button>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            saveTime();
          }}
        >
          保存
        </Button>
      </BottomBar>
      <Popup
        show={weekdays.visible}
        title="选择星期"
        headerBorder
        onClose={()=>{
          setWeekdays(prevState => {
            let temp = JSON.parse(JSON.stringify(prevState));
            temp.visible = false;
            return temp;
          });
        }}
        action={
          <Button
            type="info"
            style={{ width: "70%" }}
            onClick={handelSaveWeekdays}
            disabled={weekdays.selected.length === 7 && weekdays.item.length === 0}
          >
            确定
          </Button>
        }
      >
        {weekdaysList.map((weekday, index)=>{
          return (
            <Checkbox
              cell
              key={`popup-weekday-${index}`}
              border={index !== 0}
              checked={weekdays.selected.indexOf(weekday.value) > -1 || weekdays.item.indexOf(weekday.value) > -1}
              disabled={weekdays.selectable.indexOf(weekday.value) === -1}
              label={weekday.label}
              labelStyle={{ fontSize: addUnit(16) }}
              style={{ paddingTop: addUnit(16) , paddingBottom: addUnit(16) }}
              onChange={(val)=>{
                handelSelectWeekday(val,weekday.value);
              }}
            />
          );
        })}
      </Popup>
    </View>
  );
};

export default ServiceTime;
