import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { pluginApi } from "@/api/base";
import { formatPrice } from "@/utils/common";
import ScrollView from "@/components/scroll-view";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Checkbox from "@/components/checkbox";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const SelectCoupon: FC = () => {

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
    pluginApi.page({
      page: page,
      page_size: pageSize,
      plugin_id: 164,
      plugin_label: "page",
      state: 1
    }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          // console.log(res.data?.list,"res.data?.list");
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
      Taro.showToast({ title: "请选择赠品", icon: "none" });
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

  const faceAmount = (item) => {
    let content: any = null;
    switch (item.type) {
      case 1:
        // 满减
        // content = (
        //   <React.Fragment>
        //     <Text className={classnames(bem("small","currency"))}>¥</Text>
        //     <Text className={classnames(bem("value"))}>{formatAmount(item.discount.cut_money)}</Text>
        //   </React.Fragment>
        // );
        content = "满减" + formatPrice(item?.discount?.cut_money || 0) + "元";
        break;
      case 2: // 折扣
        // content = (
        //   <React.Fragment>
        //     <Text className={classnames(bem("value"))}>{formatDiscount(item.discount.discount)}</Text>
        //     <Text className={classnames(bem("small","unit"))}>折</Text>
        //   </React.Fragment>
        // );
        content = "打" + ((item?.discount?.discount || 0) / 10).toFixed(1) + "折";
        break;
      case 3: // 随机减
        // content = (
        //   <React.Fragment>
        //     <Text className={classnames(bem("small","currency"))}>¥</Text>
        //     <Text className={classnames(bem("value"))}>{formatAmount(item.discount.min_money)}</Text>
        //     <Text className={classnames(bem("small","to"))}>~</Text>
        //     <Text className={classnames(bem("value"))}>{formatAmount(item.discount.max_money)}</Text>
        //   </React.Fragment>
        // );
        content = "随机减" + formatPrice(item?.discount?.min_money || 0) + "~" + formatPrice(item?.discount?.max_money || 0) + "元";
        break;
      case 4:
        // content = <Text className={classnames(bem("dui"))}>兑换券</Text>;
        content = "指定商品兑换券";
        break;
      default:
        content = null;
        break;
    }
    return content;
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
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[48,12]}
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
                        cell
                        border={false}
                        labelPosition="right"
                        labelStyle={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                        label={
                          <React.Fragment>
                            <Tag
                              style={{ marginRight: addUnit(8) }}
                              plain={false}
                              type={item.type === 1 ? "success" : item.type === 2 ? "primary" : item.type === 3 ? "warning" : "info"}
                            >
                              {["满减券", "折扣券", "随机金额券", "商品兑换券"][item.type - 1]}
                            </Tag>
                            <Text style={{ fontSize: addUnit(16) }}>{item.name}</Text>
                          </React.Fragment>
                        }
                        descStyle={{ fontSize: addUnit(14), marginTop: addUnit(8), color: "#ff2340" }}
                        desc={faceAmount(item)}
                        // desc={`${item.limit_num === -1 ? "每人不限次数领取" : `每人限领${item.limit_num}次`}`}
                        checked={(!multiple && selected === item.id) || (multiple && selected.indexOf(item.id) > -1 )}
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
              <Empty image="goods" desc="暂无相关优惠券">
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

export default SelectCoupon;
