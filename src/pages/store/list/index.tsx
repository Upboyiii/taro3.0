import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Image, View, ScrollView, Text } from "@tarojs/components";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { userApi } from "@/api/user";
import { base } from "@/api/config";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { setStoreInfo } from "@/store/actions/user";
import { refStoreConfig } from "@/utils/app";
import store from "@/store";
import storeConfig from "@/locales/storeConfig";
import Button from "@/components/button";
import Tag from "@/components/tag";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Divider from "@/components/divider";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

// 认证类型
const certTypes = storeConfig.certTypes;
const storeState = { 0: "店铺还未初始化", 1: "正常", 2: "打烊", 3: "停用", 4: "初始化异常", 5: "其他组织" };
const delStates = { 1: "等待删除", 2: "删除中", 3: "删除错误", 4: "已删除" };

const StoreList: FC = () => {
  const [bem] = createNamespace("item", "store");

  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<any>(1);
  const [isPage, setIsPage] = useState(true);
  const [storeList, setStoreList] = useState<any>([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const getList = (page, loading = false)=>{
    if(loading){
      setErr(false);
      setStoreList([]);
      setLoading(true);
    }
    userApi.admin.adminList({ page:page,page_size:pageSize,order_key:"-created_at"  }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          setTotal(res.data?.total || 0);
          if (page * pageSize > res.data.total) {
            setIsPage(false);
          }
          setStoreList(list => {
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
    });
  };

  useEffect(()=>{
    getList(page, true);
  },[]);

  const onScrollToLower = () => {
    if(isPage){
      setPage(val=>{
        let _page = val + 1;
        getList(_page);
        return _page;
      });
    }
  };

  const changeStore = (row)=>{
    if(row.chain > 1){
      navigateTo({ method:"navigateTo",url:"/pages/store/list-detail/index?coid=" + row.coid });
    }else {
      if(row.store_id && row.store_state === 1){
        store.dispatch(setStoreInfo(row));
        // 获取更新店铺配置
        refStoreConfig().then(()=>{
          eventCenterTrigger("home",{ type:"login" });
          Taro.reLaunch({ url:"/pages/index/index" });
        }).catch(()=>{
          Taro.showToast({ title:"店铺配置获取失败" ,icon:"error" });
        });
      }else {
        Taro.showToast({ title:"店铺状态不为正常" ,icon:"error" });
      }
    }

  };

  return (
    <View className="flex-page">
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY onScrollToLower={onScrollToLower}>
        {loading ? (
          <React.Fragment>
            {Array(5)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    image
                    imageShape="round"
                    imageSize={48}
                    title
                    row={1}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {storeList.length > 0 ? storeList.map((item: any, index) => {
                  return (
                    <View
                      className={classnames("card", bem({ selected: item.chain === 2 }))}
                      key={index}
                      style={index === 0 ? { marginTop: addUnit(12) } : {}}
                      onClick={() => {
                        changeStore(item);
                      }}
                    >
                      <Image
                        className={classnames(bem("image"))}
                        src={base.file_host + "/" + item.logo}
                        mode="aspectFill"
                      />
                      <View className={classnames(bem("content"))}>
                        <View className={classnames(bem("name"))}>
                          {/* @ts-ignore*/}
                          <Text className={classnames(bem("title"))} numberOfLines={1}>{item.name}</Text>
                          {item.store_id === store.getState().storeInfo?.store_id && <Tag size="small" className={classnames(bem("current"))} plain={false} type="primary">当前店铺</Tag>}
                        </View>
                        <View className={classnames(bem("auth"))}>
                          <Text style={{ fontSize: 12, color: "#666" }}>主体信息：</Text>
                          {item.cert_type > 0 ? (
                            <React.Fragment>
                              <Text style={{ fontSize: 12, color: "#00c35c" }}>{certTypes[item?.cert_type || 5]}</Text>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              {/* @ts-ignore*/}
                              <Text className="text-gray" style={{ fontSize: 12 }}>未认证</Text>
                            </React.Fragment>
                          )}
                        </View>
                        <View className={classnames(bem("info"))}>
                          <View className={classnames(bem("tags"))}>
                            {item.chain === 2 ? (
                              <Tag type="primary" className={classnames(bem("tag"))}>多店</Tag>
                            ) : (
                              <Tag type="info" className={classnames(bem("tag"))}>单店</Tag>
                            )}
                            {(item.store_state === 0 || !item.store_state) ? (
                              <Tag type="error" className={classnames(bem("tag" ))}>店铺还未初始化</Tag>
                            ) : item.store_state === 5 && item.del ? (
                              <Tag type="error" className={classnames(bem("tag" ))}>{delStates[item.del.state]}</Tag>
                            ) : (
                              <Tag
                                className={classnames(bem("tag"))}
                                type={item.store_state === 4 ? "error" : "default"}
                                disabled={item.store_state === 2 || item.store_state === 3}
                                textColor={item.store_state === 1 ? "#333" : undefined}
                              >
                                {storeState[item.store_state]}
                              </Tag>
                            )}
                          </View>
                          {!!item.type_class_name && item.type_class_name.length > 0 ? (
                            <Tag className={classnames(bem("genre"))} plain={false}>
                              {item.type_class_name.map((gen, idx) => {
                                return (
                                  <React.Fragment key={`gen-${index}-${idx}`}>
                                    {/* @ts-ignore*/}
                                    {idx !== 0 && <Text className={classnames(bem("genre-dot"))}>·</Text>}
                                    {/* @ts-ignore*/}
                                    <Text className={classnames(bem("genre-item"))}>{gen}</Text>
                                  </React.Fragment>
                                );
                              })}
                            </Tag>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );}
                ) : (
                  <Empty desc="暂无相关店铺" image="store" />
                )}
                {total > pageSize ? (
                  <React.Fragment>
                    {total > page * pageSize ? (
                      <Divider>{loading ? "加载中..." : "下拉加载更多..."}</Divider>
                    ) : (
                      <Divider>没有更多啦~</Divider>
                    )}
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/store/create/index/index" });
          }}
        >
          创建店铺
        </Button>
      </BottomBar>
    </View>
  );
};

export default StoreList;
