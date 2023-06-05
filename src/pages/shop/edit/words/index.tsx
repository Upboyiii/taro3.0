import React, { FC, useEffect, useState } from "react";
import { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const WordsList: FC = () => {
  const _params = getCurrentInstance().router?.params;
  useEffect(()=> {
    if (_params?.words && !!JSON.parse(_params?.words)) {
      setGoodsWordList(JSON.parse(_params?.words));
    }
    setGoodsType(parseInt(_params?.type || "1"));
  },[]);

  const statciWordTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码"];
  const [goodsType, setGoodsType] = useState<number>(1);
  const [goodsWordId, setGoodsWordId] = useState<number>(100);
  const [goodsWordList, setGoodsWordList] = useState<any[]>([]);

  const handleClick = (type, index = -1, item:any = null) => {
    let _item:any = { id: goodsWordId + 1 };
    if(type === "edit"){
      _item = Object.assign({}, _item, item);
    }
    navigateTo({
      method:"navigateTo",
      url: "/pages/shop/edit/words/edit/index",
      params: {
        goodsType: goodsType,
        type: type,
        item: _item,
        index: index
      }
    });
  };

  useEffect(()=>{
    if (!!goodsWordList && goodsWordList.length > 0) {
      let word_ids:any = [];
      goodsWordList.forEach(word => {
        word_ids.push(word.id);
      });
      let staticShopWordId = Math.max(...word_ids);
      setGoodsWordId(staticShopWordId);
    }
  },[goodsWordList]);

  useEffect(()=> {
    eventCenterOn("shopWordEdit",res=>{
      const msg = res[0];
      console.log(msg,"msg");
      let index = -1;
      switch (msg.type) {
        case "add":
          setGoodsWordList(prv=>{
            let row = msg.item;
            let list = [...prv,...[row]];
            return list;
          });
          break;
        case "edit":
          index = msg.index;
          if(index >= 0){
            setGoodsWordList(prv=>{
              let list = JSON.parse(JSON.stringify(prv));
              list.splice(index,1,msg.item);
              return list;
            });
          }
          break;
        case "delete":
          index = msg.index;
          if(index >= 0){
            setGoodsWordList(prv=>{
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
      eventCenterOff("shopWordEdit");
    };
  },[]);

  const saveClick = () => {
    eventCenterTrigger("goodsEdit",{ type: "words", data: goodsWordList });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {goodsWordList.length > 0 ? (
          <React.Fragment>
            {goodsWordList.map((item, index) => {
              return (
                <View key={index} className="card" style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                  <Cell
                    border={false}
                    title={item.name}
                    label={item.describe}
                    extra={<Tag plain={false}>{statciWordTypeList[item.type - 1]}</Tag>}
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
          <Empty desc="暂无相关留言" />
        )}
      </ScrollView>
      <BottomBar>
        {(goodsType !== 6 && goodsWordList.length < 10) || (goodsType === 6 && goodsWordList.length < 3) ? (
          <Button
            style={{ marginRight: addUnit(12) }}
            type="default"
            plain
            onClick={()=>{handleClick("add");}}
          >
            添加留言
          </Button>
        ) : null}
        <Button
          style={(goodsType !== 6 && goodsWordList.length < 10) || (goodsType === 6 && goodsWordList.length < 3) ? { flex: 1 } : { width: "70%" }}
          type="primary"
          onClick={saveClick}
        >
          保存
        </Button>

      </BottomBar>
    </View>
  );
};

export default WordsList;
