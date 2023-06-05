import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { formatPrice, list2Tree } from "@/utils/common";
import { base } from "@/api/config";
import { shopApi } from "@/api/co_admin";
import ScrollView from "@/components/scroll-view";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Checkbox from "@/components/checkbox";
import Skeleton from "@/components/skeleton";
import Dropdown from "@/components/dropdown";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const SelectGoods: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const pageSize = 10;
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const [filter, setFilter] = useState({ group_id: 0, type: 0, sys: 0 });
  const getList = (page, refresh = false, _filter = filter)=>{

    let obj:any = {
      page: page,
      page_size: pageSize,
      state: 1,
      group_id: _filter.group_id,
      type: _filter.type,
      sys_type: _filter.sys
    };

    if(refresh){
      setPage(1);
      setTotal(0);
      setErr(false);
      setPageList([]);
      setLoading(true);
    }
    shopApi.goods.page(obj).then(res=>{
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

  const [groupList, setGroupList] = useState<any[]>([]);
  const getGoodsGroup = () =>{
    if(groupList.length === 0){
      shopApi.group.page({ page: 1, page_size: 999, pid: 0 }).then(res=>{
        if(res && res.code === 0){
          const list = res.data.list ? res.data.list : [];
          let _tempGroupList = JSON.parse(JSON.stringify(list));
          _tempGroupList.unshift({ name: "全部分组", id: 0 });
          const temp = list2Tree(_tempGroupList);
          setGroupList(temp);
        }
      });
    }
  };

  const [mode, setMode] = useState("");
  const [refs, setRefs] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [multiple, setMultiple] = useState(false);
  useEffect(()=>{
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _mode = _params?.mode;
      const _multiple = !!_params?.multiple && (_params?.multiple === "true" || _params?.multiple === true);
      const _ids = _params?.ids;
      const _filter = {
        group_id: Number(_params?.group_id || "0"),
        type: Number(_params?.type || "0"),
        sys: Number(_params?.sys || "0")
      };
      setFilter(_filter);
      setRefs(_refs);
      setMode(_mode);
      setMultiple(_multiple);
      if(!!_ids && !!JSON.parse(_ids)){
        setSelected(JSON.parse(_ids));
      }else{
        setSelected(_multiple ? [] : null);
      }
      getGoodsGroup();
      getList( 1,true, _filter);
    }else{
      setErr(true);
    }
  },[]);

  const handleConfirm = (id = 0) => {
    if(multiple && selected.length === 0){
      Taro.showToast({ title: "请选择商品", icon: "none" });
      return;
    }
    const _ids = !!id ? id : selected;
    if(!!mode){
      eventCenterTrigger(refs, { ids: _ids, type: mode });
    }else{
      eventCenterTrigger(refs, _ids);
    }
    navigateTo({ method: "navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      {groupList.length > 0 ? (
        <Dropdown border="top-bottom">
          <Dropdown.item
            title="全部分组"
            value={filter.group_id}
            options={groupList}
            format={{ label: "name", value: "id" }}
            columns={2}
            hasChildren
            onChange={(val)=>{
              setFilter((prevState)=>{
                let temp = JSON.parse(JSON.stringify(prevState));
                temp.group_id = val;
                return temp;
              });
              const _filter = {
                group_id: val,
                type: filter.type,
                sys: filter.sys
              };
              getList( 1,true, _filter);
            }}
          />
        </Dropdown>
      ) : null}
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
                    align="start"
                    image
                    card
                    title
                    row={2}
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
                        contentStyle={{ display: "flex", flexDirection: "row" }}
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
                        <Image
                          style={{
                            width: addUnit(44),
                            height: addUnit(44),
                            borderRadius: addUnit(4),
                            marginRight: addUnit(12),
                            backgroundColor: "#f7f8f8"
                          }}
                          src={base.file_host + "/" + item.cover}
                          mode="aspectFill"
                        />
                        <View style={{ flex: 1 }}>
                          <View style={{ fontSize: addUnit(14), lineHeight: addUnit(18) }}>
                            {item.name}
                          </View>
                          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: addUnit(6) }}>
                            <View style={{ fontSize: addUnit(16), color: "#ff2340" }}>
                              {`¥${formatPrice(item?.min_price || 0)}`}
                            </View>
                            <View style={{ fontSize: addUnit(12), color: "#999" }}>
                              {`总库存${item?.total_stock_num || 0}`}
                            </View>
                          </View>
                        </View>
                      </Checkbox>
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty image="goods" desc="暂无相关商品">
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

export default SelectGoods;
