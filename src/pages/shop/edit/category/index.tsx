import React, { FC, useEffect, useState } from "react";
import { ScrollView, View } from "@tarojs/components";
import { getCurrentInstance } from "@tarojs/taro";
import { eventCenterTrigger, navigateTo } from "@/utils/library";
import { createNamespace, scrollViewStyle } from "@/components/utils";
import { commonApi } from "@/api/co_admin";
import Radio from "@/components/radio";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const GoodsCategory: FC = () => {
  const _params:any = getCurrentInstance().router?.params;

  const [type, setType] = useState("");
  const [refs, setRefs] = useState("");
  const [level, setLevel] = useState(1);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [choicing, setChoicing] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const [checkedIDs, setChekedIDs] = useState<any[]>([]);
  const [checkedData, setCheckedData] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any>({});

  const getList = (pid = -1, _level, refresh = false, _id = 0, _category:any[] = []) => {
    if(!categoryList[_level] || categoryList[_level].length === 0 || refresh){
      setErr(false);
      if(pid === -1 && !_id){ setLoading(true); }
      return new Promise((resolve, reject)=>{
        commonApi.category.page({ page: 1, page_size: 999, state: 1, pid: pid })
          .then(res => {
            if (!!res && res.code === 0) {
              const _list = res.data?.list || [];
              if(_list.length === 0){
                setChoicing(false);
                if(!_id && pid !== -1){
                  if(!!type){
                    eventCenterTrigger(refs, { ids: _category, type: type });
                  }else{
                    eventCenterTrigger(refs, _category);
                  }
                  navigateTo({ method: "navigateBack" });
                }
              }else{
                setPageList(_list);
                setCategoryList(prevState=>{
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp[_level] = _list;
                  return temp;
                });
                if(!!_id){
                  setCheckedData(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    const _item = _list.find(item=>item.id === _id);
                    if(!!_item) temp[_level - 1] = _item;
                    return temp;
                  });
                }else{
                  setChoicing(true);
                  setLevel(_level);
                }
              }
            } else {
              _level === 1 && setErr(true);
            }
            resolve(true);
          })
          .catch(() => {
            _level === 1 && setErr(true);
            reject();
          })
          .finally(() => {
            if(pid === -1 && !_id){ setLoading(false); }
          });
      });
    }else{
      setPageList(categoryList[_level]);
    }
  };

  useEffect(() => {
    if(Object.keys(_params).length > 0 && !!_params?.refs){
      const _refs = _params?.refs;
      const _type = _params?.type || "";
      const _category = JSON.parse(_params?.ids || "[]");
      setRefs(_refs);
      setType(_type);
      if(_category.length > 0){
        setChekedIDs(_category);
        setLevel(_category.length);
        getDefault(_category);
      }else{
        getList(-1, 1, true);
      }
    }else{
      setErr(true);
    }
  }, []);

  const getDefault = async (category) => {
    setLoading(true);
    if(!!category[0]){
      await getList(-1,1, true, category[0]);
    }
    if(!!category[1]){
      await getList(category[0],2, true, category[1]);
    }
    if(!!category[2]){
      await getList(category[1],3, true, category[2]);
    }
    setLoading(false);
  };

  const handleClick = (item) => {
    let _checkedIDs = checkedIDs;
    let _checkedData = checkedData;
    if(level === 1){
      _checkedIDs = [];
      _checkedData = [];
    } else if(level === 2){
      _checkedIDs = [_checkedIDs[0]];
      _checkedData = [_checkedData[0]];
    }
    _checkedIDs[level - 1] = item.id;
    _checkedData[level - 1] = item;
    setChekedIDs(_checkedIDs);
    setCheckedData(_checkedData);
    getList(item.id, level + 1, true, 0, _checkedIDs);
  };

  const [bem] = createNamespace("category","select");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View className={classnames(bem())}>
        {!err && !loading ? (
          <View className={classnames(bem("selected"))}>
            <View className="hairline hairline--bottom" />
            {checkedData.map((item, index)=>{
              return (
                <View
                  key={`tab-${index}`}
                  className={classnames(bem("selected-item", { active: index + 1 === level }))}
                  onClick={()=>{
                    setLevel(index + 1);
                    getList(item.id, index + 1);
                  }}
                >
                  {index + 1 === level ? <View className={classnames(bem("selected-active"))} /> : null}
                  {item?.name}
                </View>
              );
            })}
            {choicing && checkedData.length < 3 ? (
              <View
                className={classnames(bem("selected-item", { active: !checkedData[level - 1] }))}
                onClick={()=>{
                  setLevel(level + 1);
                  getList(0, checkedData.length + 1);
                }}
              >
                {!checkedData[level - 1] ? <View className={classnames(bem("selected-active"))} /> : null}
                请选择
              </View>
            ) : null}
          </View>
        ) : null}
        <ScrollView style={scrollViewStyle()} scrollWithAnimation scrollY>
          {loading ? (
            <React.Fragment>
              {Array(10)
                .fill("")
                .map((_, i) => {
                  return (
                    <Skeleton
                      key={i}
                      title
                      row={1}
                      border={i !== 0}
                      action
                      actionSize={[16,16]}
                      actionRound
                    />
                  );
                })}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {!err ? (
                <React.Fragment>
                  {pageList.length > 0 ? pageList.map((item: any, index) => {
                    return (
                      <Radio
                        key={`goods-category-${item.id}`}
                        border={index !== 0}
                        cell
                        type="check"
                        label={item.name}
                        labelStyle={checkedIDs.indexOf(item.id) > -1 ? { color: "#ff2340" } : {}}
                        checked={checkedIDs.indexOf(item.id) > -1}
                        value={item.id}
                        onClick={()=>{
                          handleClick(item);
                        }}
                      />
                    );}
                  ) : (
                    <Empty desc="暂无相关类目" />
                  )}
                </React.Fragment>
              ) : (
                <Empty desc="加载错误，请返回重试" image="error" />
              )}
            </React.Fragment>
          )}
        </ScrollView>
      </View>
      <BottomBar style={{ paddingTop: 0, paddingBottom: 0 }} />
    </View>
  );
};


export default GoodsCategory;
