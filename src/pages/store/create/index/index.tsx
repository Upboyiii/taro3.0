// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { View, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { addUnit, createNamespace, scrollViewStyle } from "@/components/utils";
import { userApi } from "@/api/user";
import Cell from "@/components/cell";
import Skeleton from "@/components/skeleton";
import classnames from "classnames";
import "./index.scss";
import { base } from "@/api/config";

const CreateStore: FC = () => {
  const [bem] = createNamespace("store", "create");

  const [loading, setLoading] = useState(false);
  const [typeList, setTypeList] = useState<any>([]);
  const getTypeSelect = () => {
    if (typeList.length === 0) {
      setLoading(true);
      userApi.admin.typeList().then(resp => {
        if(!!resp && resp.code === 0){
          setTypeList(resp?.data || []);
        }
      }).finally(()=>{
        setLoading(false);
      });
    }
  };

  useEffect(()=>{
    getTypeSelect();
  },[]);

  return (
    <View className="flex-page" style={{ backgroundColor: "#f7f8f8", flex: 1 }}>
      {/* <View className={classnames(bem("header"))}>*/}
      {/*  <View className={classnames(bem("header-title"))}>创建店铺</View>*/}
      {/*  <View className={classnames(bem("header-desc"))}>3步极速开店</View>*/}
      {/* </View>*/}
      {/* <View className={classnames(bem("title"))}>选择主营业务</View>*/}
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
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
            {typeList.map((group: any, index) => {
              if(!group.children || group.children.length === 0) return null;
              return (
                <View
                  className={classnames("card", bem())}
                  key={`group-${index}`}
                  style={index === 0 ? { marginTop: addUnit(12) } : {}}
                >
                  {typeList.length > 1 ? (
                    <View className="card-header card-header--border">
                      <View className="card-header__title">{group.name}</View>
                    </View>
                  ) : null}
                  <View className={classnames(bem("list"))}>
                    {group.children.map((item: any, idx) => {
                      return (
                        <Cell
                          border={idx !== 0}
                          key={`item-${index}-${idx}`}
                          className={classnames(bem("item"))}
                          style={{ paddingRight: addUnit(20) }}
                          borderStyle={{ left: addUnit(76) }}
                          icon={base.file_host + "/" + item.logo}
                          iconStyle={{ width: addUnit(48), height: addUnit(48), borderRadius: addUnit(8) }}
                          title={item.name}
                          label={item.note ?? "-"}
                          size="large"
                          arrow
                          clickable
                          onClick={()=>{
                            Taro.navigateTo({
                              url: "/pages/store/create/mode/index?type=" + item.id
                            });
                          }}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default CreateStore;
