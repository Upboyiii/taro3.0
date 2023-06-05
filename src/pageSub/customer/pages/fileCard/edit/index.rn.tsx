import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { profileApi } from "@/api/co_admin";
import { pluginApi } from "@/api/base";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Switch from "@/components/switch";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ProfileEdit: FC = () => {
  const _id:any = getCurrentInstance().router?.params?.id;
  const _title = !!_id ? "编辑档案卡" : "新建档案卡";

  const statciWordTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码","地图","单选项","多选项","省市区"];
  const init = {
    id: 0,
    is_co_order: true, // 是否在企业服务中使用及关联顾客档案卡
    is_open: true, // 档案记录数据是否对顾客开放
    is_record: true, // 是否对档案开启档案数据记录
    max_num: "", // 顾客同档案最大可建立数量
    min_num: "", // 顾客同档案最少需建立数量
    name: "", // 档案卡名称
    notes: "", // 档案卡说明
    profile: [], // 关联的企业顾客资料项目
    scene: [], // 关联场景(触发场景时是否如果没有数据是否需要填写)
    sms_id: null, // 短信模板ID 空为不发送短信（其他发送模式走固定发送模块）
    sms_map: {} // 顾客信息字段与短信模板字段映射关系绑定
  };
  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);
  const getDetail = (id) => {
    setLoading(true);
    profileApi.card.info({ id })
      .then(res => {
        if (!!res && res.code === 0) {
          let _form = Object.assign({}, init, res?.data || {});
          if (_form.profile && _form.profile.length > 0) {
            _form.profile.forEach(item => {
              if (item.data_type === 10 || item.data_type === 11) {
                item.default = item.default.split(",");
              }
            });
          }
          getScenes(_form?.scene);
          // console.log(_form,"_form");
          setForm(_form);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
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

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: _title });
    setForm(init);
    if (!!_id) {
      getDetail(parseInt(_id));
    }else{
      getScenes();
    }
    getSmsTemplates();
  }, []);

  const [sceneList, setSceneList] = useState<any[]>([]);
  const getScenes = (scene:any = null) => {
    if (sceneList.length === 0) {
      setLoading(true);
      profileApi.profile.getScene().then(res => {
        if (!!res && res.code === 0) {
          const _list = res?.data?.list || [];
          _list.forEach(item => {
            if(!!scene && scene.length > 0){
              let row = scene.find(ite => item.id === ite.id);
              if (row) {
                item.checked = true;
                item.required = !!row?.required;
              }
            }else{
              item.checked = false;
              item.required = false;
            }
          });
          // console.log(_list,"_list");
          setSceneList(_list);
        }
      }).finally(()=>{
        setLoading(false);
      });
    }
  };
  const handleScenesChange = (val, ref, index) =>{
    setSceneList(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[index][ref] = val;
      return temp;
    });
  };

  const [smsList, setSmsList] = useState<any[]>([]);
  const getSmsTemplates = ()=> {
    if (smsList.length === 0) {
      pluginApi.plugin("post",282,"getTemplateList", JSON.stringify({ template_type: 1, tags_id: "6459b0a906b5784bc544beed" }))
        .then(res => {
          if (!!res && res.code === 0) {
            setSmsList(res?.data || []);
          }
        });
    }
  };

  useEffect(() => {
    eventCenterOn("fileCardWord", (res) => {
      if(!!res[0]){
        setForm(prevState => {
          let temp = JSON.parse(JSON.stringify(prevState));
          if(res[0]?.type === "delete"){
            temp.profile.splice(res[0]?.index,1);
          }else if(res[0]?.index === -1){
            temp.profile.push(res[0]?.item);
          }else{
            temp.profile[res[0]?.index] = res[0]?.item;
          }
          return temp;
        });
      }
    });
    eventCenterOn("fileCardSMS", (res) => {
      if(!!res[0]){
        console.log(res[0],"fileCardSMS");
        setForm(prevState => {
          let temp = JSON.parse(JSON.stringify(prevState));
          temp.sms_id = res[0].id;
          temp.sms_map = res[0].map;
          return temp;
        });
      }
    });
    return () => {
      eventCenterOff("fileCardWord");
      eventCenterOff("fileCardSMS");
    };
  }, []);
  const handleProfile = (index = -1, item = null) => {
    navigateTo({ url: "/pages/customer/fileCard/word/index", method:"navigateTo", params: { form: item, index: index } });
  };
  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if (!_form.name) {
      Taro.showToast({ title: "档案卡名称不能为空", icon: "none" });
      return false;
    }
    if (!_form.min_num) {
      Taro.showToast({ title: "最少需建立数量不能为空", icon: "none" });
      return false;
    }else{
      _form.min_num = parseInt(_form.min_num);
    }
    if (!_form.max_num) {
      Taro.showToast({ title: "最多可建立数量不能为空", icon: "none" });
      return false;
    }else{
      _form.max_num = parseInt(_form.max_num);
      if (_form.max_num > 20) {
        Taro.showToast({ title: "最多数量不能超过20", icon: "none" });
        return false;
      }
    }
    if (_form.min_num > _form.max_num) {
      Taro.showToast({ title: "最少数量不能大于最多数量", icon: "none" });
      return false;
    }
    if (_form.profile.length === 0) {
      Taro.showToast({ title: "请至少添加一条档案资料项", icon: "none" });
      return false;
    }else{
      _form.profile.forEach(item => {
        if (item.data_type === 10 || item.data_type === 11) {
          item.default = item.default.join(",");
        } else {
          delete item.default;
        }
      });
    }

    let _scenes:any = [];
    sceneList.forEach(item => {
      if (item.checked) {
        _scenes.push({ id: item.id, label: item.label, required: item.required });
      }
    });
    _form.scene = _scenes;

    console.log(_form,"_form");

    setLoading(true);
    const action = !!_form.id ? "edit" : "add";
    profileApi.card[action](_form)
      .then(res => {
        console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("fileCardEdit");
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
  const deleteClick = () => {
    Taro.showModal({
      title: "提示",
      content: "确定删除吗？",
      cancelText: "我再想想",
      confirmText: "确定删除",
      confirmColor: "#ff2340",
      success: function (res) {
        if (res.confirm) {
          setLoading(true);
          profileApi.card.del({ id: form.id })
            .then(res => {
              if (!!res && res.code === 0) {
                eventCenterTrigger("fileCardEdit" );
                navigateTo({ method: "navigateBack" });
              }else{
                Taro.showToast({ title: res?.message || "删除失败", icon: "error" });
              }
            }).catch(res=>{
            Taro.showToast({ title: res?.message || "删除失败", icon: "error" });
          })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <KeyboardAwareScrollView extraScrollHeight={40}>
      <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
        <View className="card" style={{ marginTop: addUnit(12) }}>
          <Field
            required
            title="档案卡名称"
            titleWidth={90}
            placeholder="请输入档案卡名称"
            value={form.name}
            onChange={(val)=>{handleValueChange(val,"name");}}
          />
          <Field
            required
            title="最少数量"
            titleWidth={90}
            type="digit"
            placeholder="请输入最少需建立数量"
            value={form.min_num}
            onChange={(val)=>{handleValueChange(val,"min_num");}}
          />
          <Field
            required
            title="最多数量"
            titleWidth={90}
            type="digit"
            placeholder="请输入最多可建立数量，最大20"
            value={form.max_num}
            onChange={(val)=>{handleValueChange(val,"max_num");}}
          />
        </View>
        <View className="card-tips">同一用户建立档案卡，最少需建立数量，最多可建立数量。</View>
        <Cell
          border={false}
          style={{ marginLeft: addUnit(12), marginRight: addUnit(12), paddingTop: addUnit(6), paddingBottom: addUnit(8) }}
          title="档案资料项"
          textStyle={{ fontWeight: "bold" }}
          content={
            <View className="plus plus--border" style={{ width: addUnit(16), height: addUnit(16), borderColor: "#ff2340", borderWidth: addUnit(1) }}>
              <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
              <View className="plus-item plus-item--h" style={{ height: addUnit(8), backgroundColor: "#ff2340", top: "50%", marginTop: addUnit(-4) }} />
            </View>
          }
          extra="添加资料项"
          extraStyle={{ color: "#ff2340", fontSize: addUnit(14), marginLeft: addUnit(5) }}
          onClick={()=>{
            handleProfile();
          }}
        />
        <View className="card">
          {!!form.profile && form.profile.length > 0 ? (
            <React.Fragment>
              {form.profile.map((item, index)=>{
                return (
                  <React.Fragment key={`scene${index}`}>
                    <Cell
                      border={index !== 0}
                      title={item.name}
                      label={!!item.default && item.default.length > 0 ? `${item.data_type === 10 ? "单" : "多"}选项值：${item.default.join(";")}` : null}
                      content={item.required ? <Tag type="warning" plain={false}>必填</Tag> : null}
                      extraStyle={{ marginLeft: addUnit(8), marginRight: addUnit(6) }}
                      extra={<Tag type="info" plain={false}>{statciWordTypeList[item.data_type - 1]}</Tag>}
                      arrow
                      onClick={()=>{
                        handleProfile(index, item);
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ) : (
            <Cell title="暂无档案资料项"
              textStyle={{ color: "#999" }}
              extra="去设置"
              arrow
              onClick={()=>{
                handleProfile();
              }}
            />
          )}
        </View>
        <View className="card-title">关联场景</View>
        <View className="card">
          {sceneList.map((item, index)=>{
            return (
              <React.Fragment key={`scene${index}`}>
                <Cell
                  border={index !== 0}
                  title={item.name}
                  content={
                    <Switch
                      checked={item.checked}
                      onChange={(val)=>{
                        handleScenesChange(val, "checked", index);
                      }}
                    />
                  }
                />
                {item.checked ? (
                  <Cell
                    title="在该场景中资料项必填"
                    content={
                      <Switch
                        checked={item.required}
                        onChange={(val)=>{
                          handleScenesChange(val, "required", index);
                        }}
                      />
                    }
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
        <View className="card">
          <Cell
            border={false}
            title="对档案开启档案数据记录"
            content={
              <Switch
                checked={form.is_record}
                onChange={(val)=>{
                  handleValueChange(val, "is_record");
                }}
              />
            }
          />
          <Cell
            title="档案记录数据对顾客开放"
            content={
              <Switch
                checked={form.is_open}
                onChange={(val)=>{
                  handleValueChange(val, "is_open");
                }}
              />
            }
          />
          <Cell
            title="在企业服务中使用及关联顾客档案卡"
            content={
              <Switch
                checked={form.is_co_order}
                onChange={(val)=>{
                  handleValueChange(val, "is_co_order");
                }}
              />
            }
          />
        </View>
        <View className="card-tips">用户触发场景时是否如果没有数据是否需要填写</View>
        <View className="card">
          <Cell
            border={false}
            title="短信模板"
            extra={!!form.sms_id ? "已设置" : "未设置"}
            arrow
            onClick={()=>{
              if(form.profile.length === 0){
                Taro.showToast({ title: "请先至少设置一条档案资料项", icon: "none" });
                return;
              }
              navigateTo({ url: "/pages/customer/fileCard/sms/index", method:"navigateTo", params: { id: form.sms_id, map: form.sms_map, words: form.profile } });
            }}
          />
        </View>
        <View className="card">
          <Field
            border={false}
            title="档案卡说明"
            titleWidth={90}
            type="textarea"
            placeholder="请输入档案卡说明"
            value={form.notes}
            onChange={(val)=>{handleValueChange(val,"notes");}}
          />
        </View>
      </ScrollView>
      </KeyboardAwareScrollView>
      <BottomBar>
        {!!form?.id  ? (
          <Button
            hairline
            loading={loading}
            type="warning"
            style={{ marginRight: addUnit(12) }}
            onClick={deleteClick}
          >
            删除
          </Button>
        ) : null}
        <Button
          loading={loading}
          style={{ width: "70%" }}
          type="info"
          onClick={saveClick}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default ProfileEdit;
