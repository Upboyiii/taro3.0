import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { base } from "@/api/config";
import { formatPrice } from "@/utils/common";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { shopApi } from "@/api/co_admin";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Cell from "@/components/cell";
import Empty from "@/components/empty";
import Field from "@/components/field";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const DiscountGoods: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const [type, setType] = useState("");
  const [refs, setRefs] = useState("");
  const [ids, setIDs] = useState<number[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [pageList, setPageList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      setRefs(_params?.refs || "");
      setType(_params?.type || "");
      if(!!_params?.list && !!JSON.parse(_params?.list)){
        const _list = JSON.parse(_params?.list);
        const _ids = _list.map(item=>item.goods_id);
        setIDs(_ids);
        setSelected(_list);
      }
    }
  }, []);

  useEffect(() => {
    if(ids.length > 0){
      getGoodsList();
    }
  }, [ids]);

  const getGoodsList = () =>{
    setLoading(true);
    setPageList([]);
    shopApi.goods.page({ page: 1, page_size: 9999, state: 1, sys_type: -1, goods_ids: ids })
      .then(res=>{
        if(!!res && res.code === 0){
          // console.log(res?.data?.list,"res?.data?.list");
          const _list = (res?.data?.list || []).map(item=>{
            const index = selected.map(sec=>sec.goods_id).indexOf(item.id);
            item.discount_type = 1;
            item.discount_value = "";
            if( index > -1){
              item.discount_type = selected[index]?.discount_type || 1;
              item.discount_value = selected[index].discount_type === 1 ? ((selected[index]?.discount_value || 0) / 10) : formatPrice(selected[index]?.discount_value || 0);
            }
            return item;
          });
          // console.log(_list,"_list");
          setPageList(_list);
        }else{
          Taro.showToast({ title: res?.message || "加载失败", icon: "error" });
          setTimeout(()=>{
            navigateTo({ method:"navigateBack" });
          },800);
        }
      }).catch((res)=>{
        Taro.showToast({ title: res?.message || "加载失败", icon: "error" });
        setTimeout(()=>{
          navigateTo({ method:"navigateBack" });
        },800);
      }).finally(()=>{
        setLoading(false);
      });
  };

  useEffect(() => {
    eventCenterOn("discountGoods", (res) => {
      if(!!res[0]){
        const _ids = res[0] || [];
        setSelected(prevState => {
          let temp = JSON.parse(JSON.stringify(prevState));
          temp = temp.filter(item=>_ids.indexOf(item.goods_id) > -1);
          return temp;
        });
        setIDs(_ids);
        if(_ids.length === 0){
          setPageList([]);
        }
      }
    });
    return () => {
      eventCenterOff("discountGoods");
    };
  }, []);

  const handleValueChange = (val, ref, index) => {
    setPageList(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[index][ref] = val;
      return temp;
    });
  };

  const saveClick = () => {
    let _form = JSON.parse(JSON.stringify(pageList));
    for(let i = 0; i < _form.length; i++){
      const item = _form[i];
      const tips = item.discount_type === 1 ? "优惠折扣" : item.discount_type === 2 ? "减去金额" : "活动价格";
      if(!item.discount_value){
        Taro.showToast({ title: `${item.name}-${tips}不能为空`, icon: "none" });
        return false;
      }else{
        item.discount_value = item.discount_type === 1 ? Number(item.discount_value) * 10 : Number(item.discount_value) * 100;
        if(item.discount_type === 1 && item.discount_value > 99){
          Taro.showToast({ title: `${item.name}-优惠折扣不能大于9.9折`, icon: "none" });
          return false;
        }
        if(item.discount_type !== 1 && item.discount_value > item.min_price){
          Taro.showToast({ title: `${item.name}-${tips}不能大于商品价格${formatPrice(item.min_price)}元`, icon: "none" });
          return false;
        }
      }
    }
    _form = _form.map(item=>{
      return {
        goods_id: item.id,
        discount_type: item.discount_type,
        discount_value: item.discount_value
      };
    });
    // console.log(_form, "_form");

    if(!!type){
      eventCenterTrigger(refs, { list: _form, type: type });
    }else{
      eventCenterTrigger(refs, _form);
    }
    navigateTo({ method: "navigateBack" });

    // let _form = JSON.parse(JSON.stringify(form));
    // if (!_form.name) {
    //   Taro.showToast({ title: "请输入活动名称", icon: "none" });
    //   return;
    // }
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {loading ? (
          <React.Fragment>
            {Array(4)
              .fill("")
              .map((_, i) => {
                return (
                  <View className="card" key={i} style={i === 0 ? { marginTop: addUnit(12) } : {}}>
                    <Skeleton image imageSize={40} title row={1} />
                    <Skeleton border row={2} />
                  </View>
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
                      <Cell
                        align="start"
                        iconSize={40}
                        icon={base.file_host + "/" + item.cover}
                        contentAlign="left"
                      >
                        <View style={{ fontSize: addUnit(14), color: "#333" }}>{item.name}</View>
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: addUnit(4) }}>
                          <View style={{ fontSize: addUnit(14), color: "#ff2340" }}>
                            {`¥${formatPrice(item.min_price)}`}
                          </View>
                          {item.total_stock_num ? (
                            <View style={{ fontSize: addUnit(12), color: "#999" }}>
                              {`总库存：${ item.total_stock_num }`}
                            </View>
                          ) : null}
                        </View>
                      </Cell>
                      <Field
                        required
                        title="优惠方式"
                        titleWidth={90}
                        input={false}
                        value={["打折","减价","指定价格"][item.discount_type - 1]}
                        placeholder="请选择"
                        arrow
                        clickable
                        onClick={()=>{
                          Taro.showActionSheet({
                            itemList: ["打折","减价","指定价格"],
                            success: function (res) {
                              handleValueChange(res.tapIndex + 1, "discount_type", index);
                              // handleValueChange("", "discount_value", index);
                            }
                          });
                        }}
                      />
                      <Field
                        required
                        title={item.discount_type === 1 ? "优惠折扣" : item.discount_type === 2 ? "减去金额" : "活动价格"}
                        titleWidth={90}
                        type="number"
                        value={item.discount_value}
                        placeholder={item.discount_type === 1 ? "请输入折扣" : "请输入金额"}
                        right={item.discount_type === 1 ? "折" : "元"}
                        onChange={(val)=>{
                          handleValueChange(val, "discount_value", index);
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty image="goods" desc="暂无活动商品">
                <Button
                  plain
                  onClick={() => {
                    navigateTo({ url: "/pages/com/goods-select/index", method: "navigateTo", params: { ids: ids, refs: "discountGoods", multiple: true, sys: -1 } });
                  }}
                >
                  添加商品
                </Button>
              </Empty>
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ flex: 1, marginRight: addUnit(12) }}
          hairline
          type="primary"
          loading={loading}
          onClick={() => {
            navigateTo({ url: "/pages/com/goods-select/index", method: "navigateTo", params: { ids: ids, refs: "discountGoods", multiple: true, sys: -1 } });
          }}
        >
          {pageList.length > 0 ? "修改商品" : "添加商品"}
        </Button>
        <Button
          style={{ flex: 1 }}
          type="primary"
          loading={loading}
          onClick={saveClick}
        >
          确定
        </Button>
      </BottomBar>
    </View>
  );
};

export default DiscountGoods;
