import React, { FC, Fragment, useEffect, useState } from "react";
import { View, ScrollView, Picker } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { navigateTo } from "@/utils/library";
import { settingApi } from "@/api/co_admin";
import Field from "@/components/field";
import Taro from "@tarojs/taro";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";
import Empty from "@/components/empty";

const ServiceEdit: FC = () => {
  const [list,setList] = useState<any>([]);

  useEffect(()=>{
    getMenusConfig();

  },[]);

  const [err, setErr] = useState(false);
  const getMenusConfig = ()=>{
    settingApi.config.menuId(19 ).then(res=>{
      if(!!res && res.code === 0 && res?.data){
        const list = res?.data || [];
        list.forEach(item=>{
          if(item.rule && item.rule.length > 0) {
            item.rule.forEach(ite=>{
              ite.value = getRuleValue(ite,item.value);
            });
          }
        });
        list.reverse();
        setList(list);
      }else{
        setErr(true);
      }
    }).catch(()=>{
      setErr(true);
    });
  };
  const getRuleValue = (rule,values)=>{
    if(rule){
      let value = "";
      switch (rule.type) {
        case 1:// 数字
        case 2:// 字符串
        case 3:// 单选值
        case 4:// boole
          value = values[rule.label] ? values[rule.label] : rule.value;
          break;
        case 7:// 多选值
          value = values[rule.label] ? JSON.parse(values[rule.label]) : (rule.value ? rule.value : []) ;
        case 5:// JSON
          break;
        case 6:// 富文本
          value = values[rule.label] ? JSON.parse(values[rule.label]) : (rule.value ? JSON.parse(rule.value) : {}) ;
          break;
        default:
          break;
      }
      return value;
    }
    return "";
  };

  const handleValueChange = (index,indx,value)=>{
    setList(prevState => {
      prevState[index].rule[indx].value = value;
      return [...prevState];
    });
  };

  const setConfigValue = (value)=> {
    if (typeof value === "number" || typeof value === "boolean") {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    return value;
  };
  const saveConfig = ()=>{
    let config = {};
    list.forEach((item:any)=>{
      if(item.rule && item.rule.length > 0){
        let obj = {};
        item.rule.forEach(ite=>{
          if ((ite.type === 5 || ite.type === 6) && ite.value !== "{}") {
            try {
              obj[ite.label] = JSON.stringify(ite.value);
            } catch (error) {
              console.warn(`“${ite.label}”数据转换出错`);
            }
          }else {
            obj[ite.label] = setConfigValue(ite.value) ;
          }
        });
        config[item.alias] = obj;
      }
    });
    console.log(config,"list");
    settingApi.config.save({ config }).then(res=>{
      if(res.code === 0){
        Taro.showToast({ title:res.message,icon:"success" });
        setTimeout(()=>{
          navigateTo({ method:"navigateBack" });
        },600);
      }else {
        Taro.showToast({ title:res.message,icon:"error" });
      }
    });
  };


  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!err ? (
          <React.Fragment>
            {!!list && list.length > 0 ? (
              <React.Fragment>
                {list.map((item :any,index)=>{
                  return(
                    <React.Fragment key={index}>
                      <View className="card-title">{item.name}</View>
                      <View className="card">
                        {!!item.rule && item.rule.map((ite,indx)=>{
                          console.log(ite,"ite");
                          return(
                            <Fragment key={`rule-${indx}`}>
                              {ite.type === 3 ? (
                                <React.Fragment>
                                  {ite.rule.select.length > 5 ? (
                                    <Picker
                                      mode="selector"
                                      range={ite.rule.select}
                                      onChange={(e)=>{
                                        let value = ite.limit[e.detail.value];
                                        handleValueChange(index,indx,value);
                                      }}
                                    >
                                      <Cell
                                        title={ite.name}
                                        contentStyle={{ lineHeight: addUnit(16) }}
                                        content={ite.rule.select[ite.limit.findIndex(item=>item == ite.value)]}
                                        arrow
                                      />
                                    </Picker>
                                  ) : (
                                    <Field
                                      align="center"
                                      title={ite.name}
                                      titleWidth={120}
                                      titleStyle={ite.name.length > 6 ? { lineHeight: addUnit(16) } : {}}
                                      arrow
                                      input={false}
                                      inputAlign="right"
                                      value={ite.rule.select[ite.limit.findIndex(item=>item == ite.value)]}
                                      onClick={() => {
                                        Taro.showActionSheet({
                                          itemList: ite.rule.select,
                                          success:(res)=> {
                                            if(res.tapIndex >= 0){
                                              let value = ite.limit[res.tapIndex];
                                              handleValueChange(index,indx,value);
                                            }
                                          },
                                          fail:(res) =>{
                                            console.log(res.errMsg);
                                          }
                                        });
                                      }}
                                    />
                                  )}
                                </React.Fragment>
                              ) : null}
                              {ite.type === 4 ? (
                                <Cell title={ite.name}>
                                  <Switch
                                    checked={ite.value}
                                    onChange={(val)=>{
                                      handleValueChange(index,indx,val);
                                    }}
                                  />
                                </Cell>
                              ) : null}
                              {(ite.type === 1 || ite.type === 2) && ite.label !== "sys_msg" ? (
                                <Field
                                  align="center"
                                  type={ite.rule.unit === "元" ? "number" : ite.rule.unit === "分钟" || ite.rule.unit.indexOf("天") > -1 ? "digit" : "text"}
                                  titleWidth={120}
                                  titleStyle={ite.name.length > 6 ? { lineHeight: addUnit(16) } : {}}
                                  value={ite.value}
                                  right={ite.rule.unit}
                                  title={ite.name}
                                  onChange={(val)=>{
                                    handleValueChange(index,indx,val);
                                  }}
                                >
                                </Field>
                              ) : null}
                            </Fragment>
                          )  ;
                        })}
                      </View>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无配置" image="error" style={{ paddingTop: 0 }} />
            )}
          </React.Fragment>
        ) : (
          <Empty desc="加载错误，请返回重试" image="error" style={{ paddingTop: 0 }} />
        )}
      </ScrollView>
      <BottomBar>
        <Button
          style={{ width: "70%" }}
          type="info"
          onClick={saveConfig}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default ServiceEdit;
