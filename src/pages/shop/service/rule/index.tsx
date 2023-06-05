import React, { FC, useEffect, useState } from "react";
import { useRouter } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { formatPrice } from "@/utils/common";
import { base } from "@/api/config";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ServiceRuleList: FC = () => {
  const route = useRouter();

  useEffect(()=>{
    if(route.params?.rule_sku){
      setServiceRuleList(()=>{
        return JSON.parse(route.params?.rule_sku || "[]");
      });
    }
    eventCenterOn("serviceRuleEdit",(res)=>{
      const msg = res[0];
      let index = -1;

      console.log(msg,"serviceRuleEdit");

      switch (msg.type) {
        case "add":
          setServiceRuleList(prv=>{
            let sku_id = 1001;
            let row = msg.item;
            if(prv.length > 0){
              sku_id = prv[prv.length - 1].sku_id;
              row.sku_id = parseInt(String(sku_id)) + 1;
            }else {
              row.sku_id = sku_id;
            }
            let list = [...prv,...[row]];
            return list;
          });
          break;
        case "edit":
          index = msg.index;
          if(index >= 0){
            setServiceRuleList(prv=>{
              let list = JSON.parse(JSON.stringify(prv));
              list.splice(index,1,msg.item);
              return list;
            });
          }
          break;
        case "delete":
          index = msg.index;
          if(index >= 0){
            setServiceRuleList(prv=>{
              let list = JSON.parse(JSON.stringify(prv));
              list.splice(index,1);
              return list;
            });
          }
          break;
        default:
          break;
      }
    });
    return () => {
      eventCenterOff("serviceRuleEdit");
    };
  },[]);

  const [serviceRuleList, setServiceRuleList] = useState<any[]>([]);
  const handleClick = (type, index = -1, item:any = null) => {
    let params = { type, index };
    if(item){
      params["item"] = item;
    }
    navigateTo({ method:"navigateTo",url:"/pages/shop/service/rule/edit/index",params: params });
  };
  const saveClick = () => {
    eventCenterTrigger("serviceEdit",{ type:"rule_sku", data: serviceRuleList });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        <React.Fragment>
          {serviceRuleList.length > 0 ? (
            <React.Fragment>
              {serviceRuleList.map((item, index) => {
                return (
                  <View className="card" key={index} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                    <Cell
                      border={false}
                      icon={!!item.cover ? base.file_host + "/" + item.cover : null}
                      title={item.name}
                      content={!!item.price ? `¥${formatPrice(item.price)}` : ""}
                      contentStyle={{ color: "#ff2340" }}
                      clickable
                      arrow
                      onClick={()=>{
                        handleClick("edit", index, item);
                      }}
                    />
                  </View>
                );
              })}
            </React.Fragment>
          ) : (
            <Empty desc="暂无相关服务项目" />
          )}
        </React.Fragment>
      </ScrollView>
      <BottomBar>
        <Button
          style={{ marginRight: addUnit(12) }}
          type="default"
          plain
          onClick={()=>{handleClick("add");}}
        >
          新增服务项目
        </Button>
        <Button
          style={{ flex: 1 }}
          type="primary"
          onClick={saveClick}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default ServiceRuleList;
