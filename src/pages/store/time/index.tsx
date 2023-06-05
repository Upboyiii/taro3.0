import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { settingApi } from "@/api/co_admin";
import { secondToTime, timeToSecond, week2ZH } from "@/utils/common";
import store from "@/store";
import Button from "@/components/button";
import Checkbox from "@/components/checkbox";
import Popup from "@/components/popup";
import Radio from "@/components/radio";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const BusinessHours: FC = () => {

  const storeID = store?.getState()?.storeInfo?.store_id;

  const init = {
    proofing: 1, // 运营状态 1正常 2打样
    business_type: 1, // 营业时间 1全天 2每天重复 3每周重复
    business_time: [
      {
        time_sections: [{ open_time: "08:00", close_time: "18:00" }], // 开始时间 从0点开始的秒数 一天86400秒
        weekdays: [] // 业星期 1~7
      }
    ]
  };
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(init);
  const getStoreInfo = () => {
    if(!!storeID){
      setLoading(true);
      settingApi.store.get({ id: storeID })
        .then(res => {
          let _data = Object.assign({}, init, res?.data?.store_data || {});
          if(!!_data.business_time && _data.business_time.length > 0){
            let _weekdays:any = [];
            _data.business_time.forEach(item=>{
              if(!!item.time_sections && item.time_sections.length > 0){
                item.time_sections = item.time_sections.map(item=>{
                  return {
                    open_time: secondToTime(item.open_time),
                    close_time: secondToTime(item.close_time)
                  };
                });
              }
              if(!!item.weekdays && item.weekdays.length > 0 ){
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
          setForm({
            proofing: _data.proofing,
            business_type: _data.business_type,
            business_time: _data.business_time
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  useEffect(() => {
    getStoreInfo();
  }, []);

  const handleValueChange = (val, ref) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  const handleBusinessType = (val)=>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.business_type = val;
      if(val === 2){
        temp.business_time = [
          {
            time_sections: [{ open_time: "08:00", close_time: "18:00" }],
            weekdays: [1,2,3,4,5,6,7]
          }
        ];
      }else if(val === 3){
        temp.business_time = [
          {
            time_sections: [{ open_time: "08:00", close_time: "18:00" }],
            weekdays: [1,2,3,4,5]
          },
          {
            time_sections: [{ open_time: "06:00", close_time: "22:00" }],
            weekdays: [6,7]
          }
        ];
      }
      return temp;
    });
  };
  const handleTimeAdd = (index) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let idx = temp.business_time[index].time_sections.length - 1;
      if(idx >= 0){
        let lastItem = temp.business_time[index].time_sections[idx];
        let timeItem = {
          open_time: lastItem.close_time,
          close_time: "23:59"
        };
        temp.business_time[index].time_sections.push(timeItem);
      }else{
        temp.business_time[index].time_sections = [{ open_time: "08:00", close_time: "18:00" }];
      }
      return temp;
    });
  };
  const handleTimeRemove = (idx, index) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.business_time[index].time_sections.splice(idx,1);
      return temp;
    });
  };
  const handleTimeChange = (e, idx , name, index) => {
    const time = e.detail.value;
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(temp.business_time && temp.business_time.length > 0){
        temp.business_time[index].time_sections[idx][name] = time;
        return temp;
      }
    });
  };

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
    setForm(prevState => {
      let tempTime = JSON.parse(JSON.stringify(prevState));
      if(tempTime.business_time && tempTime.business_time.length > 0){
        let _weekdays = JSON.parse(JSON.stringify(tempTime.business_time[index].weekdays));
        setWeekdays(prevState => {
          let temWeek = JSON.parse(JSON.stringify(prevState));
          _weekdays.map(day=>{
            if(temWeek.selected.indexOf(day) > -1){
              temWeek.selected.splice(temWeek.selected.indexOf(day),1);
            }
          });
          return temWeek;
        });
        tempTime.business_time.splice(index,1);
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
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(weekdays.index > -1){
        temp.business_time[weekdays.index].weekdays = weekdays.item;
      }else{
        temp.business_time.push({
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

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if(_form.proofing === 2){
      _form = {
        proofing: 2,
        business_type: 1,
        business_time: []
      };
    }else{
      if(_form.business_type === 1){
        _form.business_time = [];
      }else{
        if(_form?.business_time.length === 0){
          Taro.showToast({ title: `请设置${_form.business_type === 3 ? "营业周期" : "每天重复时间"}`, icon:"none" });
          return;
        }
        for(let j = 0; j < _form?.business_time.length; j++){
          let _time_sections = _form?.business_time[j].time_sections;
          let _weekdays = _form?.business_time[j].weekdays;
          if(_time_sections.length === 0){
            const tips = _form.business_type === 3 ? `请设置${week2ZH(_weekdays)}的重复时间` : "请设置每天重复时间";
            Taro.showToast({ title: tips, icon:"none" });
            return;
          }else{
            for(let i = 0; i < _time_sections.length; i++){
              let item = _time_sections[i];
              const tips = _form.business_type === 3 ? `${week2ZH(_weekdays)}${i + 1}` : `每天重复${i + 1}`;
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
    }

    const _store_data = {
      store_data: _form
    };
    // console.log(_store_data.store_data,"store_data");

    setLoading(true);
    settingApi.store
      .businessSave(_store_data)
      .then((res) => {
        // console.log(res,"resaaa");
        if(!!res && res.code === 0){
          Taro.showToast({ title: "设置成功", icon: "success" });
          setTimeout(()=>{
            getStoreInfo();
          },600);
        }else{
          Taro.showToast({ title: res?.message || "设置失败", icon: "error" });
        }
      })
      .catch((res)=>{
        Taro.showToast({ title: res?.message || "设置失败", icon: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card-title">营业状态</View>
        <View className="card" style={{ padding: addUnit(12), display: "flex", flexDirection: "row" }}>
          <Button
            shape="square"
            size="large"
            type={form.proofing === 1 ? "success" : "default"}
            style={{ flex: 1, marginRight: addUnit(12) }}
            onClick={()=>{
              handleValueChange(1, "proofing");
            }}
          >
            正常营业
          </Button>
          <Button
            shape="square"
            size="large"
            type={form.proofing === 2 ? "warning" : "default"}
            style={{ flex: 1 }}
            onClick={()=>{
              handleValueChange(2, "proofing");
            }}
          >
            店铺打烊
          </Button>
        </View>
        <View className="card-tips" style={{ color: "#ff2340" }}>
          设置打烊后，买家将无法在店内消费，请谨慎操作。
        </View>
        {form.proofing === 1 ? (
          <React.Fragment>
            <View className="card-title">营业时间</View>
            <View className="card">
              <Radio
                border={false}
                cell
                type="dot"
                label="全天"
                labelPosition="right"
                checked={form.business_type === 1}
                value={1}
                onChange={(val)=>{handleBusinessType(val);}}
              />
              <Radio
                cell
                type="dot"
                label="每天重复"
                labelPosition="right"
                checked={form.business_type === 2}
                value={2}
                onChange={(val)=>{handleBusinessType(val);}}
              />
              <Radio
                cell
                type="dot"
                label="每周重复"
                labelPosition="right"
                checked={form.business_type === 3}
                value={3}
                onChange={(val)=>{handleBusinessType(val);}}
              />
            </View>
            {form.business_type === 2 ? (
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
                  {form.business_time[0] && form.business_time[0].time_sections.map((item:any, idx)=>{
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
                              opacity: form.business_time[0].time_sections.length > 1 ? 1 : 0.3
                            }}
                            onClick={()=>{
                              if(form.business_time[0].time_sections.length === 1) return;
                              handleTimeRemove(idx,0);
                            }}
                          >
                            <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#666", left: "50%", marginLeft: addUnit(-4) }} />
                          </View>
                        }
                        rightStyle={{ marginLeft: addUnit(24) }}
                        onRight={()=>{
                          if(form.business_time[0].time_sections.length === 1) return;
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
            {form.business_type === 3 ? (
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
                {form.business_time.map((weekday, index)=>{
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
                              disabled={form.business_time.length < 2}
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
          </React.Fragment>
        ) : null}
      </ScrollView>
      <BottomBar>
        <Button
          loading={loading}
          style={{ width: "70%" }}
          type="info"
          onClick={saveClick}
        >
          设置
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

export default BusinessHours;
