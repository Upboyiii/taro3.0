// @ts-ignore
import React, { FC, useState } from "react";
import Taro, { useLoad, useRouter } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatPrice } from "@/utils/common";
import Field from "@/components/field";
import Button from "@/components/button";
import ImagePicker from "@/components/image-picker";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ServiceRule: FC = () => {

  const init = {
    name: "",
    cover: "",
    max_num: 1,
    sku_id: null,
    price: null
  };

  const route = useRouter();
  useLoad(()=>{
    if(route.params?.type === "edit"){
      Taro.setNavigationBarTitle({ title: "编辑服务项目" });
      setServiceRuleForm(()=>{
        // @ts-ignore
        let obj = JSON.parse(route.params?.item);
        obj = Object.assign({}, init, obj);
        if(obj.price){
          obj.price = formatPrice(obj.price);
        }
        return obj;
      });
    }else{
      Taro.setNavigationBarTitle({ title: "新增服务项目" });
    }
  });

  const [err, setErr] = useState("");
  const [serviceRuleForm, setServiceRuleForm] = useState<any>(init);
  const handleChange = (val, ref) => {
    setServiceRuleForm(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      if(ref === "name"){
        setErr(!val ? "项目名称不能为空" : "");
      }
      temp[ref] = val;
      return temp;
    });
  };

  const handleChangeImage = (val) => {
    setServiceRuleForm(prv=>{
      let temp = JSON.parse(JSON.stringify(prv));
      if(val && val.length > 0){
        temp.cover = val[0];
      }else {
        temp.cover = "";
      }
      return temp;
    });
  };

  const saveServiceRule = () => {
    let _form = JSON.parse(JSON.stringify(serviceRuleForm));
    if(!_form.name){
      setErr("项目名称不能为空");
      return;
    }else{
      setErr("");
    }
    if(_form.price){
      _form.price = parseFloat(_form.price) * 100;
    }
    if(_form.max_num){
      _form.max_num = parseInt(_form.max_num);
    }
    if(route.params?.type === "edit" && route.params?.index){
      eventCenterTrigger("serviceRuleEdit",{ type:"edit", index: parseInt(route.params?.index), item: _form });
    }else {
      eventCenterTrigger("serviceRuleEdit",{ type:"add", item: _form });
    }
    navigateTo({ method:"navigateBack" });
  };

  const removeServiceRule = () => {
    // @ts-ignore
    eventCenterTrigger("serviceRuleEdit",{ type:"delete",index: parseInt(route.params?.index) });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View style={scrollViewStyle()}>
        <View className="card" style={{ marginTop: addUnit(12), marginBottom: addUnit(16) }}>
          <Field title="项目封面" titleWidth={90} input={false}>
            <ImagePicker
              // @ts-ignore
              files={serviceRuleForm.cover ? [serviceRuleForm.cover] : ""}
              maxCount={1}
              rowCount={3}
              preview
              addText="图片"
              onChange={handleChangeImage}
            />
          </Field>
          <Field
            required
            title="项目名称"
            titleWidth={90}
            placeholder="请输入项目名称"
            value={serviceRuleForm.name}
            errorIcon={false}
            error={!!err}
            errorMessage={err}
            onChange={(val)=>{handleChange(val,"name");}}
          />
          <Field
            type="number"
            title="服务单价"
            titleWidth={90}
            placeholder="请输入服务单价"
            value={serviceRuleForm.price}
            onChange={(val)=>{handleChange(val,"price");}}
            right="元"
          />
        </View>
        <View className="card">
          <Field
            border={false}
            type="digit"
            title="每单最多购买"
            titleWidth={90}
            placeholder="请输入每单最多可购买的数量"
            value={serviceRuleForm.max_num}
            onChange={(val)=>{handleChange(val,"max_num");}}
            right="件"
          />
        </View>
      </View>
      <BottomBar>
        {route.params?.type === "edit" ? (
          <Button
            style={{ marginRight: addUnit(12) }}
            hairline
            type="primary"
            onClick={removeServiceRule}
          >
            删除
          </Button>
        ) : null}
        <Button
          style={{ width: "70%" }}
          type="primary"
          onClick={saveServiceRule}
        >
          确定
        </Button>
      </BottomBar>
    </View>
  );
};

export default ServiceRule;
