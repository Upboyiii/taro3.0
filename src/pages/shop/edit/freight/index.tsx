import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { shopApi } from "@/api/co_admin";
import Radio from "@/components/radio";
import "./index.scss";
import Switch from "@/components/switch";
import Field from "@/components/field";
import Button from "@/components/button";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import Empty from "@/components/empty";
import Skeleton from "@/components/skeleton";

const GoodsFreight: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const getList = (_goodType = 1)=>{
    setErr(false);
    setPageList([]);
    setLoading(true);
    if(_goodType === 1){
      shopApi.express.page({ simple: true, page: 1, page_size: 9999 })
        .then(res=>{
          if(!!res && res.code === 0){
            setPageList(res.data?.list || []);
          }else{
            setErr(true);
          }
        }).catch(()=>{
        setErr(true);
      }).finally(()=>{
        setLoading(false);
      });
    }else{
      shopApi.sameCity.page({ simple: true, page: 1, page_size: 9999 })
        .then(res=>{
          if(!!res && res.code === 0){
            setPageList(res.data?.list || []);
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

  const [showPrice, setShowPrice] = useState(true);
  const [freightPrice, setFreightPrice] = useState<any>("");
  const [freightID, setFreightID] = useState(null);
  const [type, setType] = useState("");
  const [refs, setRefs] = useState("");
  useEffect(()=>{
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _type = _params?.type;
      const _goodType = parseInt(_params?.goodType || "1");
      const _data = _params?.data;
      const _price = _params?.price && _params?.price === "false";
      if(_price){
        Taro.setNavigationBarTitle({ title: "选择运费模板" });
      }
      setRefs(_refs);
      setType(_type);
      setShowPrice(!_price);
      if(!!_data && !!JSON.parse(_data)){
        const _freight = JSON.parse(_data);
        setFreightID(_freight?.tpl_id || null);
        setFreightPrice(_freight?.price ? Number(_freight?.price) : "");
      }
      getList(_goodType);
    }else{
      setErr(true);
    }
  },[]);

  const handleClick = (id) => {
    let _freight = {
      price: -1,
      tpl_id: id
    };
    if(id === 0){
      _freight.tpl_id = null;
      if(!freightPrice){
        Taro.showToast({ title: "运费不能为空", icon: "none" });
        return;
      }else{
        _freight.price = Number(freightPrice);
      }
    }else{
      _freight.tpl_id = id;
    }
    if(!!type){
      eventCenterTrigger(refs, { data: _freight, type: type });
    }else{
      eventCenterTrigger(refs, _freight);
    }
    navigateTo({ method: "navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!loading ? (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {showPrice ? (
                  <React.Fragment>
                    <View className="card" style={{ marginTop: addUnit(12) }}>
                      <Field
                        border={false}
                        input={false}
                        value="统一运费"
                        right={
                          <Switch
                            checked={freightPrice !== -1}
                            inactiveValue={-1}
                            activeValue=""
                            onChange={setFreightPrice}
                          />
                        }
                      />
                      {freightPrice !== -1 ? (
                        <Field
                          required
                          title="运费"
                          titleWidth={100}
                          type="number"
                          placeholder="请输入运费"
                          value={freightPrice}
                          right="元"
                          onChange={setFreightPrice}
                        />
                      ) : null}
                    </View>
                    {freightPrice !== -1 ? (
                      <View className="bottom-bar">
                        <Button
                          style={{ width: "70%" }}
                          type="primary"
                          onClick={()=>{handleClick(0);}}
                        >
                          确定
                        </Button>
                      </View>
                    ) : null}
                  </React.Fragment>
                ) : null}
                {freightPrice === -1 ? (
                  <React.Fragment>
                    {pageList.length > 0 ? (
                      <React.Fragment>
                        {showPrice ? <View className="card-title">运费模板</View> : null}
                        <View className="card" style={!showPrice ? { marginTop: addUnit(12) } : {}}>
                          {pageList.map((item, index) => {
                            return (
                              <Radio
                                border={index !== 0}
                                cell
                                type="dot"
                                key={item.id}
                                label={item.name}
                                labelPosition="right"
                                desc={item.mode === 1 ? "按件数计费" : "按重量计费"}
                                checked={item.id === freightID}
                                onClick={()=>{handleClick(item.id);}}
                              />
                            );
                          })}
                        </View>
                      </React.Fragment>
                    ) : (
                      <Empty desc="暂无运费模板">
                        <Button
                          hairline
                          onClick={()=>{
                            navigateTo({ method:"navigateBack" });
                          }}
                        >
                          返回
                        </Button>
                      </Empty>
                    )}
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error">
                <Button
                  hairline
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
          <React.Fragment>
            <View className="card" style={{ marginTop: addUnit(12) }}>
              {Array(2)
                .fill("")
                .map((_, i) => {
                  return (
                    <Skeleton
                      key={i}
                      border={i !== 0}
                      title
                      action
                      actionSize={[48,16]}
                    />
                  );
                })}
            </View>
            {Array(4)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    style={i === 0 ? { marginTop: 0 } : {}}
                    card
                    image
                    imageSize={24}
                    imageShape="round"
                    title
                    row={1}
                    rowWidth={160}
                  />
                );
              })}
          </React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default GoodsFreight;
