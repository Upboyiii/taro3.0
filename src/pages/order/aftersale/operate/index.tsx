import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { ScrollView, Text, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { orderApi , settingApi } from "@/api/co_admin";
import { cityData } from "@/components/city-select/cityDate";
import Field from "@/components/field";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Radio from "@/components/radio";
import Empty from "@/components/empty";
import ImagePicker from "@/components/image-picker";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const OrderExpress: FC = () => {

  const _params = getCurrentInstance().router?.params || {};

  const init = {
    id: "",  // 售后ID
    type: 0, // 操作类型 1添加凭证 2拒绝申请 3同意申请 4完成退款
    address_id: 0, // 退货企业地址库 ID (6 售后类型 2退货退款 3换货 4维修)
    msg: "", // 备注消息
    pics: [], // 凭证图片 (1 2 需要)
    state: 0
  };
  const [form, setForm] = useState<any>(init);
  const handleValueChange = (val, ref) => {
    setForm((prevState)=>{
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[ref] = val;
      return temp;
    });
  };

  useEffect(()=>{
    if(Object.keys(_params).length > 0){
      Taro.setNavigationBarTitle({ title: _params.title || "售后操作" });
      setForm(()=>{
        let temp = Object.assign({}, init);
        temp.id = _params?.id || "";
        temp.type = parseInt(_params.type || "0");
        temp.state = parseInt(_params.state || "0");
        return temp;
      });
      if(_params.type === "3"){
        Taro.setNavigationBarTitle({ title: _params.title || "选择退货地址" });
        getAddressList();
      }
    }
  },[]);

  const [err, setErr] = useState(false);
  const [addressList, setAddressList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const getAddressList = () => {
    if (addressList.length === 0) {
      setLoading(true);
      settingApi.address.page({ page: 1, page_size: 999, type: 1 })
        .then(res => {
          if (!!res && res.code === 0) {
            if(res?.data?.list && res?.data?.list.length > 0){
              let _list = res?.data?.list || [];
              setAddressList(_list);
              handleValueChange(_list[0].id,"address_id");
            }
          }else {
            setErr(true);
          }
        })
        .catch(() => {
          setErr(true);
        })
        .finally(()=>{
        setLoading(false);
      });
    } else {
      handleValueChange(addressList[0].id,"address_id");
    }
  };
  const renderAddress = (county_id) => {
    let adr = "";
    let Level = 0;
    for (let i = 0; i < cityData.length; i++) {
      const item = cityData[i];
      if (!item.children) {
        continue;
      }
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j];
        if (child.id === county_id) {
          Level = 1;
          adr = item.label + "" + child.label;
        }
        if (!child.children) {
          continue;
        }
        for (let k = 0; k < child.children.length; k++) {
          const grandchild = child.children[k];
          if (grandchild.id === county_id) {
            Level = 2;
            adr = item.label + "" + child.label + "" + grandchild.label;
          }
        }
      }
    }
    return Level === 1 ? adr : (Level === 2 ? adr : "");
  };

  const saveClick = () => {
    let verify = false;
    let obj: any = {
      type: form.type,
      id: form.id
    };
    if(form.type === 1 || form.type === 2){
      obj.pics = form.pics;
      obj.msg = form.msg;
      verify = true;
    }
    if(form.type === 3){
      if(!form.address_id){
        Taro.showToast({ title: "请选择退货地址", icon: "none" });
        return false;
      }
      obj.address_id = form.address_id;
      verify = true;
    }

    if(verify){
      orderApi.saleOrder
        .operate(obj)
        .then(res => {
          if (!(!!res && res.code === 0)) {
            Taro.showToast({ title: res?.message || "操作失败", icon: "error" });
          }
        })
        .catch(res => {
          Taro.showToast({ title: res?.message || "操作失败", icon: "error" });
        })
        .finally(()=>{
          setTimeout(()=>{
            eventCenterTrigger("operateAfterSale");
            eventCenterTrigger("afterSale");
            navigateTo({ method:"navigateBack" });
          },500);
        });
    }

    console.log(obj, "obj");
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          {form.type === 1 || form.type === 2 ? (
            <React.Fragment>
              <Field
                border={false}
                title="凭证图片"
                titleRow
                align="start"
                input={false}
                introPosition="bottom"
              >
                <ImagePicker
                  refs="afterSalePics"
                  files={form.pics}
                  maxCount={12}
                  rowCount={4}
                  preview
                  addText="图片"
                  onChange={(val)=>{
                    handleValueChange(val,"pics");
                  }}
                />
              </Field>
              <Field
                title={form.type === 2 ? "拒绝理由" : "备注消息"}
                value={form.msg}
                placeholder={`请输入${form.type === 2 ? "拒绝理由" : "备注消息"}`}
                onChange={(val)=>{
                  handleValueChange(val,"msg");
                }}
              />
            </React.Fragment>
          ) : null}
        </View>
        {form.type === 3 ? (
          <React.Fragment>
            {loading ? (
              <React.Fragment>
                {Array(8)
                  .fill("")
                  .map((_, i) => {
                    return (
                      <Skeleton
                        key={i}
                        card
                        image
                        imageShape="round"
                        imageSize={40}
                        title
                        row={1}
                      />
                    );
                  })}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {!err ? (
                  <React.Fragment>
                    {addressList.length > 0 ? (
                      <React.Fragment>
                        {addressList.map((item: any, index) => {
                          if (item)
                            return (
                              <View className="card" key={`address-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                                <Radio
                                  border={false}
                                  cell
                                  labelPosition="right"
                                  label={
                                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                      <Text style={{ color: "#333", fontSize: 17, fontWeight: "bold" }}>{item.name}</Text>
                                      <Text style={{ color: "#666", fontSize: 14 }}> - {item.phone}</Text>
                                    </View>
                                  }
                                  desc={`${renderAddress(item.county_id)} ${item.address}`}
                                  descStyle={{ color: "#666", fontSize: 14, marginTop: 6 }}
                                  checked={form.address_id === item.id}
                                  onClick={() => {
                                    handleValueChange(item.id,"address_id");
                                  }}
                                />
                              </View>
                            );
                        })}
                      </React.Fragment>
                    ) : (
                      <Empty desc="暂无相关地址" image="address" />
                    )}
                  </React.Fragment>
                ) : (
                  <Empty desc="加载错误，请返回重试" image="error" />
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        ) : null}
      </ScrollView>
      <BottomBar>
        <Button
          type="default"
          plain
          style={{ flex: 1, marginRight: addUnit(12) }}
          onClick={()=>{
            navigateTo({ method:"navigateBack" });
          }}
        >
          返回
        </Button>
        <Button
          type="primary"
          style={{ flex: 1 }}
          onClick={saveClick}
        >
          确定
        </Button>
      </BottomBar>
    </View>
  );
};

export default OrderExpress;
