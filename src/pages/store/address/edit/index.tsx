// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { cityData } from "@/components/city-select/cityDate";
import { settingApi } from "@/api/co_admin";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import CitySelect from "@/components/city-select";
import Field from "@/components/field";
import Button from "@/components/button";
import Switch from "@/components/switch";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

let Level = 0;
const AddressEdit: FC = () => {
  // const tabsActive = getCurrentInstance().router?.params.tabsActive
  const id = getCurrentInstance().router?.params.id;
  const title = id ? "修改地址" : "新增地址";
  const [cityShow, setCityShow] = useState(false);
  const init = {
    name: "",
    phone: "",
    address: "",
    county_id: "",
    link: [
      { type: 1, default: 1, checked: false },
      { type: 2, default: 1, checked: false },
      { type: 3, default: 1, checked: false }
    ]
  };
  const [form, setForm] = useState(init);
  const [countyLabel, setCountyLabel] = useState("");
  // @ts-ignore
  const [selectID, setSelectID] = useState();
  useEffect(() => {
    Taro.setNavigationBarTitle({ title });
    if (id) {
      getAddressInfo();
    }
  }, []);

  // 修改地址
  const getAddressInfo = () => {
    settingApi.address.get({ id: Number(id) }).then(res => {
      if (res.code === 0) {
        let _form = Object.assign({}, init, res?.data || {});
        _form.link = [
          { type: 1, default: 1, checked: false },
          { type: 2, default: 1, checked: false },
          { type: 3, default: 1, checked: false }
        ];
        _form.link = _form.link.map(item => {
          let newItem: any = null;
          if (item.type === 1) {
            newItem = res.data.link.find(bItem => bItem.type === 1);
          } else if (item.type === 2) {
            newItem = res.data.link.find(bItem => bItem.type === 2);
          } else if (item.type === 3) {
            newItem = res.data.link.find(bItem => bItem.type === 3);
          }
          if (newItem) {
            newItem.checked = true;
            return newItem;
          } else {
            return item;
          }
        });

        const b = res.data.county_id;
        let adr = "";
        // 先循环最后一层的children中判断id与b是否相同，相同的话返回这数据每级的id和label,没有就向上循环id与b是否相同，知道找出id与b相同的数据
        for (let i = 0; i < cityData.length; i++) {
          const item = cityData[i];
          if (!item.children) {
            continue;
          }
          for (let j = 0; j < item.children.length; j++) {
            const child = item.children[j];
            if (child.id === b) {
              Level = 1;
              adr = item.label + "/" + child.label;
            }
            if (!child.children) {
              continue;
            }
            for (let k = 0; k < child.children.length; k++) {
              const grandchild = child.children[k];
              if (grandchild.id === b) {
                Level = 2;
                adr = item.label + "/" + child.label + "/" + grandchild.label;
              }
            }
          }
        }
        const adress = Level === 1 ? adr : (Level === 2 ? adr : "");
        setCountyLabel(adress);
        setSelectID(res.data?.county_id || 0);
        console.log("_form", _form)
        setForm(_form);
      }
    });
  };

  const handleChange = (val, ref) => {
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
    verifyForm(false, val, ref);
  };

  const citySelectConfirm = (data) => {
    let city: string = "",
      county_id = 0;
    if (Array.isArray(data) && data.length > 0) {
      county_id = Number(data.slice(-1)[0].id);
      data.map((item, index) => {
        if (index !== 0) city += "/";
        city += item.label;
      });
    }
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.county_id = county_id;
      setCountyLabel(city);
      return temp;
    });
    verifyForm(false, String(county_id), "county_id");
  };

  const [formErr, setFormErr] = useState({
    name: "",
    phone: "",
    county_id: "",
    address: ""
  });
  const verifyForm = (callback = false, val = "", ref = "") => {
    let verify = true;
    setFormErr(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let err = {
        name: "请输入联系人",
        phone: "请输入手机号码",
        county_id: "请选择所在地区",
        address: "请输入详情地址"
      };
      if (!!ref) {
        temp[ref] = !val ? err[ref] : "";
      } else {
        const phoneReg = /^1[3456789]\d{9}$/;
        temp.name = form.name === "" ? err.name : "";
        temp.phone = !phoneReg.test(form.phone) ? "请输入正确的手机号码" : "";
        temp.county_id = form.county_id === "" ? err.county_id : "";
        temp.address = form.address === "" ? err.address : "";
        verify = !(!!temp.phone || !!temp.name || !!temp.county_id || !!temp.address);
      }
      return temp;
    });
    if (callback) {
      return verify;
    }
  };

  // 保存地址
  const saveAddress = () => {
    const verify = verifyForm(true);
    if (!verify) return;

    const _formLink = form.link.filter(item => item.checked);
    const _link = _formLink.map(obj => {
      let { checked, ...rest } = obj;  // 使用解构赋值删除checked属性
      return rest;
    });
    const _form = {
      id: !!id ? Number(id) : 0,
      name: form.name,
      phone: form.phone,
      address: form.address,
      county_id: form.county_id,
      link: _link
    };
    const action = !!id ? "edit" : "add";
    settingApi.address[action](_form)
      .then(resp => {
        if (resp.code === 0) {
          eventCenterTrigger("addressEdit");
          navigateTo({ method: "navigateBack" });
        } else {
          Taro.showToast({ title: resp.message, icon: "none" });
        }
      });
  };

  // 删除地址
  const removeAddress = () => {
    Taro.showModal({
      title: "提示",
      content: "删除此地址？",
      confirmText: "删除",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          settingApi.address.delete({ id: Number(id) }).then(res => {
            if (res.code === 0) {
              eventCenterTrigger("addressEdit");
              navigateTo({ method: "navigateBack" });
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
            title="联系人"
            placeholder="请输入联系人姓名"
            value={form.name}
            error={!!formErr.name}
            errorMessage={formErr.name}
            onChange={(val) => { handleChange(val, "name"); }}
          />
          <Field
            required
            type="tel"
            title="手机号码"
            placeholder="请输入手机号码"
            value={form.phone}
            error={!!formErr.phone}
            errorMessage={formErr.phone}
            onChange={(val) => { handleChange(val, "phone"); }}
          />
        </View>
        <View className="card">
          <Field
            required
            border={false}
            title="所在地区"
            input={false}
            arrow
            clickable
            placeholder="请选择省/市/区"
            value={countyLabel}
            error={!!formErr.county_id}
            errorMessage={formErr.county_id}
            onClick={() => {
              setCityShow(true);
            }}
          />
          <Field
            required
            type="textarea"
            title="详细地址"
            placeholder="请填写详细地址，如街道名称，门牌号等信息"
            value={form.address}
            error={!!formErr.address}
            errorMessage={formErr.address}
            onChange={(val) => { handleChange(val, "address"); }}
          />
        </View>
        <View className="card">
          <Field
            border={false}
            title="设为退货地址"
            titleWidth={120}
            align="center"
            inputAlign="right"
            inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
            input={false}
          >
            <Switch
              checked={form.link[0].checked}
              onChange={(value) => {
                setForm(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.link[0].checked = value;
                  return temp;
                });
              }}
            />
          </Field>
          {form.link[0].checked ? (
            <Field
              title="设为默认退货地址"
              titleWidth={120}
              align="center"
              inputAlign="right"
              inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
              input={false}
            >
              <Switch
                activeValue={2}
                inactiveValue={1}
                checked={form.link[0].default === 2}
                onChange={(value) => {
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.link[0].default = value;
                    return temp;
                  });
                }}
              />
            </Field>
          ) : null}
        </View>
        <View className="card">
          <Field
            border={false}
            title="设为发票地址"
            titleWidth={120}
            align="center"
            inputAlign="right"
            inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
            input={false}
          >
            <Switch
              checked={form?.link[1].checked}
              onChange={(value) => {
                setForm(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.link[1].checked = value;
                  return temp;
                });
              }}
            />
          </Field>
          {!!form?.link[1]?.checked ? (
            <Field
              title="设为默认发票地址"
              titleWidth={120}
              align="center"
              inputAlign="right"
              inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
              input={false}
            >
              <Switch
                activeValue={2}
                inactiveValue={1}
                checked={form.link[1].default === 2}
                onChange={(value) => {
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.link[1].default = value;
                    return temp;
                  });
                }}
              />
            </Field>
          ) : null}
        </View>
        <View className="card">
          <Field
            border={false}
            title="设为发货地址"
            titleWidth={120}
            align="center"
            inputAlign="right"
            inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
            input={false}
          >
            <Switch
              checked={form?.link[2].checked}
              onChange={(value) => {
                setForm(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp.link[2].checked = value;
                  return temp;
                });
              }}
            />
          </Field>
          {!!form?.link[2]?.checked ? (
            <Field
              title="设为默认发货地址"
              titleWidth={120}
              align="center"
              inputAlign="right"
              inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
              input={false}
            >
              <Switch
                activeValue={2}
                inactiveValue={1}
                checked={form.link[2].default === 2}
                onChange={(value) => {
                  setForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.link[2].default = value;
                    return temp;
                  });
                }}
              />
            </Field>
          ) : null}
        </View>
      </ScrollView>
      <BottomBar>
        {id ? (
          <Button
            style={{ marginRight: addUnit(12) }}
            hairline
            type="primary"
            onClick={removeAddress}
          >
            删除
          </Button>
        ) : null}
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={saveAddress}
        >
          保存
        </Button>
      </BottomBar>
      <CitySelect
        value={Number(form.county_id)}
        show={cityShow}
        onCancel={() => {
          setCityShow(false);
        }}
        onConfirm={citySelectConfirm}
      />
    </View>
  );
};

export default AddressEdit;
