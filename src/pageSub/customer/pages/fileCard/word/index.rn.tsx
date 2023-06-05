// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Picker, ScrollView } from "@tarojs/components";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getRandom } from "@/utils/common";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Switch from "@/components/switch";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const FileCardWord: FC = () => {
  const _params:any = getCurrentInstance().router?.params;
  const statciWordTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码","地图","单选项","多选项","省市区"];
  const init = {
    data_type: 1,
    default: [],
    name: "",
    label: getRandom(),
    required: false
  };

  const [index, setIndex] = useState(-1);
  const [form, setForm] = useState<any>(init);
  useEffect(()=>{
    setForm(init);
    if (Object.keys(_params).length > 0) {
      let _form = Object.assign({}, init, JSON.parse(_params?.form || "{}"));
      let _index = JSON.parse(_params?.index || "-1");
      Taro.setNavigationBarTitle({ title: _index !== -1 ? "编辑档案资料项" : "添加档案资料项" });
      setIndex(_index);
      // console.log(_form,"_form");
      setForm(_form);
    }
  },[]);

  const handleValueChange = (val, ref, index = -1) =>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(index !== -1){
        temp[ref][index] = val;
      }else{
        temp[ref] = val;
      }
      return temp;
    });
  };
  const handleDefault = (index) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(index === -1){
        temp.default.push("");
      }else{
        temp.default.splice(index,1);
      }
      return temp;
    });
  };

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if (!_form.name) {
      Taro.showToast({ title: "资料项名称不能为空", icon: "none" });
      return false;
    }
    if (_form.data_type === 10 || _form.data_type === 11) {
      if(!_form.default || _form.default.length === 0){
        const tips = `请设置至少一条${_form.data_type === 10 ? "单" : "多"}选项值`;
        Taro.showToast({ title: tips, icon: "none" });
        return false;
      }else{
        for(let i = 0;i < _form.default.length;i++){
          const item = _form.default[i];
          if(!item){
            Taro.showToast({ title: `选项值${i + 1}不能为空`, icon: "none" });
            return false;
          }
        }
      }
    } else {
      delete _form.default;
    }
    // console.log(_form,"_form");

    eventCenterTrigger("fileCardWord",{ type: "edit", item: _form, index: index });
    navigateTo({ method:"navigateBack" });
  };

  const removeClick = () => {
    eventCenterTrigger("fileCardWord",{ type: "delete", index: index });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <KeyboardAwareScrollView extraScrollHeight={40}>
      <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            required
            title="资料项名称"
            titleWidth={90}
            maxlength={6}
            showWordLimit
            placeholder="资料项名称"
            value={form.name}
            onChange={(val)=>{handleValueChange(val,"name");}}
          />
          <Picker
            mode="selector"
            range={statciWordTypeList}
            onChange={(e)=>{
              handleValueChange(+e.detail.value + 1, "data_type");
            }}
          >
            <Cell
              title="数据类型"
              textStyle={{ width: addUnit(90) }}
              contentAlign="left"
              content={statciWordTypeList[form.data_type - 1]}
              arrow
            />
          </Picker>
        </View>
        {form.data_type === 10 || form.data_type === 11 ? (
          <View className="card">
            <Cell
              border={false}
              title={`${form.data_type === 10 ? "单" : "多"}选项选值`}
              textStyle={{ fontWeight: "bold" }}
              content={
                <View className="plus plus--border" style={{ width: addUnit(16), height: addUnit(16), borderColor: "#ff2340", borderWidth: addUnit(1) }}>
                  <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
                  <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#ff2340", top: "50%", marginTop: addUnit(-4) }} />
                </View>
              }
              extra="添加选项值"
              extraStyle={{ color: "#ff2340", fontSize: addUnit(14), marginLeft: addUnit(5) }}
              onClick={()=>{handleDefault(-1);}}
            />
            {form.default.map((item, index)=>{
              return (
                <Field
                  key={`default-${index}`}
                  required
                  title={`选项值${index + 1}`}
                  titleWidth={90}
                  placeholder="请输入选项值"
                  value={item}
                  right={
                    <View
                      className="plus plus--border"
                      style={{
                        width: addUnit(20),
                        height: addUnit(20),
                        borderColor: "#666",
                        borderWidth: addUnit(1),
                        marginLeft: addUnit(10),
                        opacity: form.default.length > 1 ? 1 : 0.3
                      }}
                      onClick={()=>{
                        if(form.default.length === 1) return;
                        handleDefault(index);
                      }}
                    >
                      <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#666", left: "50%", marginLeft: addUnit(-4) }} />
                    </View>
                  }
                  onChange={(val)=>{handleValueChange(val,"default", index);}}
                />
              );
            })}
          </View>
        ) : null}
        <View className="card">
          <Cell
            title="资料项必填"
            content={
              <Switch
                checked={form.required}
                onChange={(val)=>{
                  handleValueChange(val, "required");
                }}
              />
            }
          />
        </View>
      </ScrollView>
      </KeyboardAwareScrollView>
      <BottomBar>
        {index !== -1 ? (
          <Button
            style={{ marginRight: addUnit(12) }}
            hairline
            type="warning"
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
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default FileCardWord;
