import React, { FC, useEffect, useState } from "react";
import { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { profileApi } from "@/api/co_admin";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Cell from "@/components/cell";
import Checkbox from "@/components/checkbox";
import Skeleton from "@/components/skeleton";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";
import Popup from "@/components/popup";

const SelectProfile: FC = () => {

  const _params:any = getCurrentInstance().router?.params;

  const statciWordTypeList = ["文本","数字","邮件","日期","时间","身份证","图片","手机号码","地图","单选项","多选项","省市区"];
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const [type, setType] = useState("");
  const [refs, setRefs] = useState("");
  // @ts-ignore
  const [selected, setSelected] = useState<any[]>([]);
  const [selectList, setSelectList] = useState<any[]>([]);
  useEffect(()=>{
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _type = _params?.type;
      const _select = _params?.select;
      setRefs(_refs);
      setType(_type);
      if(!!_select && !!JSON.parse(_select)){
        setSelected(JSON.parse(_select));
      }else{
        setSelected([]);
      }
      getList(JSON.parse(_select));
    }else{
      setErr(true);
    }
  },[]);

  const getList = (_selected) =>{
    if(pageList.length === 0){
      setLoading(true);
      profileApi.profile.page({ page: 1, page_size: 999 }).then(res=>{
        if(!!res && res.code === 0){
          const _list = res?.data?.list || [];
          setPageList(_list);
          if(_selected.length > 0 && _list.length > 0){
            let _selectList:any[] = [];
            _selected.forEach(select=>{
              _list.forEach(item=>{
                if(select.id === item.id){
                  const _obj = {
                    type: item.type,
                    id: item.id,
                    name: item.name,
                    required: !!select.required
                  };
                  _selectList.push(_obj);
                }
              });
            });
            setSelectList(_selectList);
          }
        }else{
          setErr(true);
        }
      }).catch(()=>{
        setErr(true);
      }).finally(()=>{
        setLoading(false);
      });
    }
  };

  const saveClick = () => {
    const _selectList = selectList.map(item=>{
      return {
        id: item.id,
        required: item.required
      };
    });
    if(!!type){
      eventCenterTrigger(refs, { select: _selectList, type: type });
    }else{
      eventCenterTrigger(refs, _selectList);
    }
    navigateTo({ method:"navigateBack" });
  };

  const handleClick = (type, index, val = false) => {
    setSelectList(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(type === "delete"){
        temp.splice(index, 1);
      }else{
        temp[index].required = val;
      }
      return temp;
    });
  };

  const [popupInfo, setPopupInfo] = useState<any>({ visable: false, selected: [] });
  const statePopup = (state) => {
    setPopupInfo(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.visable = state;
      return temp;
    });
  };

  const confirmClick = () => {
    if(popupInfo.selected.length > 0){
      let _selectList:any[] = [];
      pageList.forEach(item=>{
        if(popupInfo.selected.indexOf(item.id) > -1){
          const _obj = {
            type: item.type,
            id: item.id,
            name: item.name,
            required: false
          };
          _selectList.push(_obj);
        }
      });
      setSelectList(list => {
        return [...list, ..._selectList];
      });
    }
    setPopupInfo({ visable: false, selected: [] });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation scrollY style={scrollViewStyle()}>
        {loading ? (
          <React.Fragment>
            {Array(6)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    align="start"
                    card
                    title
                    titleSize={[120, 20]}
                    row={1}
                    rowWidth={160}
                    action
                    actionSize={[48,12]}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!err ? (
              <React.Fragment>
                {selectList.length > 0 ? (
                  <React.Fragment>
                    {selectList.map((item:any, index)=>{
                      return (
                        <View className="card" key={index} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                          <Cell
                            border={false}
                            textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                            title={item.name}
                            extraStyle={{ display: "flex", flexDirection: "row" }}
                            extra={
                              <React.Fragment>
                                <Tag plain={false} type="info">{statciWordTypeList[item.type - 1]}</Tag>
                                {item.type === 1 ? <Tag plain={false} style={{ marginLeft: addUnit(8) }}>系统</Tag> : null}
                              </React.Fragment>
                            }
                          />
                          <Cell
                            title={
                              <Checkbox
                                checked={item.required}
                                label="设为必填"
                                onChange={(val)=>{
                                  handleClick("edit",index, val);
                                }}
                              />
                            }
                            rightStyle={{ display: "flex", flexDirection: "row" }}
                            rightIcon={
                              <React.Fragment>
                                <View
                                  className="plus plus--border"
                                  style={{
                                    width: addUnit(16),
                                    height: addUnit(16),
                                    borderColor: "#999",
                                    borderWidth: addUnit(1)
                                  }}
                                >
                                  <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#999", left: "50%", marginLeft: addUnit(-4) }} />
                                </View>
                                <View style={{ color: "#999", marginLeft: addUnit(6) }}>移除</View>
                              </React.Fragment>
                            }
                            onRight={()=>{
                              handleClick("delete", index);
                            }}
                          />
                        </View>
                      );
                    })}
                  </React.Fragment>
                ) : (
                  <Empty desc="暂无相关资料项">
                    <Button
                      plain
                      onClick={()=>{statePopup(true);}}
                    >
                      添加资料项
                    </Button>
                  </Empty>
                )}
              </React.Fragment>
            ) : (
              <Empty desc="加载错误，请返回重试" image="error">
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
        )}
      </ScrollView>
      {!err ? (
        <BottomBar>
          <Button
            plain
            style={{ marginRight: addUnit(12) }}
            onClick={()=>{statePopup(true);}}
          >
            添加资料项
          </Button>
          <Button
            style={{ flex: 1 }}
            type="primary"
            onClick={saveClick}
          >
            保存
          </Button>
        </BottomBar>
      ) : null}
      <Popup
        show={popupInfo.visable}
        title="添加资料项"
        position="pageSheet"
        onClose={()=>{statePopup(false);}}
        bgColor="#f7f8f8"
        action={pageList.length > 0 ? (
          <Button
            type="primary"
            style={{ width: "70%" }}
            onClick={confirmClick}
          >
            确定
          </Button>
        ) : null}
      >
        {pageList.length > 0 ? (
          <React.Fragment>
            {pageList.map((item:any, index)=>{
              return (
                <View className="card" key={index} style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                  <Checkbox
                    checked={popupInfo.selected.indexOf(item.id) > -1 || selectList.map(item=>item.id).indexOf(item.id) > -1}
                    disabled={selectList.map(item=>item.id).indexOf(item.id) > -1}
                    cell
                    border={false}
                    labelPosition="right"
                    label={item.name}
                    labelStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
                    rightStyle={{ display: "flex", flexDirection: "row", alignSelf: "start" }}
                    right={
                      <React.Fragment>
                        {item.type === 1 ? <Tag plain={false} style={{ marginRight: addUnit(8) }}>系统</Tag> : null}
                        <Tag plain={false} type="info">{statciWordTypeList[item.data_type - 1]}</Tag>
                      </React.Fragment>
                    }
                    onChange={(val)=>{
                      setPopupInfo(prevState=>{
                        let temp = JSON.parse(JSON.stringify(prevState));
                        let idx = temp.selected.indexOf(item.id);
                        if(val){
                          if(idx === -1){
                            temp.selected.push(item.id);
                          }
                        }else{
                          if(idx > -1){
                            temp.selected.splice(idx, 1);
                          }
                        }
                        return temp;
                      });
                    }}
                  />
                </View>
              );
            })}
          </React.Fragment>
        ) : (
          <Empty image="memberCard" desc="暂无相关资料项">
            <Button
              plain
              onClick={()=>{ statePopup(false);}}
            >
              关闭
            </Button>
          </Empty>
        )}
      </Popup>
    </View>
  );
};

export default SelectProfile;
