import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { customerApi } from "@/api/co_admin";
import { formatLifeTime } from "@/pageSub/customer/pages/memberCard/utils"
import ScrollView from "@/components/scroll-view";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Checkbox from "@/components/checkbox";
import Skeleton from "@/components/skeleton";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const SelectMemberCard: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const pageSize = 10;
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const getList = (page, refresh = false)=>{
    if(refresh){
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    customerApi.benefitCard.page({ page: page, page_size: pageSize, state: 1 }).then(res=>{
      // console.log(res,"res");
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data?.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          setPageList(list => {
            return [...list, ...res.data.list];
          });
        }else {
          setIsPage(false);
        }
      }else{
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    }).finally(()=>{
      setLoading(false);
      setRefreshing(false);
      setPulling(false);
    });
  };
  const onScrollToLower = () => {
    if(isPage){
      setPulling(true);
      setPage(val=>{
        let _page = val + 1;
        getList(_page);
        return _page;
      });
    }
  };
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getList(1, true);
    },500);
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
      getList( 1, true);
    }else{
      setErr(true);
    }
  },[]);

  const handleConfirm = (id = 0) => {
    if(multiple && selected.length === 0){
      Taro.showToast({ title: "请选择权益卡", icon: "none" });
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

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
        pullUp={!loading}
        loading={pulling}
        loadMore={total > pageSize}
        loadStart={total > page * pageSize}
        onPullUp={onScrollToLower}
      >
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
                    imageSize={24}
                    imageShape="round"
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                  />
                );
              })}
          </React.Fragment>
        ) : (
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
                        label={
                          <React.Fragment>
                            <Tag
                              mark
                              style={{ marginRight: addUnit(8) }}
                              plain={false}
                              type={item.state === 1 ? (item.claim_type === 1 ? "success" : item.claim_type === 2 ? "warning" : item.claim_type === 3 ? "primary" : "default") : "default"}
                            >
                              {item.claim_type === 1 ? "无门槛卡" : item.claim_type === 2 ? "规则卡" : item.claim_type === 3 ? "付费卡" : null}
                            </Tag>
                            <Text style={{ fontSize: addUnit(16) }}>{item.name}</Text>
                          </React.Fragment>
                        }
                        labelStyle={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center"
                        }}
                        desc={
                          <React.Fragment>
                            <View className="hairline hairline--top" />
                            <Text style={{ fontSize: addUnit(12), color: "#666" }} >
                              {formatLifeTime(item.life_time, item.expire_at)}
                            </Text>
                          </React.Fragment>
                        }
                        descStyle={{
                          position: "relative",
                          marginTop: addUnit(10),
                          paddingTop: addUnit(8)
                        }}
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
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty image="memberCard" desc="暂无相关权益卡">
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

export default SelectMemberCard;
