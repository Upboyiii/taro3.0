import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { customerApi, profileApi } from "@/api/co_admin";
import { formatPrice, secToDate } from "@/utils/common";
import { cityData } from "@/components/city-select/cityDate";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Button from "@/components/button";
import ImagePicker from "@/components/image-picker";
import CitySelect from "@/components/city-select";
import Popup from "@/components/popup";
import Checkbox from "@/components/checkbox";
import Tag from "@/components/tag";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ProfileEdit: FC = () => {
  const _item:any = getCurrentInstance().router?.params?.item;

  const init:any = {
    id: 0,
    customer_id: 0,
    profile: [],
    profile_id: 0
  };
  const [form, setForm] = useState<any>(init);
  const [errTips, setErrTips] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const getDetail = (detail) => {
    setLoading(true);
    customerApi.userCard.get({ id: detail.id })
      .then(res => {
        if (!!res && res.code === 0) {
          let _form = Object.assign({}, init, res?.data || {});
          _form.name = detail.name;
          _form.phone = detail.phone;
          _form.profile_name = detail.profile_name;
          // console.log(_form,"_form");
          // setForm(_form);
          getProfileDetail(_form.profile_id, _form);
        }
      })
      .finally(() => {
        // setLoading(false);
      });
  };
  const errTipsChange = (val, ref, father = "", index = -1, tips = "", trigger = "blur") => {
    setErrTips(prev => {
      let temp = JSON.parse(JSON.stringify(prev));
      let _tips = "";
      if(trigger === "blur"){
        _tips = !val ? tips : "";
      }else{
        _tips = val.length === 0 ? tips : "";
      }
      if(!!father){
        temp[`${father}-${index}-${ref}`] = _tips;
      }else{
        temp[ref] = _tips;
      }
      return temp;
    });
  };
  const handleValueChange = (val, ref, father = "", index = -1, tips = "", trigger = "blur") =>{
    setForm(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(!!father && index !== -1){
        temp[father][index][ref] = val;
      }else{
        temp[ref] = val;
      }
      if(!!tips){
        errTipsChange(val, ref, father, index, tips, trigger);
      }
      return temp;
    });
  };

  useEffect(() => {
    if(!!_item && Object.keys(_item).length > 0){
      Taro.setNavigationBarTitle({ title: "编辑客户档案" });
      const _detail = JSON.parse(_item);
      getDetail(_detail);
    }else{
      setForm(init);
      getProfileList();
    }
    eventCenterOn("fileCardCustomer", (res) => {
      if(!!res[0]){
        handleValueChange(res[0].ids,"customer_id");
        setCustomer(res[0].customer);
      }
    });
    return () => {
      eventCenterOff("fileCardCustomer");
    };
  }, []);

  const [itemPopup, setItemPopup] = useState<any>({});
  const [customer, setCustomer] = useState<any>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileList, setProfileList] = useState<any[]>([]);
  const [profileIndex, setProfileIndex] = useState(0);
  const [profileLabel, setProfileLabel] = useState("");
  const getProfileList = () => {
    if (profileList.length === 0) {
      setLoading(true);
      profileApi.card.page({ page: 1, page_size: 999 }).then(res => {
        if (!!res && res.code === 0) {
          const _list = res?.data?.list || [];
          setProfileList(_list);
        }
      }).finally(()=>{
        setLoading(false);
      });
    }
  };
  const getProfileDetail = (id, detail:any = null) => {
    setProfileLoading(true);
    profileApi.card.info({ id: id })
      .then(res=>{
        if (!!res && res.code === 0) {
          const _profile = res?.data?.profile || [];
          if (_profile.length > 0) {
            _profile.forEach((item, index) => {
              if (item.default) item.default = item.default.split(",");
              if(!!detail && !!detail?.profile && detail?.profile.length > 0){
                let row = detail.profile.find(row => item.label === row.label);
                if (row) {
                  item.value = !!row.value ? row.value : "";
                  if (item.data_type === 11) {
                    item.value = !!row.value ? row.value.split(",") : [];
                  } else if(item.data_type === 12 && !!row.value) {
                    item.value = row.value;
                    const _county_id = Number(row.value);
                    getCityLabel(_county_id, index);
                  }
                }
              }else{
                item.value = item.data_type === 11 ? [] : "";
              }
            });
          }
          if(!!detail && !!detail?.profile && detail?.profile.length > 0){
            const _form = JSON.parse(JSON.stringify(detail));
            _form.profile = _profile;
            // console.log(_form,"_form");
            setForm(_form);
          }else{
            handleValueChange(_profile,"profile");
          }
        }else{
          handleValueChange([],"profile");
        }
      }).catch(()=>{
        handleValueChange([],"profile");
      }).finally(()=>{
        setProfileLoading(false);
        setLoading(false);
      });
  };
  useEffect(()=>{
    if(!!form.profile_id && profileList.length > 0){
      for(let i = 0; i < profileList.length; i++){
        const item = profileList[i];
        if(item.id === form.profile_id){
          setProfileIndex(i);
          setProfileLabel(item.name);
          break;
        }
      }
    }
  },[profileList, form.profile_id]);

  const [cityLabel, setCityLabel] = useState<any>({});
  const citySelectConfirm = (data, index) => {
    let city: string = "", county_id = "";
    if (Array.isArray(data) && data.length > 0) {
      county_id = String(data.slice(-1)[0].id);
      data.map((item, index) => {
        if (index !== 0) city += "/";
        city += item.label;
      });
    }
    handleValueChange(county_id, "value", "profile", index, "请选择省/市/区");
    setCityLabel(() => {
      let temp: any = {};
      temp[index] = city;
      return temp;
    });
  };
  const getCityLabel = (_county_id, index) => {
    // console.log(_county_id,"_county_id");
    let _adress = "";
    for (let i = 0; i < cityData.length; i++) {
      const item = cityData[i];
      if (!item.children) {
        continue;
      }
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j];
        if (child.id === _county_id) {
          _adress = item.label + "/" + child.label;
        }
        if (!child.children) {
          continue;
        }
        for (let k = 0; k < child.children.length; k++) {
          const grandchild = child.children[k];
          if (grandchild.id === _county_id) {
            _adress = item.label + "/" + child.label + "/" + grandchild.label;
          }
        }
      }
    }
    // console.log(_adress,"_adress");
    setCityLabel(() => {
      let temp: any = {};
      temp[index] = _adress;
      return temp;
    });
  };

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(form));
    if (!_form.profile_id) {
      Taro.showToast({ title: "请选择所属档案卡", icon: "none" });
      errTipsChange(_form.profile_id, "profile_id", "",-1,"请选择所属档案卡");
      return false;
    }
    if (!_form.customer_id) {
      Taro.showToast({ title: "请选择用户", icon: "none" });
      errTipsChange(_form.customer_id, "customer_id", "",-1,"请选择用户");
      return false;
    }
    if(form.profile.length === 0){
      Taro.showToast({ title: "没有填写档案信息，无法保存", icon: "none" });
      return false;
    }else{
      for(let i = 0; i < _form.profile.length; i++){
        const item = _form.profile[i];
        if(!!item.required){
          if(item.data_type === 11){
            if(item.value.length === 0){
              Taro.showToast({ title: `请选择${item.name}`, icon: "none" });
              errTipsChange(_form.profile[i].value, "value", "profile",i,`请选择${item.name}`);
              return false;
            }
          }else if(!item.value){
            Taro.showToast({ title: `请输入${item.name}`, icon: "none" });
            errTipsChange(_form.profile[i].value, "value", "profile",i,`请输入${item.name}`);
            return false;
          }
        }
      }
      let _profile:any[] = [];
      _form.profile.forEach(item => {
        let _value = item.value;
        // if(item.data_type === 9){
        //   Taro.getLocation({
        //     type: "wgs84",
        //     success: function (res) {
        //       console.log(res,"getLocation");
        //       const latitude = res.latitude;
        //       const longitude = res.longitude;
        //       const speed = res.speed;
        //       const accuracy = res.accuracy;
        //     }
        //   });
        // }
        if ((!!_value && item.data_type !== 11) || (item.data_type === 11 && _value.length > 0)) {
          if (item.data_type === 11) _value = _value.join(",");
          _profile.push({ label: item.label, value: _value });
        }
      });
      _form.profile = _profile;
    }
    // console.log(_form,"_form");

    setSaveLoading(true);
    customerApi.userCard.save(_form)
      .then(res => {
        // console.log(res,"res");
        if (!!res && res.code === 0) {
          eventCenterTrigger("userCardEdit");
          navigateTo({ method:"navigateBack" });
        }else{
          Taro.showToast({ title: res.message, icon: "none" });
        }
      }).catch(res=>{
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(()=>{
      setSaveLoading(false);
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
          customerApi.userCard.delete({ id: form.id })
            .then(res => {
              if (!!res && res.code === 0) {
                eventCenterTrigger("userCardEdit" );
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
        {!loading ? (
          <React.Fragment>
            {!!form.id ? (
              <React.Fragment>
                <View className="card-title">客户信息</View>
                <View className="card">
                  <Cell
                    border={false}
                    align="start"
                    textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                    title={form.name}
                    label={form.phone}
                    extraStyle={{ marginTop: addUnit(2), display: "flex", flexDirection: "row" }}
                    extra={form.profile_name ? <Tag plain={false} type="info">{form.profile_name}</Tag> : null}
                  />
                  <Cell
                    size="small"
                    title={`更新时间：${secToDate(form?.updated_at || form?.created_at || 0)}`}
                    textStyle={{ color: "#666" }}
                  />
                </View>
              </React.Fragment>
            ) : (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                <Picker
                  mode="selector"
                  range={profileList.map(item=>item.name)}
                  value={profileIndex}
                  onChange={(e)=>{
                    const row = profileList[e.detail.value];
                    getProfileDetail(row.id);
                    handleValueChange(row.id, "profile_id","",-1,"请选择所属档案卡");
                    setProfileIndex(+e.detail.value);
                    setProfileLabel(row.name);
                  }}
                >
                  <Field
                    required
                    title="所属档案卡"
                    titleWidth={90}
                    placeholder="请选择所属档案卡"
                    input={false}
                    value={profileLabel}
                    arrow
                    errorIcon={false}
                    error={!!errTips.profile_id}
                    errorMessage={errTips.profile_id}
                  />
                </Picker>
                {Object.keys(customer).length > 0 ? (
                  <React.Fragment>
                    <Cell
                      title={`${customer.name}-${customer.phone}`}
                      textStyle={{ fontWeight: "bold" }}
                      labelStyle={{ marginTop: 0 }}
                      label={`余额：¥${formatPrice(customer.reserve)}`}
                      arrow
                      onClick={()=>{
                        navigateTo({ method: "navigateTo", url: "/pages/com/search-customer/index", params: { ids: form.customer_id, refs: "fileCardCustomer" } });
                      }}
                    />
                  </React.Fragment>
                ) : (
                  <Field
                    required
                    title="选择用户"
                    titleWidth={90}
                    input={false}
                    placeholder="请选择用户"
                    arrow
                    onClick={()=>{
                      navigateTo({ method: "navigateTo", url: "/pages/com/search-customer/index", params: { ids: form.customer_id, refs: "fileCardCustomer" } });
                    }}
                    errorIcon={false}
                    error={!!errTips.customer_id}
                    errorMessage={errTips.customer_id}
                  />
                )}
              </View>
            )}
          </React.Fragment>
        ) : (
          <View className="card" style={{ marginTop: addUnit(12) }}>
            <Skeleton
              border={false}
              title
              titleSize={[120, 16]}
              row={2}
              rowWidth={160}
              action
              actionSize={[48,12]}
            />
          </View>
        )}
        {!profileLoading || !loading ? (
          <React.Fragment>
            {!!form.profile && form.profile.length > 0 ? (
              <React.Fragment>
                <View className="card-title">档案信息</View>
                <View className="card">
                  {form.profile.map((item, index)=>{
                    // data_type 1文本 2数字 3邮件 4日期 5时间 6身份证 7图片 8手机号 9位置 10单选值 11多选值 12 省市区
                    if(item.data_type === 4 || item.data_type === 5){
                      return (
                        <Picker
                          key={`profile-${index}`}
                          mode={item.data_type === 4 ? "date" : "time"}
                          start={secToDate(new Date(1900,1,1).getTime(),"{y}-{M}-{d}")}
                          value={item.value}
                          onChange={(e)=>{
                            let val = item.data_type === 4 ? e.detail.value.replace(/\//g, "-") : e.detail.value + ":00";
                            handleValueChange(val, "value", "profile", index, item.required ? `请选择${item.name}` : "");
                          }}
                        >
                          <Field
                            titleWidth={90}
                            border={index !== 0}
                            required={!!item.required}
                            title={item.name}
                            input={false}
                            value={item.value}
                            placeholder={`请选择${item.name}`}
                            errorIcon={false}
                            error={!!errTips[`profile-${index}-value`]}
                            errorMessage={errTips[`profile-${index}-value`]}
                            arrow
                          />
                        </Picker>
                      );
                    }else if(item.data_type === 7){
                      return (
                        <Field
                          key={`profile-${index}`}
                          border={index !== 0}
                          title={item.name}
                          titleRow
                          required={!!item.required}
                          align="start"
                          input={false}
                          errorIcon={false}
                          error={!!errTips[`profile-${index}-value`]}
                          errorMessage={errTips[`profile-${index}-value`]}
                        >
                          <ImagePicker
                            refs="goodsPic"
                            files={!!item.value ? [item.value] : []}
                            maxCount={1}
                            rowCount={4}
                            preview
                            addText="图片"
                            onChange={(val)=>{
                              // console.log(val,"ImagePicker");
                              handleValueChange(val[0], "value", "profile", index, item.required ? `请输入${item.name}` : "");
                            }}
                          />
                        </Field>
                      );
                    }else if(item.data_type === 10){
                      return (
                        <Field
                          key={`profile-${index}`}
                          border={index !== 0}
                          title={item.name}
                          titleWidth={90}
                          required={!!item.required}
                          input={false}
                          errorIcon={false}
                          value={item.value}
                          placeholder={`请选择${item.name}`}
                          error={!!errTips[`profile-${index}-value`]}
                          errorMessage={errTips[`profile-${index}-value`]}
                          arrow
                          onClick={()=>{
                            if(!item.default || item.default.length === 0) return;
                            Taro.showActionSheet({
                              itemList: item.default,
                              success: function (res) {
                                const val = item.default[res.tapIndex];
                                handleValueChange(val, "value", "profile", index, item.required ? `请选择${item.name}` : "");
                              }
                            });
                          }}
                        />
                      );
                    }else if(item.data_type === 11){
                      return (
                        <React.Fragment key={`profile-${index}`}>
                          <Field
                            border={index !== 0}
                            title={item.name}
                            titleWidth={90}
                            required={!!item.required}
                            input={false}
                            errorIcon={false}
                            value={Array.isArray(item.value) && item.value.length > 0 ? item.value.join("；") : ""}
                            placeholder={`请选择${item.name}`}
                            error={!!errTips[`profile-${index}-value`]}
                            errorMessage={errTips[`profile-${index}-value`]}
                            arrow
                            onClick={()=>{
                              if(!item.default || item.default.length === 0) return;
                              setItemPopup(() => {
                                let temp: any = {};
                                temp[index] = true;
                                return temp;
                              });
                            }}
                          />
                          {!!item.default && item.default.length > 0 ? (
                            <Popup
                              show={itemPopup[index]}
                              title={`请选择${item.name}`}
                              bgColor="#f7f8f8"
                              onClose={() => { setItemPopup({}); }}
                              action={
                                <Button
                                  style={{ width: "70%" }}
                                  type="primary"
                                  onClick={() => { setItemPopup({});}}
                                >
                                  确定
                                </Button>
                              }
                            >
                              <View className="card">
                                {item.default.map((label, idx) => {
                                  return (
                                    <Checkbox
                                      key={"checkbox" + index + idx}
                                      border={idx !== 0}
                                      cell
                                      label={label}
                                      checked={item.value.indexOf(label) > -1}
                                      onChange={(val)=>{
                                        const _index = item.value.indexOf(label);
                                        if(val){
                                          if(_index === -1){
                                            item.value.push(label);
                                          }
                                        }else{
                                          if(_index > -1){
                                            item.value.splice(_index, 1);
                                          }
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </View>
                            </Popup>
                          ) : null}
                        </React.Fragment>
                      );
                    }else if(item.data_type === 12){
                      return (
                        <React.Fragment key={`profile-${index}`}>
                          <Field
                            border={index !== 0}
                            title={item.name}
                            titleWidth={90}
                            required={!!item.required}
                            input={false}
                            value={cityLabel[index]}
                            placeholder="请选择省/市/区"
                            errorIcon={false}
                            error={!!errTips[`profile-${index}-value`]}
                            errorMessage={errTips[`profile-${index}-value`]}
                            arrow
                            onClick={()=>{
                              setItemPopup(() => {
                                let temp: any = {};
                                temp[index] = true;
                                return temp;
                              });
                            }}
                          />
                          <CitySelect
                            value={Number(form.county_id)}
                            show={itemPopup[index]}
                            onCancel={() => { setItemPopup({}); }}
                            onConfirm={(data)=>{citySelectConfirm(data, index);}}
                          />
                        </React.Fragment>
                      );
                    }else if(item.data_type !== 9){
                      const inputTye = () => {
                        if (item.data_type === 2) return "number";
                        if (item.data_type === 6) return "idcard";
                        if (item.data_type === 8) return "tel";
                        return "text";
                      };
                      return (
                        <Field
                          key={`profile-${index}`}
                          titleWidth={90}
                          border={index !== 0}
                          required={!!item.required}
                          type={inputTye()}
                          title={item.name}
                          value={item.value}
                          placeholder={`请输入${item.name}`}
                          // label={!!item.default && item.default.length > 0 ? `${item.data_type === 10 ? "单" : "多"}选项值：${item.default.join(";")}` : null}
                          errorIcon={false}
                          error={!!errTips[`profile-${index}-value`]}
                          errorMessage={errTips[`profile-${index}-value`]}
                          onChange={(val)=>{
                            handleValueChange(val, "value", "profile", index, item.required ? `请输入${item.name}` : "");
                          }}
                        />
                      );
                    }
                  })}
                </View>
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ) : (
          <View className="card">
            {Array(6)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    border={i !== 0}
                    title
                    titleSize={[120, 16]}
                    action
                    actionSize={[48,12]}
                  />
                );
              })}
          </View>
        )}
      </ScrollView>
      </KeyboardAwareScrollView>
      <BottomBar>
        {!!form?.id ? (
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
          loading={saveLoading}
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
