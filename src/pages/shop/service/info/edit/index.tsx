// @ts-ignore
import React, { FC, useState } from "react";
import Taro, { useLoad, useRouter } from "@tarojs/taro";
import { View, Picker } from "@tarojs/components";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { addUnit, scrollViewStyle } from "@/components/utils";
import Field from "@/components/field";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ServiceInfo: FC = () => {

  const serviceInfoTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码", "地图位置"];
  const init = {
    type: 1,
    label: "",
    name: "", //  用户留言字段名称
    describe: "", //  服务描述
    min_repeat: 0, // 填写至少次数
    max_repeat: 1 // 填写最大次数
  };

  const route = useRouter();
  useLoad(()=>{
    if(route.params?.type === "edit"){
      Taro.setNavigationBarTitle({ title: "编辑服务信息" });
      setServiceInfoForm(()=>{
        // @ts-ignore
        let obj = JSON.parse(route.params?.item);
        obj = Object.assign({}, init, obj);
        return obj;
      });
    }else{
      Taro.setNavigationBarTitle({ title: "添加服务信息" });
    }
  });

  const [err, setErr] = useState("");
  const [serviceInfoForm, setServiceInfoForm] = useState<any>(init);
  const handleChange = (val, ref) => {
    setServiceInfoForm(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(ref === "name"){
        setErr(!val ? "项目名称不能为空" : "");
      }
      temp[ref] = val;
      return temp;
    });
  };

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(serviceInfoForm));
    if(!_form.name){
      setErr("项目名称不能为空");
      return;
    }else{
      setErr("");
    }
    if(_form.min_repeat){
      _form.min_repeat = parseInt(_form.min_repeat);
    }
    if(_form.max_repeat){
      _form.max_repeat = parseInt(_form.max_repeat);
    }
    if(route.params?.type === "edit" && route.params?.index){
      eventCenterTrigger("serviceWordEdit",{ type:"edit", index: parseInt(route.params?.index), item: _form });
    }else {
      eventCenterTrigger("serviceWordEdit",{ type:"add", item: _form });
    }
    navigateTo({ method:"navigateBack" });
  };

  const removeClick = () => {
    // @ts-ignore
    eventCenterTrigger("serviceWordEdit",{ type:"delete",index: parseInt(route.params?.index) });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View style={scrollViewStyle()}>
        <View className="card" style={{ marginTop: addUnit(12), marginBottom: addUnit(16) }}>
          <Picker
            mode="selector"
            range={serviceInfoTypeList}
            onChange={(e)=>{
              handleChange(+e.detail.value + 1, "type");
            }}
          >
            <Field
              border={false}
              input={false}
              title="信息格式"
              value={serviceInfoTypeList[serviceInfoForm.type - 1]}
              arrow
            />
          </Picker>
          <Field
            title="信息标题"
            placeholder="不超过6个字"
            maxlength={6}
            value={serviceInfoForm.name}
            errorIcon={false}
            error={!!err}
            errorMessage={err}
            onChange={(val)=>{handleChange(val,"name");}}
          />
          <Field
            title="信息描述"
            placeholder="信息描述"
            value={serviceInfoForm.describe}
            onChange={(val)=>{handleChange(val,"describe");}}
          />
        </View>
        <View className="card">
          <Field
            border={false}
            type="idcard"
            title="填写次数"
            placeholder="输入填写次数"
            value={serviceInfoForm.max_repeat}
            onChange={(val)=>{handleChange(val,"max_repeat");}}
          />
          <Field
            type="idcard"
            title="必填次数"
            placeholder="输入必填次数"
            value={serviceInfoForm.min_repeat}
            onChange={(val)=>{handleChange(val,"min_repeat");}}
          />
        </View>
        <View className="card-tips">必填次数0时用户非必填，大于0则表示同内容必填的次数，必填次数不能大于填写次数。</View>
      </View>
      <BottomBar>

        {route.params?.type === "edit" ? (
          <Button
            style={{ marginRight: addUnit(12) }}
            hairline
            type="primary"
            onClick={removeClick}
          >
            删除
          </Button>
        ) : null}
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

export default ServiceInfo;
