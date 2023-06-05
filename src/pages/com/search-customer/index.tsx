import React, { FC, useState, useEffect } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo, getStorage, setStorage } from "@/utils/library";
import { formatPrice } from "@/utils/common";
import { customerApi } from "@/api/co_admin";
import Checkbox from "@/components/checkbox";
import Empty from "@/components/empty";
import Skeleton from "@/components/skeleton";
import Field from "@/components/field";
import BottomBar from "@/components/bottom-bar";
import Button from "@/components/button";
import Tag from "@/components/tag";
import "./index.scss";

const SearchCustomer: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const [err, setErr] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchIng, setSearchIng] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any[]>([]);

  const [type, setType] = useState("");
  const [refs, setRefs] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [uid, setUid] = useState(false);
  const [multiple, setMultiple] = useState(false);
  useEffect(()=>{
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _type = _params?.type;
      const _multiple = !!_params?.multiple && (_params?.multiple === "true" || _params?.multiple === true);
      const _ids = _params?.ids;
      const _uid = !!_params?.uid && (_params?.uid === "true" || _params?.uid === true);
      setRefs(_refs);
      setType(_type);
      setMultiple(_multiple);
      setUid(_uid);
      !customer && setCustomer(_multiple ? [] : null);
      if(!!_ids && !!JSON.parse(_ids)){
        setSelected(JSON.parse(_ids));
      }else{
        setSelected(_multiple ? [] : null);
      }
      if(!!_params?.refs && !!_ids && !!JSON.parse(_ids)){
        getStorage(_params?.refs).then(res=>{
          setPageList(res?.list || []);
          setSearchValue(res?.search || "");
        });
      }
    }else{
      setErr(true);
    }
  },[]);

  const searchUser = (searchValue: string)=>{
    if(searchValue){
      setLoading(true);
      customerApi.customer.query({ keyword: searchValue, reserve: true }).then(res=>{
        if(res.code === 0){
          if (res.data?.info && res.data.info?.length > 0) {
            if(!!_params?.refs){
              setStorage(_params?.refs, { list: res.data.info, search: searchValue });
            }
            setPageList(res.data.info);
          } else {
            setPageList([]);
          }
        }
      }).finally(()=>{
        setLoading(false);
        setSearchIng(true);
      });
    }else{
      Taro.showToast({ title: "请输入用户昵称/账号/手机号码", icon:"none" });
    }
  };

  const handleCustomer = (val, item) => {
    const _id = uid ? item.uid : item.id;
    if(!multiple){
      setSelected(_id);
      setCustomer(item);
      handleConfirm(_id, item);
    }else{
      let _customer = customer;
      setSelected(prevState=>{
        let temp = JSON.parse(JSON.stringify(prevState));
        if(val){
          if(temp.indexOf(_id) === -1){
            temp.push(_id);
            _customer.push(item);
          }
        }else{
          if(temp.indexOf(_id) > -1){
            temp.splice(temp.indexOf(_id), 1);
            _customer.splice(temp.indexOf(_id), 1);
          }
        }
        setCustomer(_customer);
        return temp;
      });
    }
  };

  const handleConfirm = (id = 0, item = null) => {
    if(multiple && selected.length === 0){
      Taro.showToast({ title: "请选择用户", icon: "none" });
      return;
    }
    const _ids = !!id ? id : selected;
    const _customer = !!item ? item : selected;
    let params:any = {
      ids: _ids,
      customer: _customer
    };
    if(!!type){
      params.type = type;
    }
    eventCenterTrigger(refs, params);
    navigateTo({ method: "navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View className="card" style={{ marginTop: addUnit(12) }}>
        <Field
          type="search"
          clearable
          align="center"
          icon={require("@/assets/icons/search.png")}
          value={searchValue}
          placeholder="搜索用户昵称/账号/手机号码"
          onChange={(val)=>{
            // if(!val) setPageList([]);
            setSearchValue(val);
          }}
          onConfirm={(val)=>{
            searchUser(val.detail.value);
          }}
        />
      </View>
      {pageList.length > 0 ? <View className="card-title" style={{ marginTop: addUnit(4) }}>搜索结果</View> : null}
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
                    imageSize={24}
                    imageShape="round"
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[48, 12]}
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
                    {pageList.map((item: any, index) => {
                      console.log(item.uid);
                      const _id = uid ? item.uid : item.id;
                      return (
                        <View
                          className="card"
                          key={index}
                          onClick={() => {
                            navigateTo({ url: "/pages/customer/prepay/edit/index", method: "navigateTo", params: { form: item } });
                          }}
                        >
                          <Checkbox
                            cell
                            border={index !== 0}
                            key={item.id}
                            checked={(!multiple && selected === _id) || (multiple && selected.indexOf(_id) > -1 )}
                            labelStyle={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                            label={
                              <React.Fragment>
                                <View style={{ fontSize: addUnit(16) }}>{`${item.name}-${item.phone}`}</View>
                                {!item.state || item.state === 2 ? (
                                  <Tag
                                    size="small"
                                    plain={false}
                                    style={{ marginLeft: addUnit(8) }}
                                    type={!item.state ? "info" : item.state === 2 ? "error" : "info"}
                                  >
                                    {!item.state ? "邀请中" : item.state === 2 ? "已拒绝" : ""}
                                  </Tag>
                                ) : null}
                              </React.Fragment>
                            }
                            desc={`余额：¥${formatPrice(item.reserve)}`}
                            // descStyle={{ fontSize: addUnit(14), color: "#333" }}
                            disabled={!item.uid}
                            onChange={(val)=>{
                              handleCustomer(val, item);
                            }}
                          />
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc={searchIng ? "未找到相关用户" : "请输入关键词搜索用户"} image="user" />
                )}
              </React.Fragment>
            ) : (
              <Empty desc="参数错误，请联系管理员" image="error" />
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

export default SearchCustomer;

