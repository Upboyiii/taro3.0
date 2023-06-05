import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Image, Text, View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { defaultToolGroup, defaultToolHot, toolIcons } from "./data";
import { eventCenterTrigger, getStorage, setStorage } from "@/utils/library";
// import { pages } from "@/app.config";
import store from "@/store";
import classnames from "classnames";
import "./index.scss";

const Category: FC = () => {
  const [edit, setEdit] = useState(false);
  const all_key = store.getState().userInfo.info.id + "_" + store.getState().storeInfo.store_id + "_all_menu";
  const common_key = store.getState().userInfo.info.id + "_" + store.getState().storeInfo.store_id + "_common_menu";
  const editConfirm = () => {
    if(edit){
      console.log("保存排序");
      setStorage(common_key,tools);
      eventCenterTrigger("home",{ type:"ref_common_menu",data:tools });
    }
    setEdit(prevState => {
      return !prevState;
    });
  };

  const [toolList, setToolList] = useState<any[]>([]);
  const [toolIDs, setToolIds] = useState<any[]>(defaultToolHot);
  const [tools, setTools] = useState<any[]>([]);
  const toolAction = (type, row) => {
    if(type === "add"){
      setToolIds(list => {
        return [...list,row.id];
      });
      setTools(pre=>{
        return [...pre,row];
      });
    }else if(type === "remove"){
      if(toolIDs.length <= 4){
        Taro.showToast({ title:"至少选择4个常用应用",icon: "none" });
        return false;
      }
      setToolIds(list => {
        const index = list.indexOf(row.id);
        list.splice(index,1);
        setTools(pre=>{
          pre.splice(index,1);
          return [...pre];
        });
        return [...list];
      });
    }
  };
  useEffect(()=>{
    getMenuList();
    getCommonList();
  },[]);

  useEffect(()=>{
    setToolList(prev => {
      const temp = JSON.parse(JSON.stringify(prev));
      temp.map(group => {
        if(group.list && group.list.length > 0){
          return group.list.map(item=>{
            item.checked = toolIDs.indexOf(item.id) > -1;
            return item;
          });
        }
      });
      console.log("temp",temp)
      return temp;
    });
  },[toolIDs]);

  const getCommonList = ()=>{
    getStorage(common_key).then(list=> {
      if (!!list) {
        setTools(list);
        let ids = [];
        list.forEach(item=>{
          if(item.id){
            // @ts-ignore
            ids.push(item.id);
          }
        });
        setToolIds(()=>{
          return [...ids];
        });
      }else{
        setTools([]);
      }
    });
  };

  const getMenuList = ()=>{
    getStorage(all_key).then(list=>{
      if(!!list && list.length > 0){
        let obj = {};
        for(let a = 0; a < list.length;a++){
          if(!obj[list[a].pid]){
            obj[list[a].pid] = [];
          }
          obj[list[a].pid].push(list[a]);
        }
        let tempToolGroup = JSON.parse(JSON.stringify(defaultToolGroup));
        for(let i = 0; i < tempToolGroup.length;i++){
          tempToolGroup[i].list = obj[tempToolGroup[i].id];
        }
        setToolList(()=>{
          return [...tempToolGroup];
        });
      }
    });
  };

  useEffect(()=>{
  },[toolList]);

  return (
    <View style={{ paddingBottom: addUnit(34) }}>
      <View className="card" style={{ marginTop: addUnit(12) }}>
        <View className="card-header">
          <View className="card-header__title">
            常用应用
            {/* {edit ? <Text style={{ fontSize: 12, fontWeight: "normal", color: "#999", marginLeft: 8 }}>拖动可调整顺序</Text> : null}*/}
          </View>
          <View className="card-header__extra tool-edit">
            {edit ? (
              <View
                className={classnames("tool-edit__text","tool-edit__text--cancel")}
                onClick={()=>{
                  setEdit(false);
                }}
              >
                取消
              </View>
            ) : null}
            <View
              className={classnames("tool-edit__text","tool-edit__text--primary")}
              onClick={editConfirm}
            >
              {edit ? "完成" : "编辑"}
            </View>
          </View>
        </View>
        <View className="tool-group">
          {tools.map((item,idx)=>{
            return (
              <View
                className="tool-item"
                key={`hot-${idx}`}
                onClick={()=>{
                  if(edit){
                    toolAction("remove",item);
                  }else{
                    Taro.navigateTo({ url: item.path });
                  }
                }}
              >
                {edit ? (
                  <View className="tool-item__action">
                     <Image
                       className="tool-item__action-icon"
                       src={require("@/assets/category/action/remove.png")}
                       mode="aspectFill"
                     />
                  </View>
                ) : null}
                 <Image className="tool-item__icon" src={toolIcons[item.icon]} mode="aspectFill" />
                <Text className="tool-item__text">{item.title}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {toolList.map((group,index) => {
        if(!group.list || (!!group.list && group.list.length == 0)) return null;
        return (
          <React.Fragment key={`list-${index}`}>
            <View className="card">
              <View className="card-header">
                <View className="card-header__title">{group.name}</View>
              </View>
              <View className="tool-group">
                {group.list.map((item,idx)=>{
                  return (
                    <View
                      className="tool-item"
                      // style={pages.indexOf((item.path).substring(1)) === -1 ? { display: "none" } : {}}
                      key={`item-${index}-${idx}`}
                      onClick={()=>{
                        if(edit){
                          !item.checked && toolAction("add",item);
                        }else{
                          Taro.navigateTo({ url: item.path });
                        }
                      }}
                    >
                      {edit ? (
                        <View className="tool-item__action">
                          {item.checked ? (
                            <Image
                              className="tool-item__action-icon"
                              src={require("@/assets/category/action/checked.png")}
                              mode="aspectFill"
                            />
                          ) : (
                            <Image
                              className="tool-item__action-icon"
                              src={require("@/assets/category/action/add.png")}
                              mode="aspectFill"
                            />
                          )}
                        </View>
                      ) : null}
                      <Image className="tool-item__icon" src={toolIcons[item.icon]} mode="aspectFill" />
                      <Text className="tool-item__text">{item.title}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default Category;
