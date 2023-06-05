import React, { FC, useEffect, useState } from "react";
import Taro, {  useRouter } from "@tarojs/taro";
import { Image, View } from "@tarojs/components";
import { Text } from "react-native";
import { addUnit, createNamespace } from "@/components/utils";
import { refStoreConfig, refStoreShopConfig } from "@/utils/app";
import { eventCenterTrigger } from "@/utils/library";
import { userApi } from "@/api/user";
import { base } from "@/api/config";
import { setStoreInfo } from "@/store/actions/user";
import storeConfig from "@/locales/storeConfig";
import store from "@/store";
import Tag from "@/components/tag";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import classnames from "classnames";
import "../list/index.scss";

// 认证类型
const certTypes = storeConfig.certTypes;
const storeState = { 0: "店铺还未初始化", 1: "正常", 2: "打烊", 3: "停用", 4: "初始化异常", 5: "其他组织" };
const delStates = { 1: "等待删除", 2: "删除中", 3: "删除错误", 4: "已删除" };

const StoreList: FC = () => {
  const [bem] = createNamespace("item", "store");
  const router = useRouter();
  const pageSize = 99;
  const [page] = useState(1);
  const [storeList, setStoreList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    getList(router?.params?.coid);
  },[router?.params?.coid]);

  const getList = (coid)=>{
    setStoreList([]);
    setLoading(true);
    userApi.admin.adminList({ page,page_size:pageSize,coid:parseInt(coid)  }).then(res=>{
      if(!!res && res.code === 0){
        if (res.data.list && res.data.list.length > 0) {
          setStoreList(re=>{
            re = re.concat(res.data.list);
            return re;
          });
        }
      }
    }).finally(()=>{
      setLoading(false);
    });
  };

  const changeStore = (row)=>{
    if(row.store_id && row.store_state === 1){
      store.dispatch(setStoreInfo(row));
      // 获取更新店铺配置
      refStoreConfig().then(()=>{
        // 分店获取商品配置
        if(row.chain > 1){
          refStoreShopConfig().then();
        }
        eventCenterTrigger("home",{ type:"login" });
        Taro.reLaunch({ url:"/pages/index/index" });
      }).catch(()=>{
        Taro.showToast({ title:"店铺配置获取失败" ,icon:"error" });
      });
    }else {
      Taro.showToast({ title:"店铺状态不为正常" ,icon:"error" });
    }
  };

  return (
    <React.Fragment>
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
          {storeList.length ? storeList.map((item: any, index) => {
            return (
              <View
                className={classnames("card", bem())}
                key={index}
                style={index === 0 ? { marginTop: addUnit(12) } : {}}
                onClick={() => {
                  changeStore(item);
                }}
              >
                <Image
                  className={classnames(bem("image"))}
                  // @ts-ignore
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
                    {/* @ts-ignore*/}
                    <Text className="text-gray" style={{ fontSize: 12 }}>主体信息：</Text>
                    {item.cert_type > 0 ? (
                      <React.Fragment>
                        {/* @ts-ignore*/}
                        <Text className="text-success" style={{ fontSize: 12 }}>{certTypes[item.cert_type ?? 5]}</Text>
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
                      {item.mode === 1 ? (
                        <Tag type="primary" className={classnames(bem("tag"))}>主店</Tag>
                      ) : (
                        <Tag type="info" className={classnames(bem("tag"))}>分店</Tag>
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
            );
          }) : (
            <Empty desc="暂无相关店铺" image="store" />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default StoreList;
