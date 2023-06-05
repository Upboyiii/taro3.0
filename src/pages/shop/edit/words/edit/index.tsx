import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Switch from "@/components/switch";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";
import { eventCenterTrigger, navigateTo } from "@/utils/library";

const WordsEdit: FC = () => {
  const _params: any = getCurrentInstance().router?.params;
  const statciWordTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码"];
  const init = {
    id: 0,
    name: "", //  用户留言字段名称
    type: 1, // 用户留言字段对应的值 1文本 2数字 3邮件 4日期 5时间 6身份证 7图片 8手机号
    is_multi_row: false, //  是否多行 文本模式存在
    is_required: false, // 是否必填
    is_single: false // 是 (只需要用户填1次) 否 (根据购买数量填写,买N张门票需要填写N个身份证)
  };
  const [index, setIndex] = useState(-1);
  const [type, setType] = useState("");
  const [goodsType, setGoodsType] = useState(1);
  const [form, setForm] = useState<any>(init);
  useEffect(()=>{
    if(!!_params && Object.keys(_params).length > 0){
      const _index = parseInt(_params?.index || "-1");
      const _goodsType = parseInt(_params?.goodsType || "1");
      const _type = _params?.type;
      const _title = _type === "edit" ? "编辑留言信息" : "添加留言信息";
      const _item = Object.assign({}, init, JSON.parse(_params?.item));
      if(_index === -1 && _goodsType === 6) _item.type = 6;
      setIndex(_index);
      setGoodsType(_goodsType);
      setType(_type);
      setForm(_item);
      Taro.setNavigationBarTitle({ title: _title });
    }
  },[]);

  const handleChange = (val, ref) => {
    setForm(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      temp[ref] = val;
      return temp;
    });
  };

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if(!_form.name){
      Taro.showToast({ title: "留言标题不能为空", icon: "none" });
      return;
    }
    if(_form.type !== 1){
      _form.is_multi_row = false;
    }
    eventCenterTrigger("shopWordEdit",{ type: type, index: index, item: _form });
    navigateTo({ method:"navigateBack" });
  };

  const removeClick = () => {
    eventCenterTrigger("shopWordEdit",{ type:"delete", index: index });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View style={scrollViewStyle()}>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            border={false}
            required
            title="留言标题"
            titleWidth={90}
            placeholder="不超过5个字"
            maxlength={5}
            showWordLimit
            value={form.name}
            onChange={(val)=>{handleChange(val,"name");}}
          />
          {goodsType === 6 ? (
            <Cell
              title="留言格式"
              titleStyle={{ width: addUnit(90) }}
              contentAlign="left"
              content={form.type === 1 ? "姓名" : statciWordTypeList[form.type - 1]}
            />
          ) : (
            <Picker
              mode="selector"
              range={statciWordTypeList}
              onChange={(e)=>{
                handleChange(+e.detail.value + 1, "type");
              }}
            >
              <Cell
                title="留言格式"
                titleStyle={{ width: addUnit(90) }}
                contentAlign="left"
                content={statciWordTypeList[form.type - 1]}
                arrow
              />
            </Picker>
          )}
        </View>
        <View className="card">
          <Cell
            border={false}
            title="必填留言"
            content={
              <Switch
                checked={form.is_required}
                onChange={(value)=>{
                  handleChange(value, "is_required");
                }}
              />
            }
          />
        </View>
        <View className="card-tips">若开启，买家不输入留言则无法继续购买商品</View>
        {form.type === 1 ? (
          <React.Fragment>
            <View className="card">
              <Cell
                border={false}
                title="支持多行留言"
                content={
                  <Switch
                    checked={form.is_multi_row}
                    onChange={(value)=>{
                      handleChange(value, "is_multi_row");
                    }}
                  />
                }
              />
            </View>
            <View className="card-tips">若开启，留言输入框能输入多行内容</View>
          </React.Fragment>
        ) : null}
        <View className="card">
          <Cell
            border={false}
            title="多次填写留言"
            content={
              <Switch
                checked={form.is_single}
                onChange={(value)=>{
                  handleChange(value, "is_single");
                }}
              />
            }
          />
        </View>
        <View className="card-tips">若开启，留言将由商品购买的数量决定填写的次数</View>
      </View>
      <BottomBar>
        {type === "edit" && (!(goodsType === 6 && index < 2)) ? (
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

export default WordsEdit;
