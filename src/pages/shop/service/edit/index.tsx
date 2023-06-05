import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Text } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { shopApi } from "@/api/co_admin";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatPrice } from "@/utils/common";
import storeConfig from "@/locales/storeConfig";
import Field from "@/components/field";
import Button from "@/components/button";
import Popup from "@/components/popup";
import Checkbox from "@/components/checkbox";
import ImagePicker from "@/components/image-picker";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ServiceEdit: FC = () => {
  const _id = getCurrentInstance().router?.params?.id;
  const _title = _id ? "编辑企业服务" : "新增企业服务";

  useEffect(()=>{
    if(_id){
      Taro.setNavigationBarTitle({ title: _title });
      getDetail(parseInt(_id));
    }

    // 获取系统服务列表
    getServiceObj();
    eventCenterOn("serviceEdit",(res)=>{
      const msg = res[0];
      switch (msg.type) {
        case "business":// 服务时间
          setServiceForm(prv=>{
           let obj = JSON.parse(JSON.stringify(prv));
            obj.business_type = msg.data.business_type;
            obj.business_time = msg.data.business_time;
            return obj;
          });
          break;
        case "rule_sku":// 服务项目
          setServiceForm(prv=>{
            let obj = JSON.parse(JSON.stringify(prv));
            obj.rule_sku = msg.data;
            return obj;
          });
          break;
        case "word":// 服务信息
          setServiceForm(prv=>{
            let obj = JSON.parse(JSON.stringify(prv));
            obj.word = msg.data;
            return obj;
          });
          break;
        default:
          break;
      }
    });
    return () => {
      eventCenterOff("serviceEdit");
    };
  },[]);

  const serviceFormInit = {
    label: "",
    rule_sku: [],
    word: [],
    business_type: 1,
    business_time: [],
    logo: "",
    name: "",
    title: "",
    notes: "",
    notice: "",
    pic: [],
    state: 1,
    consent: false
  };
  const [serviceForm, setServiceForm] = useState(serviceFormInit);
  const [loading, setLoading] = useState(false);
  const getDetail = (id)=>{
    setLoading(true);
    shopApi.service.info({ id }).then(res=>{
      if(res.code === 0){
        let _form = Object.assign({}, serviceFormInit, res?.data || {});

        let pics:any = [];
        if(_form.logo) pics.push(_form.logo);
        if(_form.pic) pics = [...pics,..._form.pic];
        if(pics.length > 0) setPics(pics);

        if (!!_form.word && _form.word.length > 0) {
          _form.word.forEach(item => {
            if (!item.max_repeat || item.max_repeat < 0) {
              item.max_repeat = 0;
            }
            if (!item.min_repeat || item.min_repeat < 0) {
              item.min_repeat = 0;
            }
          });
        }
        setServiceForm(_form);
      }
    }).finally(()=>{
      setLoading(false);
    });
  };
  const getServiceObj = ()=>{
    shopApi.service.list().then(res=>{
      if(res.code === 0){
        if(res?.data){
          setServiceLabel(()=>{
            return { ...res.data };
          });
        }
      }
    });
  };

  // 服务标签
  const _serviceLabel = { notes: {}, plugin_id: {} };
  const [serviceLabel, setServiceLabel] = useState<any>(_serviceLabel);
  const [serviceLabelShow, setServiceLabelShow] = useState(false);

  const [pics, setPics] = useState<any[]>([]);
  const handleChangeImage = (val) => {
    setPics(val);
  };

  const handleChange = (val, type) =>{
    setServiceForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[type] = val;
      return temp;
    });
  };

  const saveServeice = (state = 1) => {
    let _form = JSON.parse(JSON.stringify(serviceForm));

    if(!_form.name){
      Taro.showToast({ title: "企业服务名称不能为空", icon: "none" });
      return;
    }


    _form.state = state;
    if(pics.length > 0){
      let list = JSON.parse(JSON.stringify(pics));
      _form.logo = list[0];
      if(list.length > 1){
        list.shift();
        _form.pic = list;
      }
    }
    setLoading(true);
    shopApi.service[_form.id ? "edit" : "add"](_form).then(res=>{
      // console.log(res,"res");
      if(!!res && res.code === 0){
        eventCenterTrigger("shopService");
        navigateTo({ method:"navigateBack" });
      }
    }).finally(()=>{
      setLoading(false);
    });
  };

  const deleteClick = () => {
    if (_id) {
      Taro.showModal({
        title: "提示？",
        content: "删除此服务？",
        cancelText: "我再想想",
        confirmText: "确定删除",
        confirmColor: "#ff2340",
        success: function (res) {
          if (res.confirm) {
            shopApi.service.delete({ id: Number(_id) }).then(res => {
              if (res.code === 0) {
                eventCenterTrigger("shopService");
                navigateTo({ method:"navigateBack" });
              }
            });
          }
        }
      });
    }
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            border={false}
            title={`展示图片(${pics.length}/12)`}
            titleRow
            align="start"
            input={false}
            introPosition="bottom"
            intro="图片的第一张将作为服务图标，最多上传12张"
          >
            <ImagePicker
              refs="serviceFormPics"
              files={pics}
              maxCount={12}
              rowCount={4}
              preview
              addText="图片"
              onChange={handleChangeImage}
              style={{ marginBottom: addUnit(6) }}
            />
          </Field>
          <Field
            required
            title="服务名称"
            maxlength={10}
            showWordLimit
            value={serviceForm.name}
            placeholder="不超过10个字符"
            onChange={(val)=>{
              handleChange(val,"name");
            }}
          />
          <Field
            title="服务描述"
            type="textarea"
            maxlength={100}
            value={serviceForm.title}
            placeholder="服务描述"
            onChange={(val)=>{
              handleChange(val,"title");
            }}
          />
        </View>
        <View className="card">
          <Field
            border={false}
            title="服务时间"
            input={false}
            arrow
            clickable
            value={storeConfig.businessTypes[serviceForm.business_type]}
            onClick={()=>{
              navigateTo({
                method: "navigateTo",
                url: "/pages/shop/service/time/index",
                params: {
                  business_type: serviceForm.business_type,
                  business_time: serviceForm.business_time
                }
              });
            }}
          />
          {!!serviceLabel && !!serviceLabel.plugin_id && Object.keys(serviceLabel.plugin_id).length > 0 ? (
            <React.Fragment>
              <Field
                title="服务标签"
                input={false}
                arrow
                clickable
                value={serviceForm.label ? serviceLabel.plugin_id[serviceForm.label].notes : "自定义"}
                onClick={()=>{
                  let tempPlugin:any = [{ label: "", notes: "自定义" }];
                  for(const key in serviceLabel.plugin_id){
                    let item = serviceLabel.plugin_id[key];
                    item.label = key;
                    tempPlugin.push(item);
                  }
                  Taro.showActionSheet({
                    itemList: tempPlugin.map(item=>item.notes),
                    success: function (res) {
                      const _label = tempPlugin[res.tapIndex].label;
                      handleChange(_label,"label");

                      if (_label) {
                        let obj = serviceLabel.plugin_id[_label];
                        if (Object.keys(obj.words).length > 0) {
                          let arrs:any = [];
                          for (let a in obj.words) {
                            arrs.push({ ...obj.words[a], label: a });
                          }
                          handleChange(arrs,"word");
                        }
                      }else{
                        handleChange([],"word");
                      }
                    }
                  });
                }}
              />
            </React.Fragment>
          ) : null}
          {!!serviceLabel && !!serviceLabel.notes && !serviceForm.label ? (
            <Field
              title="消息接收"
              input={false}
              arrow
              clickable
              // @ts-ignore
              value={serviceForm.notice ? serviceLabel.notes[serviceForm.notice] : "无"}
              onClick={()=>{
                setServiceLabelShow(true);
              }}
            />
          ) : null}
          {!serviceForm.label ? (
            <Field
              title="服务项目"
              input={false}
              arrow
              clickable
              placeholder="请添加服务项目"
              inputStyle={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap"
              }}
              value={
                !!serviceForm.rule_sku && serviceForm.rule_sku.length > 0 ? serviceForm.rule_sku.map((item:any, index)=>{
                  return (
                    <View key={`fwxm-${index}`} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: addUnit(14), lineHeight: addUnit(20) }}>
                        {item.name}
                      </Text>
                      {item.price ? (
                        <Text style={{ fontSize: addUnit(14) }}>
                          {`(¥${formatPrice(item.price)})`}
                        </Text>
                      ) : null}
                      <Text style={{ fontSize: addUnit(14), color: "#666" }}>；</Text>
                    </View>
                  );
                }) : null
              }
              onClick={()=>{
                navigateTo({ url:"/pages/shop/service/rule/index",method:"navigateTo" ,params:{ rule_sku: serviceForm.rule_sku } });
              }}
            />
          ) : null}
        </View>
        {!serviceForm.label ? (
          <React.Fragment>
            <View className="card">
              <Field
                border={false}
                title="服务信息"
                input={false}
                arrow
                clickable
                inputStyle={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}
                value={
                  !!serviceForm.word && serviceForm.word.length > 0 ? serviceForm.word.map((item:any, index)=>{
                    return (
                      <React.Fragment key={`fwxm-${index}`}>
                        <Text style={{ fontSize: addUnit(14), lineHeight: addUnit(20) }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: addUnit(14), color: "#666" }}>；</Text>
                      </React.Fragment>
                    );
                  }) : null
                }
                placeholder="无"
                onClick={()=>{
                  navigateTo({ method:"navigateTo",url:"/pages/shop/service/info/index",params:{ word: serviceForm.word } });
                }}
              />
            </View>
            <View className="card-tips">购买服务时让买家输入服务需要的相关信息，可设置 10 条。</View>
          </React.Fragment>
        ) : null}

        <View className="card">
          <Cell
            border={false}
            title="自动受理"
            content={
              <Switch
                checked={serviceForm.consent}
                onChange={(value)=>{
                  handleChange(value, "consent");
                }}
              />
            }
          />
        </View>
        <View className="card-tips">服务订单是否自动变更为处理中关闭后需要客服受理服务。</View>
      </ScrollView>
      <BottomBar>
        {_id ? (
          <React.Fragment>
            <Button
              style={{ marginRight: addUnit(12) }}
              hairline
              type="primary"
              loading={loading}
              onClick={deleteClick}
            >
              删除
            </Button>
            {serviceForm.state === 1 ? (
              <Button
                hairline
                type="warning"
                loading={loading}
                style={{ marginRight: addUnit(12) }}
                onClick={()=>{saveServeice(2);}}
              >
                停用
              </Button>
            ) : serviceForm.state === 2 ? (
              <Button
                type="warning"
                loading={loading}
                style={{ marginRight: addUnit(12) }}
                onClick={()=>{saveServeice(1);}}
              >
                启用
              </Button>
            ) : null}
          </React.Fragment>
        ) : null}
        <Button
          style={_id ? { flex:1 } : { width: "70%" }}
          type="info"
          loading={loading}
          onClick={()=>{saveServeice();}}
        >
          保存
        </Button>
      </BottomBar>
      <Popup
        bgColor="#f7f8f8"
        show={serviceLabelShow}
        title="服务消息接收"
        onClose={()=>{
          setServiceLabelShow(false);
        }}
        action={
          <Button
            style={{ width: "70%" }}
            type="info"
            onClick={()=>{
              setServiceLabelShow(false);
            }}
          >
            确定
          </Button>
        }
      >
        <View className="card">
          {!!serviceLabel && !!serviceLabel.notes && Object.keys(serviceLabel.notes).length > 0 ? (
            <React.Fragment>
              {Object.keys(serviceLabel.notes).map((label, index) => {
                return (
                  <Checkbox
                    key={`serviceLabel-${index}`}
                    cell
                    border={index !== 0}
                    label={serviceLabel.notes[label]}
                    labelStyle={{ fontSize: addUnit(16) }}
                    // @ts-ignore
                    value={label}
                    // @ts-ignore
                    checked={serviceForm.notice === label}
                    style={{ paddingTop: addUnit(16), paddingBottom: addUnit(16) }}
                    onChange={(val) => {
                      setServiceForm(prevState => {
                        let temp = JSON.parse(JSON.stringify(prevState));
                        temp.notice = val ? label : "";
                        return temp;
                      });
                    }}
                  />
                );
              })}
            </React.Fragment>
          ) : null}
        </View>
      </Popup>
    </View>
  );
};

export default ServiceEdit;
