import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { shopApi } from "@/api/co_admin";
import Field from "@/components/field";
import Button from "@/components/button";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const AttrEdit: FC = () => {

  const _params: any = getCurrentInstance().router?.params;
  const _title = Object.keys(_params).length > 0 ? "编辑属性项" : "新增属性项";
  const _id = getCurrentInstance().router?.params?.id;
  const init = {
    id: 0,
    name: "",
    multi: 1,
    necessary: 1,
    list: [{
      sub_id: 1000,
      name: "",
      price: ""
    }]
  };
  const attrsValueInit = {
    sub_id: 0,
    name: "",
    price: ""
  };
  const [form, setForm] = useState(init);
  useEffect(() => {
    setForm(init);
    if (Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      let _form = Object.assign({}, init, JSON.parse(_params?.form || {}));
      if (!!_form.list && _form.list.length > 0) {
        _form.list.map(item => {
          if (!!item.price) {
            item.price = (item.price / 100).toFixed(2);
          }
        });
      }
      setForm(_form);
    }
  }, []);

  const handleChange = (val, ref) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  const saveAttr = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if(!_form.name){
      Taro.showToast({ title: "属性项名称不能为空", icon: "none" });
      return;
    }
    if(_form.list.length === 0){
      Taro.showToast({ title: "属性项列表不能为空", icon: "none" });
      return;
    }else{
      for(let i = 0; i < _form.list.length; i++){
        const item = _form.list[i];
        if(!item.name){
          Taro.showToast({ title: `属性值${_form.list.length > 1 ? i + 1 : ""}不能为空`, icon: "none" });
          return;
        }
        if(!item.price){
          Taro.showToast({ title: `金额${_form.list.length > 1 ? i + 1 : ""}不能为空`, icon: "none" });
          return;
        }else{
          _form.list[i].price = +item.price * 100;
        }
      }
    }

    // console.log(_form,"_form");
    const action = !!_id ? "edit" : "add";
    shopApi.attrs[action](_form).then(res => {
      console.log(res,"res");
      if (res.code === 0) {
        eventCenterTrigger("shopAttr");
        navigateTo({ method:"navigateBack" });
      }
    });
  };

  const removeAttr = () => {
    Taro.showModal({
      title: "删除此属性项？",
      content: "删除后，买家加购商品时将无法选择该属性",
      cancelText: "我再想想",
      confirmText: "确定删除",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          shopApi.attrs.delete({ id: Number(_id) }).then(res => {
            if (res.code === 0) {
              eventCenterTrigger("shopAttr");
              navigateTo({ method:"navigateBack" });
            }
          });
        }
      }
    });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            required
            border={false}
            title="属性项名称"
            maxlength={4}
            showWordLimit
            value={form.name}
            placeholder="1-4个字符"
            onChange={(val) => {
              handleChange(val, "name");
            }}
          />
        </View>
        <View className="card">
          <Cell
            border={false}
            title="属性值多选"
            content={
              <Switch
                checked={form.multi === 2}
                activeValue={2}
                inactiveValue={1}
                onChange={(value) => {
                  handleChange(value, "multi");
                }}
              />
            }
          />
        </View>
        <View className="card-tips">该属性支持选择多个属性值，比如对一杯奶茶添加布丁，珍珠等多种配料。</View>
        <View className="card">
          <Cell
            border={false}
            title="属性值必选"
            content={
              <Switch
                checked={form.necessary === 2}
                activeValue={2}
                inactiveValue={1}
                onChange={(value) => {
                  handleChange(value, "necessary");
                }}
              />
            }
          />
        </View>
        <View className="card-tips">启用后，该属性为用户下单必选内容。</View>
        <Cell
          border={false}
          title="属性值列表"
          textStyle={{ fontWeight: "bold" }}
          content={
            <View className="plus plus--border" style={{ width: addUnit(16), height: addUnit(16), borderColor: "#ff2340", borderWidth: addUnit(1) }}>
              <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
              <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#ff2340", top: "50%", marginTop: addUnit(-4) }} />
            </View>
          }
          extra="新增属性值"
          extraStyle={{ color: "#ff2340", fontSize: addUnit(14), marginLeft: addUnit(5) }}
          onClick={() => {
            setForm(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              let init = attrsValueInit;
              init.sub_id = (temp.list[temp.list.length - 1]?.sub_id || 0) + 1;
              temp.list.push(init);
              return temp;
            });
          }}
        />
        {form.list.length > 0 ? form.list.map((item: any, idx) => {
          return (
            <View className="card" key={idx}>
              <Field
                border={false}
                required
                title={`属性值${form.list.length > 1 ? idx + 1 : ""}`}
                titleWidth={90}
                titleAlign="left"
                value={item.name}
                placeholder="请输入属性值"
                onChange={(val) => {
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.list[idx].name = val;
                    return temp;
                  });
                }}
                right={
                  <View
                    className="plus plus--border"
                    style={{
                      width: addUnit(20),
                      height: addUnit(20),
                      borderColor: "#666",
                      borderWidth: addUnit(1),
                      opacity: form.list.length === 1 ? 0 : 1
                    }}
                  >
                    <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#666", left: "50%", marginLeft: addUnit(-4) }} />
                  </View>
                }
                rightStyle={{ marginLeft: addUnit(12) }}
                onRight={() => {
                  if (form.list.length === 1) return;
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.list.splice(idx, 1);
                    return temp;
                  });
                }}
              />
              <Field
                required
                title={`金额${form.list.length > 1 ? idx + 1 : ""}`}
                titleWidth={90}
                titleAlign="left"
                type="number"
                value={item.price}
                placeholder="加价金额"
                onChange={(val) => {
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.list[idx].price = val;
                    return temp;
                  });
                }}
                right="元"
              />
            </View>
          );
        }) : null}
      </ScrollView>
      <BottomBar>
        {Object.keys(_params).length > 0 ? (
          <React.Fragment>
            <Button
              style={{ marginRight: addUnit(12) }}
              hairline
              type="primary"
              onClick={removeAttr}
            >
              删除
            </Button>
          </React.Fragment>
        ) : null}
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={saveAttr}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default AttrEdit;
