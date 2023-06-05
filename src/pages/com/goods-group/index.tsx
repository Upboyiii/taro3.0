import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { shopApi } from "@/api/co_admin";
import { list2Tree } from "@/utils/common";
import { addUnit, createNamespace } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import Skeleton from "@/components/skeleton";
import Button from "@/components/button";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const GoodsGroup: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const [type, setType] = useState("");
  const [refs, setRefs] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [multiple, setMultiple] = useState(false);
  useEffect(()=>{
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _type = _params?.type || "";
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
      getList();
    }else{
      setErr(true);
    }
  },[]);

  const [groupActive, setGroupActive] = useState(null);
  const [group, setGroup] = useState<any>({});
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);

  const getList = () => {
    if(pageList.length === 0){
      setErr(false);
      setLoading(true);
      shopApi.group.page({ page: 1, page_size: 999, pid: -2 })
        .then(res => {
          if (!!res && res.code === 0) {
            const list = list2Tree(res.data?.list || []);
            setGroup(list[0]);
            setGroupActive(list[0].id);
            setPageList(list);
          } else {
            setErr(true);
          }
        }).catch(() => {
          setErr(true);
        }).finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(()=>{
    if(!multiple && !!selected){
      // console.log(pageList,"pageList");
      pageList.forEach(item=>{
        if(item.children && item.children.length > 0){
          item.children.forEach(son=>{
            if(son.id === selected){
              setGroupActive(item.id);
              setGroup(item);
            }
          });
        }else{
          if(item.id === selected){
            setGroupActive(item.id);
            setGroup(item);
          }
        }
      });
    }
  },[selected, multiple, pageList]);

  const itemClick = (id) => {
    if(!multiple){
      setSelected(id);
      handleConfirm(id);
    }else{
      setSelected(prevState=>{
        let temp = JSON.parse(JSON.stringify(prevState));
        if(temp.indexOf(id) > -1){
          temp.splice(temp.indexOf(id), 1);
        }else{
          temp.push(id);
        }
        return temp;
      });
    }
  };

  const handleConfirm = (id = 0) => {
    if(multiple && selected.length === 0){
      Taro.showToast({ title: "请选择分组", icon: "none" });
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

  const [bem] = createNamespace("group","goods");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {err ? (
        <Empty desc="加载错误，请返回重试" image="error" />
      ) : !loading ? (
        <React.Fragment>
          {pageList.length > 0 ? (
            <React.Fragment>
              <View className={classnames(bem())}>
                <View className={classnames(bem("aside"))}>
                  <View className="hairline hairline--right" />
                  <ScrollView style={{ flex: 1, width: addUnit(124) }} scrollWithAnimation scrollY>
                    {pageList.map((item,index)=>{
                      return (
                        <View
                          key={`group-menu-${item.id}`}
                          className={classnames(
                            bem("aside-item",{
                              active: item.id === groupActive,
                              "active-first": item.id === groupActive && index === 0,
                              "active-last": item.id === groupActive && index === pageList.length
                            })
                          )}
                          onClick={()=>{
                            setGroupActive(item.id);
                            setGroup(item);
                          }}
                        >
                          {item.name}
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
                <View className={classnames(bem("content"))}>
                  <ScrollView style={{ flex:1, paddingLeft: addUnit(16), paddingRight: addUnit(16) }} scrollWithAnimation scrollY>
                    <View className={classnames(bem("header"))}>
                      <View
                        className={classnames(bem("item", { active: (!multiple && selected === group.id) || (multiple && selected.indexOf(group.id) > -1 ) }))}
                        style={{ width: "50%", marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 }}
                        onClick={()=>{ itemClick(group.id); }}
                      >
                        {group.name}
                      </View>
                    </View>
                    {group?.children && group?.children.length > 0 ? (
                      <React.Fragment>
                        <View className={classnames(bem("title"))}>二级分组</View>
                        <View className={classnames(bem("list"))}>
                          {group.children.map(item=>{
                            return (
                              <View className={classnames(bem("item-wrapper"))} key={`group-menu-${item.id}`}>
                                <View
                                  className={classnames(bem("item", { active: (!multiple && selected === item.id) || (multiple && selected.indexOf(item.id) > -1 ) }))}
                                  onClick={()=>{ itemClick(item.id); }}
                                >
                                  {item.name}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </React.Fragment>
                    ) : null}
                  </ScrollView>
                </View>
              </View>
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
            </React.Fragment>
          ) : (
            <Empty image="goods" desc="暂无分组">
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
        <View className={classnames(bem())}>
          <View className={classnames(bem("aside"))}>
            <View className="hairline hairline--right" style={{ zIndex:3 }} />
            {Array(10)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    align="start"
                    title
                    titleSize={[64,16]}
                    border={i !== 0}
                    style={{ backgroundColor: "transparent" }}
                  />
                );
              })}
          </View>
          <View className={classnames(bem("content"))}>
            <View className={classnames(bem("list"))} style={{ padding: addUnit(12) }}>
              {Array(18)
                .fill("")
                .map((_, i) => {
                  return (
                    <View key={i} className={classnames(bem("item-wrapper"))}>
                      <Skeleton
                        className={classnames(bem("item"))}
                        title
                        compact
                        titleSize={["100%",32]}
                        border={false}
                      />
                    </View>
                  );
                })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default GoodsGroup;
