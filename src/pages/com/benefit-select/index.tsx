import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Picker, ScrollView, View } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { customerApi } from "@/api/co_admin";
import { eventCenterOff, eventCenterOn, eventCenterTrigger, navigateTo } from "@/utils/library";
import { div } from "@/utils/common";
import Checkbox from "@/components/checkbox";
import Empty from "@/components/empty";
import Field from "@/components/field";
import Cell from "@/components/cell";
import Skeleton from "@/components/skeleton";
import Button from "@/components/button";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const BenefitSelect: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const [mode, setMode] = useState(1);
  const [refs, setRefs] = useState("");
  const [selected, setSelected] = useState<any[]>([]);

  useEffect(()=>{
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _mode = _params?.mode;
      const _type = parseInt(_params?.type || "1");
      const _select = _params?.select;
      const _apply_id = parseInt(_params?.apply_id || "0");
      if (_type === 2) {
        Taro.setNavigationBarTitle({
          title: "设置礼包"
        });
      } else {
        Taro.setNavigationBarTitle({
          title: "设置权益"
        });
      }
      setSelected(JSON.parse(_select));
      setRefs(_refs);
      setMode(_mode);
      getList(_type, JSON.parse(_select), _apply_id);
    }else{
      setErr(true);
    }
  },[]);

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const getList = (type, select, apply_id = 0)=>{
    setErr(false);
    setPageList([]);
    setLoading(true);
    let filter: any = {
      page: 1,
      page_size: 999,
      type: type,
      simple :true
    };
    if(!!apply_id){
      filter.apply_id = apply_id;
    }
    console.log(filter,"filter");
    customerApi.benefit.page(filter).then(res=>{
      console.log(res,"getList");
      if(!!res && res.code === 0){
        if (res.data?.list && res.data?.list.length > 0) {
          const list = formatList(res?.data?.list || [], select || selected);
          setPageList(list);
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

  const formatList = (_page, _select) => {
    // console.log(_select,"_select");
    return _page.map(item => {
      item.checked = false;
      if (!item.benefit_info?.parameter) {
        item.benefit_info.parameter = [];
      }
      _select.forEach(bag => {
        if (bag.benefit_id === item.benefit_id) {
          item.checked = true;
          if (item.benefit_info.parameter.length > 0 && !!bag.value && Object.keys(bag.value).length > 0) {
            item.benefit_info.parameter.forEach((parameter) => {
              if (bag.value[parameter.label] !== undefined) {
                let _default:any = "";
                if(parameter.type === 3){ _default = 0; }
                parameter.value = bag?.value[parameter.label] || _default;
                if (parameter.label === "XFZK"){
                  parameter.value = div(parameter.value, 10);
                }
                if(item.benefit_id === 3 || item.benefit_id === 4){
                  parameter.value = JSON.parse(parameter.value || "[]");
                }
                if(parameter.type === 7){
                  parameter.value = JSON.parse(parameter.value || "[]");
                }
              }
            });
          }
        }
      });
      // console.log(item.benefit_info.parameter, "aaa");
      return item;
    });
  };

  const handleValueChange = (val, index, idx) => {
    setPageList(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp[index].benefit_info.parameter[idx].value = val;
      return temp;
    });
  };

  useEffect(() => {
    eventCenterOn("couponSelect", (res) => {
      if(!!res[0] && !!res[0].type){
        const split = (res[0].type).split("-");
        const index = parseInt(split[0]);
        const idx = parseInt(split[1]);
        handleValueChange(res[0].ids, index, idx);
      }
    });

    eventCenterOn("giftSelect", (res) => {
      if(!!res[0] && !!res[0].type){
        const split = (res[0].type).split("-");
        const index = parseInt(split[0]);
        const idx = parseInt(split[1]);
        handleValueChange(res[0].ids, index, idx);
      }
    });

    return () => {
      eventCenterOff("couponSelect");
      eventCenterOff("giftSelect");
    };
  }, []);

  const saveClick = () => {
    let verify = true;
    const checkedBenefits = pageList.filter((benefit) => benefit.checked === true);

    for(let i = 0; i < checkedBenefits.length; i++){
      const parameter = checkedBenefits[i]?.benefit_info?.parameter || [];
      const benefit_id = checkedBenefits[i]?.benefit_id;
      if(parameter.length > 0){
        for(let j = 0; j < parameter.length; j++){
          const item = parameter[j];
          if(item.value === ""){
            Taro.showToast({ title: item.name + "不能为空", icon: "none" });
            verify = false;
            break;
          }
          if(item.type === 1){
            const val = Number(item.value);
            if(val < item.limit[0]){
              Taro.showToast({ title: item.name + "不能小于" + item.limit[0], icon: "none" });
              verify = false;
              break;
            }
            if(item.limit[1] && val > item.limit[1]){
              Taro.showToast({ title: item.name + "不能大于" + item.limit[1], icon: "none" });
              verify = false;
              break;
            }
            if (item.label === "XFZK"){
              item.value = Number(item.value) * 10;
            }
          }
          if(item.type === 2){
            if((benefit_id === 3 || benefit_id === 4) && item.value.length === 0){
              Taro.showToast({ title: "请选择" + item.name, icon: "none" });
              verify = false;
              break;
            }
          }
        }
      }
    }

    const selectedBenefits = checkedBenefits.map(item => {
      const { id, benefit_id, benefit_info: { parameter } } = item;
      const value = {};
      parameter.forEach(param => {
        if(benefit_id === 3 || benefit_id === 4){
          value[param.label] = JSON.stringify(param.value);
        }else{
          value[param.label] = param.value.toString();
        }

        // if (param.type === 1) param.value = Number(param.value);
      });
      return { benefit_id: benefit_id, did: id, value };
    });

    if(!verify) return;

    if(!!mode){
      eventCenterTrigger(refs, { select: selectedBenefits, type: mode });
    }else{
      eventCenterTrigger(refs, selectedBenefits);
    }
    navigateTo({ method: "navigateBack" });

    // console.log(selected,"selected");
    // console.log(selectedBenefits,"selectedBenefits");
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
        {loading ? (
          <React.Fragment>
            {Array(6)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    align="start"
                    image
                    imageShape="round"
                    imageSize={24}
                    card
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
                {pageList.length > 0 ? (
                  <React.Fragment>
                    {pageList.map((item:any, index)=>{
                      return (
                        <View className="card" key={`benefit-${index}`} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                          <Checkbox
                            cell
                            border={false}
                            label={item.name}
                            labelPosition="right"
                            checked={item.checked}
                            onChange={(val) => {
                              setPageList(prevState => {
                                let temp = JSON.parse(JSON.stringify(prevState));
                                temp[index].checked = val;
                                return temp;
                              });
                            }}
                          />
                          {item.checked && item.benefit_info && item.benefit_info.parameter && item.benefit_info.parameter.length > 0 ?
                            item.benefit_info.parameter.map((parameter, idx) => {
                              return (
                                <React.Fragment key={`parameter-${index}-${idx}`}>
                                  {parameter.type === 1 ? (
                                    <Field
                                      type="number"
                                      title={parameter.name}
                                      titleWidth={90}
                                      value={parameter.value}
                                      // min={(parameter.limit && parameter.limit[0]) || 0}
                                      // max={(parameter.limit && parameter.limit[1]) || 9999999}
                                      placeholder={parameter.rule?.placeholder || `请输入${parameter.name}`}
                                      style={{ marginLeft: addUnit(36) }}
                                      right={parameter.rule.unit}
                                      onChange={(val) => {
                                        handleValueChange(val, index, idx);
                                      }}
                                    />
                                  ) : null}
                                  {parameter.type === 2 ? (
                                    <React.Fragment>
                                      {item.benefit_id === 3 ? (
                                        <React.Fragment>
                                          <Cell
                                            title={!!parameter.value && parameter.value.length > 0 ? "查看所选优惠券" : "选择优惠券"}
                                            style={{ marginLeft: addUnit(36) }}
                                            arrow
                                            clickable
                                            extra={!!parameter.value && parameter.value.length > 0 ? `已选${parameter.value.length}张优惠券` : "请选择"}
                                            onClick={() => {
                                              navigateTo({ url: "/pages/com/coupon-select/index", method: "navigateTo", params: { ids: parameter.value, type: index + "-" + idx, refs: "couponSelect", multiple: true } });
                                            }}
                                          />
                                        </React.Fragment>
                                      ) : item.benefit_id === 4 ? (
                                        <React.Fragment>
                                          <Cell
                                            title={!!parameter.value && parameter.value.length > 0 ? "查看所选赠品" : "选择赠品"}
                                            style={{ marginLeft: addUnit(36) }}
                                            arrow
                                            clickable
                                            extra={!!parameter.value && parameter.value.length > 0 ? `已选${parameter.value.length}件赠品` : "请选择"}
                                            onClick={() => {
                                              navigateTo({ url: "/pages/com/gift-select/index", method: "navigateTo", params: { ids: parameter.value, type: index + "-" + idx, refs: "giftSelect", multiple: true } });
                                            }}
                                          />
                                        </React.Fragment>
                                      ) : (
                                        <React.Fragment>
                                          <Field
                                            title={parameter.name}
                                            titleWidth={90}
                                            value={parameter.value}
                                            // minlength={(parameter.limit && parameter.limit[0]) || 0}
                                            maxlength={(parameter.limit && parameter.limit[1]) || 9999999}
                                            placeholder={parameter.rule?.placeholder || `请输入${parameter.name}`}
                                            style={{ marginLeft: addUnit(36) }}
                                            right={parameter.rule.unit}
                                            onChange={(val) => {
                                              handleValueChange(val, index, idx);
                                            }}
                                          />
                                        </React.Fragment>
                                      )
                                      }
                                    </React.Fragment>
                                  ) : null}
                                  {parameter.type === 3 ? (
                                    <React.Fragment>
                                      <Picker
                                        mode="selector"
                                        range={parameter.rule.select}
                                        onChange={(e)=>{
                                          const val = parameter.limit[e.detail.value];
                                          handleValueChange(val, index, idx);
                                        }}
                                      >
                                        <Cell
                                          title={parameter.name}
                                          titleStyle={{ width: addUnit(90) }}
                                          style={{ marginLeft: addUnit(36) }}
                                          contentAlign="left"
                                          content={parameter.rule.select[parameter.value]}
                                          arrow
                                        />
                                      </Picker>
                                    </React.Fragment>
                                  ) : null}
                                  {/* 多选的还没搞好*/}
                                  {/* {parameter.type === 7 ? (*/}
                                  {/*  <React.Fragment>*/}
                                  {/*    <Cell*/}
                                  {/*      title={parameter.name}*/}
                                  {/*      style={{ marginLeft: addUnit(36) }}*/}
                                  {/*      arrow*/}
                                  {/*      clickable*/}
                                  {/*    />*/}
                                  {/*  </React.Fragment>*/}
                                  {/* ) : null}*/}
                                </React.Fragment>
                              );
                            }) : null}
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无相关权益">
                    <Button
                      plain
                      onClick={()=>{
                        navigateTo({ method:"navigateBack" });
                      }}
                    >
                      返回
                    </Button>
                  </Empty>
                )}
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
          type="primary"
          onClick={saveClick}
        >
          保存
        </Button>
      </BottomBar>
    </View>
  );
};

export default BenefitSelect;
