import React, { FC, useEffect, useState } from "react";
import { useRouter } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const ServiceInfoList: FC = () => {

  const route = useRouter();
  useEffect(()=> {
    if (route.params?.word) {
      setServiceWordList(()=>{
        // @ts-ignore
        return JSON.parse(route.params?.word);
      });
    }
    eventCenterOn("serviceWordEdit",res=>{
      const msg = res[0];
      let index = -1;
      switch (msg.type) {
        case "add":
          setServiceWordList(prv=>{
            let label = 1001;
            let row = msg.item;
            if(prv.length > 0){
              label = prv[prv.length - 1].label;
              row.label = String( parseInt(String(label)) + 1);
            }else {
              row.label = String(label);
            }
            let list = [...prv,...[row]];
            return list;
          });
          break;
        case "edit":
          index = msg.index;
          if(index >= 0){
            setServiceWordList(prv=>{
              let list = JSON.parse(JSON.stringify(prv));
              list.splice(index,1,msg.item);
              return list;
            });
          }
          break;
        case "delete":
          index = msg.index;
          if(index >= 0){
            setServiceWordList(prv=>{
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
      eventCenterOff("serviceWordEdit");
    };
  },[]);

  const serviceInfoTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码","地图位置"];
  const [serviceWordList, setServiceWordList] = useState<any>([]);

  const handleClick = (type, index = -1, item:any = null) => {
    let params = { type, index };
    if(item){
      params["item"] = item;
    }
    navigateTo({ method:"navigateTo", url:"/pages/shop/service/info/edit/index",params:params });
  };

  const saveClick = () => {
    eventCenterTrigger("serviceEdit",{ type:"word", data: serviceWordList });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {serviceWordList.length > 0 ? (
          <React.Fragment>
            {serviceWordList.map((item, index) => {
              return (
                <View key={item.label} className="card" style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                  <Cell
                    border={false}
                    title={item.name}
                    label={item.describe}
                    extra={
                      <Tag plain={false}>{serviceInfoTypeList[item.type - 1]}</Tag>
                    }
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
      </ScrollView>
      <BottomBar>
        <Button
          style={{ marginRight: addUnit(12) }}
          type="default"
          plain
          onClick={()=>{handleClick("add");}}
        >
          添加服务信息
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

export default ServiceInfoList;
