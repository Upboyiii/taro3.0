import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, View, ScrollView } from "@tarojs/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { profileApi } from "@/api/co_admin";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Switch from "@/components/switch";
import Popup from "@/components/popup";
import Empty from "@/components/empty";
import Skeleton from "@/components/skeleton";
import Radio from "@/components/radio";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ProfileEdit: FC = () => {
  const _id:any = getCurrentInstance().router?.params?.id;
  const _title = !!_id ? "编辑资料项" : "新增资料项";

  const statciWordTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码","地图","单选项","多选项","省市区"];
  const init = {
    data_type: 1, // 数据类型 1文本 2数字 3邮件 4日期 5时间 6身份证 7图片 8手机号 9地图 10单选项 11多选项 12省市区
    default: [], // 数据类型9 11 默认值  多值用,隔开
    name: "", // 资料项名称
    scene: [], // 关联场景
    sort: "", // 排序 -1置顶
    sys_profile_id: null, // 系统资料关联ID
    type: 2 //  1系统 2自定义
  };
  const [form, setForm] = useState<any>(init);
  const [loading, setLoading] = useState(false);
  const getDetail = (id) => {
    setLoading(true);
    profileApi.profile
      .info({ id })
      .then(res => {
        if (!!res && res.code === 0) {
          let _form = Object.assign({}, init, res?.data || {});
          if(_form.type === 1){
            getSysPage();
          }
          if (_form.type === 2) {
            if (_form.data_type === 10 || _form.data_type === 11) {
              _form.default = _form.default.split(",");
            }
          }
          _form.default = _form.default || [];
          _form.sort = _form?.sort || "";
          // console.log(_form,"_form");
          setForm(_form);
          getScenes(_form?.scene);
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

  const [sysLabel, setSysLabel] = useState("");
  const [sysShow, setSysShow] = useState(false);
  const [sysLoading, setSysLoading] = useState(false);
  const [sysList, setSysList] = useState<any[]>([]);
  const getSysPage = () => {
    if(sysList.length === 0){
      setSysLoading(true);
      profileApi.profile.getSysPage({ page: 1, page_size: 999 })
        .then(res=>{
          // console.log(res,"getSysPage");
          if (!!res && res.code === 0) {
            setSysList(res?.data?.list || []);
          }else{
            Taro.showToast({ title: res?.message || "系统字段资料项加载失败", icon: "error" });
          }
        })
        .catch(res=>{
          Taro.showToast({ title: res?.message || "系统字段资料项加载失败", icon: "error" });
        })
        .finally(()=>{
          setSysLoading(false);
        });
    }
  };
  useEffect(() => {
    const item = sysList.find(item=>item.id === form.sys_profile_id);
    setSysLabel(!!item ? (item?.name || "") : "");
  }, [form.sys_profile_id, sysList]);

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if(_form.type === 1){
      delete _form.default;
      delete _form.scene;
      if (!_form.sys_profile_id) {
        Taro.showToast({ title: "请选择系统字段资料项", icon: "none" });
        return false;
      }else{
        _form.name = sysLabel;
      }
    }
    if(_form.type === 2){
      delete _form.sys_profile_id;
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
          _form.default = _form.default.join(",");
        }
      } else {
        delete _form.default;
      }
      let _scenes:any = [];
      sceneList.forEach(item => {
        if (item.checked) {
          _scenes.push({ id: item.id, label: item.label, required: item.required });
        }
      });
      _form.scene = _scenes;
    }
    if (!_form.sort) {
      _form.sort = 0;
    }else{
      _form.sort = parseInt(_form.sort);
    }
    // console.log(_form,"_form");

    setLoading(true);
    const action = !!_form.id ? "edit" : "add";
    profileApi.profile[action](_form)
      .then(res => {
        console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("profileEdit");
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
          profileApi.profile.del({ id: form.id })
            .then(res => {
              if (!!res && res.code === 0) {
                eventCenterTrigger("profileEdit" );
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
              border={false}
              title="字段类型"
              titleWidth={90}
              input={false}
              value={form.type === 1 ? "系统字段" : "自定义字段"}
              arrow
              clickable
              onClick={() => {
                Taro.showActionSheet({
                  itemList: ["系统字段", "自定义字段"],
                  success: function (res) {
                    const index = res.tapIndex + 1;
                    handleValueChange(index, "type");
                    if(index === 1) getSysPage();
                  }
                });
              }}
            />
            {form.type === 1 ? (
              <Field
                required
                title="系统字段"
                titleWidth={90}
                placeholder="请选择系统字段资料项"
                input={false}
                value={sysLabel}
                arrow
                clickable
                onClick={()=>{setSysShow(true);}}
              />
            ) : null}
            {form.type === 2 ? (
              <React.Fragment>
                <Field
                  required
                  title="资料项名称"
                  titleWidth={90}
                  placeholder="资料项名称"
                  value={form.name}
                  maxlength={6}
                  showWordLimit
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
              </React.Fragment>
            ) : null}
          </View>
          {form.type === 2 ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : null}
          <View className="card">
            <Field
              border={false}
              title="排序"
              titleWidth={90}
              input={false}
              value={form.sort === -1 ? "置顶" : "指定序号"}
              arrow
              clickable
              onClick={() => {
                Taro.showActionSheet({
                  itemList: ["置顶", "指定序号"],
                  success: function (res) {
                    if (res.tapIndex === 0) {
                      handleValueChange(-1, "sort");
                    } else {
                      handleValueChange("", "sort");
                    }
                  }
                });
              }}
            />
            {form.sort !== -1 ? (
              <React.Fragment>
                <Field
                  title="序号"
                  titleWidth={90}
                  type="digit"
                  placeholder="请输入序号"
                  value={form.sort}
                  onChange={(val)=>{handleValueChange(val,"sort");}}
                />
              </React.Fragment>
            ) : null}
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
      <Popup
        show={sysShow}
        position="pageSheet"
        title="选择系统资料项"
        bgColor="#f7f8f8"
        onClose={()=>{setSysShow(false);}}
      >
        {!sysLoading ? (
          <React.Fragment>
            {sysList.length > 0 ? (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                {sysList.map((item,index)=>{
                  return (
                    <Radio
                      key={`sysList-${index}`}
                      cell
                      border={index !== 0}
                      checked={form.sys_profile_id === item.id}
                      value={item.id}
                      label={item.name}
                      right={<Tag size="small">{statciWordTypeList[item.type - 1]}</Tag>}
                      onChange={(val)=>{
                        // console.log(item,"item");
                        setForm(prevState => {
                          let temp = JSON.parse(JSON.stringify(prevState));
                          temp.sys_profile_id = val;
                          temp.data_type = item.type;
                          temp.name = item.name;
                          return temp;
                        });
                        setSysShow(false);
                      }}
                    />
                  );
                })}
              </View>
            ) : (
              <Empty desc="暂无系统资料项">
                <Button onClick={()=>{setSysShow(false);}}>返回</Button>
              </Empty>
            )}
          </React.Fragment>
         ) : (
          <React.Fragment>
            {Array(6)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    title
                    titleSize={[120, 20]}
                    action
                    actionRound
                    actionSize={[16,16]}
                  />
                );
              })}
          </React.Fragment>
        )}
      </Popup>
    </View>
  );
};

export default ProfileEdit;
