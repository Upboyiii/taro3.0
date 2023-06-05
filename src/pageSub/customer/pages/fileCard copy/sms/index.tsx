import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { pluginApi } from "@/api/base";
import store from "@/store";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Switch from "@/components/switch";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Popup from "@/components/popup";
import Radio from "@/components/radio";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const FileCardSms: FC = () => {
  const _params:any = getCurrentInstance().router?.params;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [smsUse, setSmsUse] = useState(false);
  const [smsID, setSmsID] = useState(null);
  const [smsLabel, setSmsLabel] = useState("");
  const [smsWords, setSmsWords] = useState<any[]>([]);
  // @ts-ignore
  const [smsMap, setSmsMap] = useState<any[]>([]);
  const [smsPreveiw, setSmsPreveiw] = useState("");
  const [smsContent, setSmsContent] = useState("");
  const [smsRuleLoading, setSmsRuleLoading] = useState(false);
  const [smsRule, setSmsRule] = useState<any[]>([]);
  const [smsList, setSmsList] = useState<any[]>([]);
  const getSmsList = () => {
    if (smsList.length === 0) {
      setLoading(true);
      pluginApi.plugin("post",282,"getTemplateList",JSON.stringify({ template_type: 1, tags_id: "6459b0a906b5784bc544beed" }))
        .then(res => {
          if (!!res && res.code === 0) {
            setSmsList(res?.data || []);
          }else{
            setErr(true);
          }
        }).catch(()=>{
          setErr(true);
        }).finally(()=>{
          setLoading(false);
        });
    }
  };
  const getSmsRule = (id, map = []) => {
    setSmsRuleLoading(true);
    pluginApi.plugin("post",282,"getTemplatesRule", JSON.stringify({ id: id }))
      .then(res => {
        if (!!res && res.code === 0) {
          setSmsContent(res.data?.content || "");
          let _rule = (res.data?.param_rule || []).filter(item=>(item.label !== "note" && item.label !== "store_name"));
          _rule.forEach(item => {
            item.profile = map[item.label] || "";
          });
          setSmsRule(_rule);
        }
      }).finally(()=>{
        setSmsRuleLoading(false);
      });
  };

  useEffect(()=>{
    getSmsList();
    if (Object.keys(_params).length > 0) {
      if(!!_params?.id && !!JSON.parse(_params?.id)){
        setSmsID(JSON.parse(_params?.id));
        setSmsUse(true);
        getSmsRule(JSON.parse(_params?.id), JSON.parse(_params?.map || "[]"));
      }
      if(!!_params?.map && !!JSON.parse(_params?.map)){
        setSmsMap(JSON.parse(_params?.map));
      }
      if(!!_params?.words && !!JSON.parse(_params?.words)){
        let _words = (JSON.parse(_params?.words) || []).filter(item=>{
          return item.data_type !== 7 && item.data_type !== 9 && item.data_type !== 12;
        });
        setSmsWords(_words);
      }
    }
  },[]);

  useEffect(()=>{
    if (smsList.length > 0) {
      const item = smsList.find(item => {
        return smsID === item.id;
      });
      setSmsLabel(item?.name || "");
    }
  },[smsID, smsList]);

  const storeInfo = store.getState().storeInfo;
  useEffect(()=>{
    if (!!smsContent) {
      let str = smsContent;
      str = str.replace(`{{store_name}}`, storeInfo.name);
      str = str.replace(`{{note}}`, "提醒的内容");
      smsRule.forEach(item => {
        if (item.profile) {
          str = str.replace(item.label, item.profile);
        }
      });
      setSmsPreveiw(str);
    }else{
      setSmsPreveiw("");
    }
  },[smsRule, smsContent]);

  const [smsPopup, setSmsPopup] = useState({
    visable: false,
    type: "",
    title: "",
    selected: "",
    index: -1
  });
  const closeSmsPopup = () => {
    setSmsPopup(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.visable = false;
      temp.type = "";
      temp.title = "";
      temp.selected = "";
      temp.index = -1;
      return temp;
    });
  };

  const getDisabled = (name) => {
    let index = smsRule.findIndex(item => item.profile === name);
    return index >= 0 && smsRule[smsPopup.index]?.profile !== name;
  };

  const saveClick = () => {
    let _id = null;
    let _map:any = {};
    if(smsUse && smsID){
      _id = smsID;
      for(let i = 0; i < smsRule.length;i++){
        if(!smsRule[i].profile){
          Taro.showToast({ title: `请选择${smsRule[i].name}`, icon: "none" });
          return false;
        }else{
          _map[smsRule[i].label] = smsRule[i].profile;
        }
      }
    }
    eventCenterTrigger("fileCardSMS",{ id: _id, map: _map });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
        {!loading ? (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {smsList.length > 0 ? (
                  <React.Fragment>
                    <View className="card" style={{ marginTop: addUnit(12) }}>
                      <Cell
                        border={false}
                        title="启用短信模板"
                        content={
                          <Switch
                            checked={smsUse}
                            onChange={(val)=>{
                              setSmsUse(val);
                              if(!val) setSmsID(null);
                            }}
                          />
                        }
                      />
                    </View>
                    {smsUse ? (
                      <View className="card">
                        <Field
                          border={false}
                          title="短信模板"
                          placeholder="请选择短信模板"
                          inputAlign="right"
                          input={false}
                          clickable
                          arrow
                          value={smsLabel}
                          onClick={()=>{
                            setSmsPopup(prevState => {
                              let temp = JSON.parse(JSON.stringify(prevState));
                              temp.visable = true;
                              temp.type = "smsID";
                              temp.title = "请选择短信模板";
                              return temp;
                            });
                          }}
                        />
                      </View>
                    ) : null}
                    {!smsRuleLoading ? (
                      <React.Fragment>
                        {!!smsID && smsRule.length > 0 ? (
                          <View className="card">
                            {smsRule.map((item, index)=>{
                              return (
                                <Field
                                  key={index}
                                  required
                                  border={index !== 0}
                                  title={item.name}
                                  placeholder={`请选择${item.name}`}
                                  inputAlign="right"
                                  input={false}
                                  clickable
                                  arrow
                                  value={item.profile}
                                  onClick={()=>{
                                    setSmsPopup(prevState => {
                                      let temp = JSON.parse(JSON.stringify(prevState));
                                      temp.visable = true;
                                      temp.type = "smsRule";
                                      temp.index = index;
                                      temp.selected = item.profile;
                                      temp.title = `请选择${item.name}`;
                                      return temp;
                                    });
                                  }}
                                />
                              );
                            })}
                          </View>
                        ) : null}
                        {!!smsPreveiw ? (
                          <React.Fragment>
                            <View className="card-title">短信模板预览</View>
                            <View
                              className="card"
                              style={{ padding: addUnit(16), lineHeight: addUnit(22) }}
                            >
                              {smsPreveiw}
                            </View>
                          </React.Fragment>
                        ) : null}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <View className="card">
                          {Array(3)
                            .fill("")
                            .map((_, i) => {
                              return (
                                <Skeleton
                                  border={i !== 0}
                                  key={i}
                                  title
                                  titleSize={[120, 16]}
                                  action
                                  actionSize={[72,16]}
                                />
                              );
                            })}
                        </View>
                        <Skeleton
                          style={{ marginTop: 0 }}
                          card
                          title
                          row={4}
                        />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无短信模板可设置" />
                )}
              </React.Fragment>
            ) : (
              <Empty desc="短信模板加载失败，请返回重试" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Skeleton
              card
              title
              titleSize={[120, 16]}
              action
              actionRound
              actionSize={[48,16]}
            />
            <Skeleton
              card
              title
              titleSize={[120, 16]}
              action
              actionSize={[72,16]}
            />
            <View className="card" style={{ marginTop: addUnit(12) }}>
              {Array(4)
                .fill("")
                .map((_, i) => {
                  return (
                    <Skeleton
                      border={i !== 0}
                      key={i}
                      title
                      titleSize={[120, 16]}
                      action
                      actionSize={[72,16]}
                    />
                  );
                })}
            </View>
            <Skeleton
              style={{ marginTop: 0 }}
              card
              title
              row={4}
            />
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        {!err && smsList.length > 0 ? (
          <Button
            loading={loading}
            style={{ width: "70%" }}
            type="primary"
            onClick={saveClick}
          >
            确定
          </Button>
        ) : (
          <Button
            style={{ width: "70%" }}
            plain
            onClick={()=>{
              navigateTo({ method:"navigateBack" });
            }}
          >
            返回
          </Button>
        )}
      </BottomBar>
      {smsList.length > 0 ? (
        <Popup
          show={smsPopup.visable}
          title={smsPopup.title}
          bgColor="#f7f8f8"
          onClose={closeSmsPopup}
        >
          <View className="card">
            {smsPopup.type === "smsID" ? (
              <React.Fragment>
                {smsList.map((item, index)=>{
                  return (
                    <Radio
                      key={`goodsType-${index}`}
                      cell
                      type="check"
                      border={index !== 0}
                      style={{ paddingTop: addUnit(14), paddingBottom: addUnit(14) }}
                      label={item.name}
                      labelStyle={{ fontSize: addUnit(16) }}
                      value={item.id}
                      checked={smsID === item.id}
                      onClick={() => {
                        setSmsID(item.id);
                        getSmsRule(item.id);
                        closeSmsPopup();
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {smsWords.map((item, index)=>{
                  return (
                    <Radio
                      key={`goodsType-${index}`}
                      cell
                      type="check"
                      border={index !== 0}
                      style={{ paddingTop: addUnit(14), paddingBottom: addUnit(14) }}
                      label={item.name}
                      labelStyle={{ fontSize: addUnit(16) }}
                      value={item.id}
                      checked={smsRule[smsPopup.index]?.profile === item.name}
                      disabled={getDisabled(item.name)}
                      onClick={() => {
                        if(getDisabled(item.name)) return;
                        setSmsRule(prevState => {
                          let temp = JSON.parse(JSON.stringify(prevState));
                          temp[smsPopup.index].profile = item.name;
                          return temp;
                        });
                        closeSmsPopup();
                      }}
                    />
                  );
                })}
              </React.Fragment>
            )}
          </View>
        </Popup>
      ) : null}
    </View>
  );
};

export default FileCardSms;
