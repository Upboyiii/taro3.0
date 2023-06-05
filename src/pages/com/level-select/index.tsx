import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Image } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { customerApi } from "@/api/co_admin";
import { base } from "@/api/config";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Checkbox from "@/components/checkbox";
import Skeleton from "@/components/skeleton";
import Tag from "@/components/tag";
import Tabs from "@/components/tabs";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "../../../pageSub/customer/pages/memberCard/detail/index.scss";

const SelectLevel: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const tabs = [
    { label: "免费会员", value: 1 },
    { label: "付费会员", value: 2 }
  ];
  const [tabsActive, setTabsActive] = useState(1);
  const handelTabs = (val) => {
    setTabsActive(val);
    getList(val);
  };

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const getList = (type)=>{
    setErr(false);
    setPageList([]);
    setLoading(true);
    customerApi.level.page({ page: 1, page_size: 999, type: type, state: 1, order_key: "+created_at" }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          const list = res.data?.list;
          setPageList(list);
        }
      }else{
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    }).finally(()=>{
      setLoading(false);
    });
  };

  const [type, setType] = useState("");
  const [refs, setRefs] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [multiple, setMultiple] = useState(false);
  useEffect(()=>{
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _type = _params?.type;
      const _multiple = !!_params?.multiple && (_params?.multiple === "true" || _params?.multiple === true);
      const _ids = _params?.ids;
      setRefs(_refs);
      setType(_type);
      setMultiple(_multiple);
      if(!!_ids && !!JSON.parse(_ids)){
        setSelected(JSON.parse(_ids));
      }else{
        setSelected(_multiple ? [] : null);
      }
      getList( 1);
    }else{
      setErr(true);
    }
  },[]);

  const handleConfirm = (id = 0) => {
    if(multiple && selected.length === 0){
      Taro.showToast({ title: "请选择会员等级", icon: "none" });
      return;
    }
    const _ids = !!id ? id : selected;
    if(!!type){
      eventCenterTrigger(refs, { ids: _ids, type: type });
    }else{
      eventCenterTrigger(refs, _ids);
    }
    navigateTo({ method: "navigateBack" });
  };

  const [bem] = createNamespace("card","member");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Tabs active={tabsActive} options={tabs} onChange={handelTabs} bgColor="#fff" border />
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {loading ? (
          <React.Fragment>
            {Array(6)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    image
                    imageSize={40}
                    title
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[24,24]}
                    actionRound
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {pageList.length > 0 ? (
                  <React.Fragment>
                    {pageList.map((item:any, index)=>{
                      return (
                        <View className="card" key={index} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                          <Checkbox
                            checked={(!multiple && selected === item.id) || (multiple && selected.indexOf(item.id) > -1 )}
                            cell
                            border={false}
                            labelPosition="right"
                            contentStyle={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                            onChange={(val)=>{
                              if(!multiple){
                                setSelected(item.id);
                                handleConfirm(item.id);
                              }else{
                                setSelected(prevState=>{
                                  let temp = JSON.parse(JSON.stringify(prevState));
                                  if(val){
                                    if(temp.indexOf(item.id) === -1){
                                      temp.push(item.id);
                                    }
                                  }else{
                                    if(temp.indexOf(item.id) > -1){
                                      temp.splice(temp.indexOf(item.id), 1);
                                    }
                                  }
                                  return temp;
                                });
                              }
                            }}
                          >
                            <View
                              className={classnames(bem("card"))}
                              style={{
                                width: addUnit(72),
                                height: addUnit(44),
                                borderRadius: addUnit(4)
                              }}
                            >
                              <View
                                className={classnames(bem("backdrop"))}
                                style={{ backgroundColor: item.color_code || "#646666" }}
                              >
                                <Tag
                                  plain={false}
                                  mark
                                  size="small"
                                  textColor="#fff"
                                  color="rgba(255,255,255,.3)"
                                  style={{
                                    fontWeight: "bold",
                                    position: "absolute",
                                    left: addUnit(4),
                                    top: addUnit(4)
                                  }}
                                >
                                  {`${ item.type === 1 ? "VIP" : "SVIP"}${ item.type === 1 ? item.level_value : "" }`}
                                </Tag>
                                <Image
                                  className={classnames(bem("backdrop-watermark"))}
                                  src={item.type === 1 ? require("@/assets/card/level-vip.png") : require("@/assets/card/level-svip.png")}
                                  mode="aspectFill"
                                  style={{ width: addUnit(48), height: addUnit(40) }}
                                />
                                {item.cover_url && item.cover_url !== "" && item.cover_url !== "string" ? (
                                  <Image className={classnames(bem("backdrop-image"))} src={base.file_host + "/" + item.cover_url} mode="aspectFill" />
                                ) : null}
                              </View>
                            </View>
                            <View style={{ flex: 1, paddingLeft: addUnit(12) }}>
                              <View style={{ fontSize: addUnit(16), fontWeight: "bold", color: "#333" }}>{item.name}</View>
                              {item.type === 1 ? (
                                <View style={{ fontSize: addUnit(12), color: "#666", marginTop: addUnit(6) }}>{`需${ item?.free_growth || 0 }成长值`}</View>
                              ) : null}
                            </View>
                          </Checkbox>
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无相关会员">
                    <Button
                      plain
                      onClick={()=>{
                        navigateTo({ method:"navigateBack" });
                      }}
                    >
                      返回
                    </Button>
                  </Empty>
                )}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      {pageList.length > 0 && multiple ? (
        <BottomBar>
          <Button
            style={{ width: "70%" }}
            type="primary"
            onClick={()=>{
              handleConfirm();
            }}
          >
            {selected.length > 0 ? `确定选择(${selected.length})` : "确定选择"}
          </Button>
        </BottomBar>
      ) : null}
    </View>
  );
};

export default SelectLevel;
