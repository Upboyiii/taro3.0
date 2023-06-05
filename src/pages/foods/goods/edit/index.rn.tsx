import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatPrice } from "@/utils/common";
import { pluginApi } from "@/api/base";
import Field from "@/components/field";
import Button from "@/components/button";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import ImagePicker from "@/components/image-picker";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const FoodsGoodsEdit: FC = () => {
  console.log(getCurrentInstance().router?.params,"_params");
  const _params: any = getCurrentInstance().router?.params?.form;
  const _title = !!_params && Object.keys(_params).length > 0 ? "修改附加商品" : "添加附加商品";

  const init = {
    id: 0,
    name: "",
    is_nums: false,
    // type: 3, //1、餐具 2、纸巾 3、自定义
    mark: "",
    cover: "",
    unit: "",
    price: "",
    state: 1,
    is_must: false
  };
  const [form, setForm] = useState(init);
  useEffect(() => {
    if (!!_params && Object.keys(_params).length > 0) {
      Taro.setNavigationBarTitle({ title: _title });
      let _form = Object.assign({}, init, JSON.parse(_params));
      _form.price = formatPrice(_form.price);
      let pics: any = [];
      if (!!_form.cover) pics.push(_form.cover);
      if (pics.length > 0) {
        setPics(() => {
          return pics;
        });
      }
      setForm(_form);
    }
  }, []);

  const [pics, setPics] = useState<any[]>([]);
  const handleChangeImage = (val) => {
    setPics(val);
  };

  const handleChange = (val, type) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[type] = val;
      return temp;
    });
  };

  const handleSave = (state = 1) => {
    let _form = JSON.parse(JSON.stringify(form));
    _form.state = state;
    let obj = {
      name: _form.name,
      is_nums: _form.is_nums,
      mark: _form.mark,
      cover: pics[0],
      unit: _form.unit,
      price: Number(_form.price) * 100,
      state: _form.state,
      is_must: _form.is_must,
      id: _form?.id
    };

    pluginApi.plugin("PUT", 312, "saveShop", JSON.stringify(obj)).then(res => {
      console.log(res,"res");
      if (res.code === 0) {
        eventCenterTrigger("foodsGoods");
        navigateTo({ method:"navigateBack" });
      } else {
        Taro.showToast({ title: res.message, icon: "none" });
      }
    });
  };

  const updateStatus = (state) => {
    if (state === -1) {
      Taro.showModal({
        title: "禁用此商品？",
        content: "禁用后，买家加购商品时将无法选择该商品",
        cancelText: "我再想想",
        confirmText: "确定禁用",
        confirmColor: "#ff2340",
        success: function () {
          handleSave(state);
        }
      });
    } else {
      handleSave(state);
    }
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <KeyboardAwareScrollView extraScrollHeight={40}>
        <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
          <View className="card" style={{ marginTop: addUnit(12) }}>
            <Field
              border={false}
              title="图片"
              align="start"
              input={false}
            >
              <ImagePicker
                refs="formPics"
                files={pics}
                maxCount={1}
                rowCount={3}
                preview
                addText="图片"
                onChange={handleChangeImage}
              />
            </Field>
            <Field
              required
              title="名称"
              value={form.name}
              placeholder="请输入商品名称"
              onChange={(val) => {
                handleChange(val, "name");
              }}
            />
            <Field
              required
              title="单价"
              type="number"
              value={form.price}
              placeholder="请输入商品单价金额"
              right="元"
              onChange={(val) => {
                handleChange(val, "price");
              }}
            />
            <Field
              required
              title="商品单位"
              value={form.unit}
              placeholder="例：份，即份/人"
              onChange={(val) => {
                handleChange(val, "unit");
              }}
            />
            <Cell
              title="按用餐人数计算"
              content={
                <Switch
                  checked={form.is_nums}
                  onChange={(val) => {
                    handleChange(val, "is_nums");
                  }}
                />
              }
            />
          </View>
          <View className="card-tips">价格将按照下单用餐人数乘单价计算</View>
          <View className="card">
            <Cell
              border={false}
              title="是否必选"
              content={
                <Switch
                  checked={form.is_must}
                  onChange={(val) => {
                    handleChange(val, "is_must");
                  }}
                />
              }
            />
            <Field
              title="描述"
              type="textarea"
              value={form.mark}
              placeholder="请输入商品描述"
              onChange={(val) => {
                handleChange(val, "mark");
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
      <BottomBar>
        {!!form.id ? (
          <React.Fragment>
            {form.state === 1 ? (
              <Button
                style={{ marginRight: addUnit(12) }}
                hairline
                type="primary"
                onClick={() => {
                  updateStatus(-1);
                }}
              >
                禁用
              </Button>
            ) : (
              <Button
                style={{ marginRight: addUnit(12) }}
                type="primary"
                onClick={() => {
                  updateStatus(1);
                }}
              >
                启用
              </Button>
            )}
          </React.Fragment>
        ) : null}
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            handleSave();
          }}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default FoodsGoodsEdit;
