import React, { FC, useEffect, useState } from "react";
import { Image, Text, View } from "@tarojs/components";
import Taro, {  useRouter } from "@tarojs/taro";
import { addUnit, createNamespace } from "@/components/utils";
import { userApi } from "@/api/user";
import { base } from "@/api/config";
import { setStoreInfo } from "@/store/actions/user";
import store from "@/store";
import Tag from "@/components/tag";
import Empty from "@/components/empty";
import classnames from "classnames";
import "../list/index.scss";
import Skeleton from "@/components/skeleton";
import storeConfig from "@/locales/storeConfig";
import { eventCenterTrigger } from "@/utils/library";

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
    console.log(row,"row");
    if(row.store_id){
       store.dispatch(setStoreInfo(row));
      eventCenterTrigger("isLogin");
      Taro.reLaunch({ url:"/pages/index/index" });
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
          {storeList.length > 0 ? storeList.map((item: any, index) => {
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
                    <Text className={classnames(bem("title"))}>{item.name}</Text>
                    {item.store_id === store.getState().storeInfo?.store_id && <Tag size="small" className={classnames(bem("current"))} plain={false} type="primary">当前店铺</Tag>}
                  </View>
                  <View className={classnames(bem("auth"))}>
                    <Text className="text-gray" style={{ fontSize: addUnit(12) }}>主体信息：</Text>
                    {item.cert_type > 0 ? (
                      <Text className="text-success" style={{ fontSize: addUnit(12) }}>{certTypes[item.cert_type ?? 5]}</Text>
                    ) : (
                      <Text className="text-gray" style={{ fontSize: addUnit(12) }}>未认证</Text>
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
                              {idx !== 0 && <Text className={classnames(bem("genre-dot"))}>·</Text>}
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
