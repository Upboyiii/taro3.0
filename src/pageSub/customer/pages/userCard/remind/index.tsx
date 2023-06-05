// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { customerApi } from "@/api/co_admin";
import { secToDate } from "@/utils/common";
import Field from "@/components/field";
import Button from "@/components/button";
import Tabs from "@/components/tabs";
import "./index.scss";

const ProfileEdit: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _customer_id = getCurrentInstance().router?.params?.customer_id;
  const _profile_name = getCurrentInstance().router?.params?.profile_name;

  const tabs = [
    { label: "指定内容提醒", value: 1 },
    { label: "档案卡提醒", value: 2 }
  ];
  const init:any = {
    aid: 0, // 提醒关联id 如档案卡ID
    customer_id: 0, // 客户ID
    // id: 0, // ID
    note: "", // 提醒内容
    remind_at_date: "", // 提醒时间 2006-01-02 15:04:05
    remind_at_time: "", // 提醒时间 2006-01-02 15:04:05
    type: 1 // 提醒类型 1固定内容 2档案卡提醒
  };
  const [form, setForm] = useState<any>(init);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(false);
  const handleValueChange = (val, ref) =>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  useEffect(() => {
    if(!!_id){
      setForm(prevState => {
        let temp = JSON.parse(JSON.stringify(prevState));
        temp.aid = Number(_id);
        temp.customer_id = Number(_customer_id);
        return temp;
      });
      setProfileName(_profile_name || "");
    }
  }, []);

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if(!_form.remind_at_date){
      Taro.showToast({ title:"请选择提醒日期", icon: "none" });
      return;
    }
    if(!_form.remind_at_time){
      Taro.showToast({ title:"请选择提醒时间", icon: "none" });
      return;
    }
    _form.remind_at_time = _form.remind_at_date + " " + _form.remind_at_time;
    delete _form.remind_at_date;

    if(!_form.note){
      Taro.showToast({ title:"提醒内容不能为空", icon: "none" });
      return;
    }

    // console.log(_form,"_form");

    setLoading(true);
    customerApi.remind.add(_form)
      .then(res => {
        console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("userCardEdit");
          navigateTo({ method:"navigateBack" });
        }else{
          Taro.showToast({ title: res.message, icon: "none" });
        }
      }).catch(res=>{
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(()=>{
      setLoading(false);
    });
  };

  return (
  <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
    <Tabs
      border
      bgColor="#fff"
      active={form.type}
      options={tabs}
      onChange={(val)=>{
        handleValueChange(val,"type");
      }}
    />
      <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Picker
            mode="date"
            value={form.remind_at_date}
            start={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
            onChange={(e) => {
              const date = e.detail.value.replace(/\//g, "-");
              handleValueChange(date,"remind_at_date");
            }}
          >
            <Field
              border={false}
              required
              titleWidth={90}
              title="提醒日期"
              input={false}
              value={form.remind_at_date}
              placeholder="请选择提醒日期"
              arrow
            />
          </Picker>
          <Picker
            mode="time"
            value={form.remind_at_time}
            start={secToDate(new Date().getTime(),"{h}-{m}")}
            onChange={(e) => {
              const time = e.detail.value + ":00";
              handleValueChange(time,"remind_at_time");
            }}
          >
            <Field
              required
              title="提醒时间"
              titleWidth={90}
              input={false}
              value={form.remind_at_time}
              placeholder="请选择提醒时间"
              arrow
            />
          </Picker>
        </View>
        {form.type === 2 ? (
          <View className="card">
            <Field
              border={false}
              title="档案卡"
              titleWidth={90}
              input={false}
              value={profileName}
            />
          </View>
        ) : null}
        <View className="card">
          <Field
            border={false}
            required
            title="提醒内容"
            titleRow
            type="textarea"
            value={form.note}
            placeholder="请输入提醒内容"
            onChange={(val)=>{
              handleValueChange(val,"note");
            }}
          />
        </View>
        <View className="bottom-bar">
          <Button
            loading={loading}
            style={{ width: "70%" }}
            type="info"
            onClick={saveClick}
          >
            确定
          </Button>
        </View>
      </ScrollView>
  </View>
  );
};

export default ProfileEdit;
