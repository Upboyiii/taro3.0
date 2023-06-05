import React, { FC, useEffect, useState } from "react";
import { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { shopApi } from "@/api/co_admin";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Empty from "@/components/empty";
import Popup from "@/components/popup";
import Checkbox from "@/components/checkbox";
import Radio from "@/components/radio";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";
import Skeleton from "@/components/skeleton";

const GoodsAttrsList: FC = () => {
  const _attrs = getCurrentInstance().router?.params?.attrs;
  useEffect(()=> {
    if (!!_attrs && !!JSON.parse(_attrs)) {
      setSelectList(JSON.parse(_attrs));
    }
    getPageList();
  },[]);

  const [loading, setLoading] = useState(false);
  const [selectList, setSelectList] = useState<any[]>([]);
  const [attrsList, setAttrsList] = useState<any[]>([]);
  const [pageList, setPageList] = useState<any[]>([]);
  const getPageList = () => {
    if (pageList.length === 0) {
      setLoading(true);
      shopApi.attrs.page({ page: 1, page_size: 9999 })
        .then(res => {
          if (!!res && res.code === 0) {
            setPageList(res?.data?.list || []);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(()=>{
    if(pageList.length > 0 && selectList.length > 0){
      let _attrsList:any[] = [];
      selectList.forEach(select=>{
        pageList.forEach(page=>{
          if(select.attrs_id === page.id){
            let item:any = {
              attrs_id: page.id,
              name: page.name,
              list: []
            };
            if(!!page.list && page.list.length > 0){
              page.list.forEach(list=>{
                if(select.sub_ids.indexOf(list.sub_id) > -1){
                  item.list.push(list);
                }
              });
            }
            _attrsList.push(item);
          }
        });
      });
      setAttrsList(_attrsList);
    }else{
      setAttrsList([]);
    }
  },[selectList, pageList]);

  const [subList, setSubList] = useState<any[]>([]);
  const [popupInfo, setPopupInfo] = useState<any>({
    visable: false,
    type: 1,
    title: "",
    index: -1,
    id: 0,
    subIDs: []
  });
  const closePopup = () => {
    setPopupInfo({
      visable: false,
      type: 1,
      title: "",
      index: -1,
      id: 0,
      subIDs: []
    });
  };
  const handleClick = (index = -1) => {
    setPopupInfo(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.visable = true;
      temp.type = 1;
      temp.title = "请选择属性项";
      temp.index = index;
      if (index > -1){
        temp.id = attrsList[index].attrs_id;
        temp.subIDs = attrsList[index].list.map(sub=>sub.sub_id);
      }
      return temp;
    });
  };
  const subEidtClick = (id, list = [], selectSub = [], index = -1) => {
    let _list = list;
    if(list.length === 0){
      pageList.map(item=>{
        if(item.id === id){
          _list = item.list;
        }
      });
    }
    setSubList(_list);
    setPopupInfo(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.visable = true;
      temp.type = 2;
      temp.id = id;
      temp.title = "请选择属性值";
      if(selectSub.length > 0){
        temp.subIDs = selectSub;
      }
      if(index !== -1){
        temp.index = index;
      }
      return temp;
    });
  };
  const subSaveClick = () => {
    setSelectList(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      if(popupInfo.index === -1){
        temp.push({
          attrs_id: popupInfo.id,
          sub_ids: popupInfo.subIDs
        });
      }else{
        temp[popupInfo.index] = {
          attrs_id: popupInfo.id,
          sub_ids: popupInfo.subIDs
        };
      }
      return temp;
    });
    closePopup();
  };
  const saveClick = () => {
    eventCenterTrigger("goodsEdit", { data: selectList, type: "attrs" });
    navigateTo({ method:"navigateBack" });
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
        {!loading ? (
          <React.Fragment>
            {attrsList.length > 0 ? (
              <React.Fragment>
                {attrsList.map((item, index) => {
                  return (
                    <View key={index} className="card" style={index === 0 ? { marginTop: addUnit(12) } : {}}>
                      <Cell
                        border={false}
                        title="属性项"
                        titleStyle={{ width: addUnit(60) }}
                        contentAlign="left"
                        content={item.name}
                        clickable
                        arrow
                        onClick={()=>{
                          handleClick(index);
                        }}
                      />
                      <Cell
                        title="属性值"
                        titleStyle={{ width: addUnit(60) }}
                        contentAlign="left"
                        content={item.list.map(sub=>sub.name).join("；")}
                        clickable
                        arrow
                        onClick={()=>{
                          subEidtClick(item.attrs_id,[],item.list.map(sub=>sub.sub_id), index);
                        }}
                      />
                      <Cell
                        titleStyle={{ marginRight: addUnit(10) }}
                        title={
                          <View
                            className="plus plus--border"
                            style={{
                              width: addUnit(18),
                              height: addUnit(18),
                              borderColor: "#ff2340",
                              borderWidth: addUnit(1)
                            }}
                          >
                            <View className="plus-item plus-item--v" style={{ width: addUnit(8), backgroundColor: "#ff2340", left: "50%", marginLeft: addUnit(-4) }} />
                          </View>
                        }
                        contentStyle={{ color: "#ff2340" }}
                        contentAlign="left"
                        content="删除"
                        onClick={()=>{
                          setSelectList(prevState => {
                            let temp = JSON.parse(JSON.stringify(prevState));
                            temp.splice(index, 1);
                            return temp;
                          });
                        }}
                      />
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty desc="暂无相关商品属性" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {Array(7)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    card
                    title
                    titleSize={[120, 24]}
                    row={1}
                    rowWidth={160}
                  />
                );
              })}
          </React.Fragment>
        )}
      </ScrollView>
      {!loading ? (
        <BottomBar>
          <Button
            plain
            style={{ marginRight: addUnit(12) }}
            onClick={()=>{handleClick();}}
          >
            添加商品属性
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
        position="pageSheet"
        show={popupInfo.visable}
        title={popupInfo.title}
        onClose={closePopup}
        bgColor="#f7f8f8"
        action={
          popupInfo.type === 2 ? (
            <Button
              type="primary"
              style={{ width: "70%" }}
              disabled={popupInfo.subIDs.length === 0}
              onClick={subSaveClick}
            >
              确定
            </Button>
          ) : null
        }
      >
        {popupInfo.type === 1 ? (
          <React.Fragment>
            {pageList.length > 0 ? (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                {pageList.map((item, index)=>{
                  return (
                    <Radio
                      cell
                      key={`item-${index}`}
                      type="check"
                      labelStyle={{ fontSize: addUnit(16) }}
                      label={item.name}
                      value={item.id}
                      checked={item.id === popupInfo.id || selectList.map(select=>select.attrs_id).indexOf(item.id) > -1}
                      disabled={selectList.map(select=>select.attrs_id).indexOf(item.id) > -1}
                      onChange={(val)=>{
                        setPopupInfo(prevState => {
                          let temp = JSON.parse(JSON.stringify(prevState));
                          temp.id = val;
                          return temp;
                        });
                        subEidtClick(item.id,item?.list || []);
                      }}
                    />
                  );
                })}
              </View>
            ) : (
              <Empty desc="暂无商品属性项可选" />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {subList.length > 0 ? (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                {subList.map((item, index)=>{
                  return (
                    <Checkbox
                      cell
                      key={`item-${index}`}
                      labelStyle={{ fontSize: addUnit(16) }}
                      label={item.name}
                      checked={popupInfo.subIDs.indexOf(item.sub_id) > -1}
                      onChange={(val)=>{
                        setPopupInfo(prevState => {
                          let temp = JSON.parse(JSON.stringify(prevState));
                          const idx = temp.subIDs.indexOf(item.sub_id);
                          if(val){
                            if(idx === -1){
                              temp.subIDs.push(item.sub_id);
                            }
                          }else{
                            if(idx > -1){
                              temp.subIDs.splice(idx, 1);
                            }
                          }
                          return temp;
                        });
                      }}
                    />
                  );
                })}
              </View>
            ) : (
              <Empty desc="暂无相关属性值" />
            )}
          </React.Fragment>
        )}
      </Popup>
    </View>
  );
};

export default GoodsAttrsList;
