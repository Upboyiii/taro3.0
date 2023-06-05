import React, { FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Image, Text, View } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import { formatPrice, list2Tree } from "@/utils/common";
import { base } from "@/api/config";
import { shopApi } from "@/api/co_admin";
import { navigateTo } from "@/utils/library";
import shopConfig from "@/locales/shopConfig";
import Skeleton from "@/components/skeleton";
import Navbar from "@/components/navbar";
import Checkbox from "@/components/checkbox";
import Empty from "@/components/empty";
import Dropdown from "@/components/dropdown";
import ScrollView from "@/components/scroll-view";
import BottomBar from "@/components/bottom-bar";
import "./index.scss";

const GoodsList: FC = () => {

  const [allChecked, setAllChecked] = useState(false);
  const [batch, setBatch] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkList, setCheckList] = useState<any>([]);
  const pageSize = 10;
  const [page,setPage] = useState<number>(1);
  const [isPage, setIsPage] = useState(true);
  const [total,setTotal] = useState<number>(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goodsList, setGoodsList] = useState<any>([]);

  const [goodsTypeList, setGoodsTypeList] = useState<any[]>([]);
  const [goodsType, setGoodsType] = useState(0);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [groupID, setGroupID] = useState(0);

  useEffect(()=>{
    getGoodsList(1, groupID, goodsType, true);
  },[groupID, goodsType]);

  useEffect(()=>{
    getGoodsGroup();
    getGoodsType();
  },[]);

  const getGoodsType = () => {
    let tempType = JSON.parse(JSON.stringify(shopConfig.goodsTypeList));
    tempType.unshift({ label: "全部类型", value: 0 });
    setGoodsTypeList(tempType);
  };
  const getGoodsGroup = () =>{
    if(groupList.length === 0){
      shopApi.group.page({ page: 1, page_size: 999, pid: 0 }).then(res=>{
        if(res && res.code === 0){
          const list = res.data.list ? res.data.list : [];
          let _tempGroupList = JSON.parse(JSON.stringify(list));
          _tempGroupList.unshift({ name: "全部分组", id: 0 });
          const temp = list2Tree(_tempGroupList);
          setGroupList(temp);
        }
      });
    }
  };

  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () =>{
    setRefreshing(true);
    setTimeout(()=>{
      getGoodsList(1, groupID, goodsType, true);
    },500);
  };

  const getGoodsList = (page, group_id, type, refresh = false) =>{
    if(refresh){
      setPage(1);
      setTotal(0);
      setLoading(true);
      setErr(false);
      setIsPage(true);
      setGoodsList([]);
    }
    shopApi.goods.page({ page: page, page_size: pageSize, group_id, type }).then(res=>{
      if(!!res && res.code === 0){
        setTotal(res?.data?.total ?? 0);
        if (page * pageSize > res.data.total) {
          setIsPage(false);
        }
        const list = res.data.list ? res.data.list : [];
        setGoodsList(prv=>{
          return [...prv,...list];
        });
      } else {
        setErr(true);
      }
    }).catch(() => {
      setErr(true);
    }).finally(()=>{
      setLoading(false);
      setRefreshing(false);
      setPulling(false);
    });
  };

  const onScrollToLower = () =>{
    if (isPage) {
      setPulling(true);
      setPage(val => {
        let page = val + 1;
        getGoodsList(page, groupID, goodsType);
        return page;
      });
    }
  };

  const batchClick = (mode = "single",type, id = null,index:number = -1) => {
    if (mode === "batch" && checkList.length === 0) {
      Taro.showToast({ title: "请选择商品再进行操作", icon: "none", duration: 1000 });
      return;
    }
    let Obj = {
      goods_ids:mode === "single" ? [id] : checkList,
      type
    };
    // console.log(Obj,"Obj");
    shopApi.goods.operate(Obj,{}).then(res=>{
      if(res.code === 0){
        if(mode === "single"){
          setPopupShow(prv=>{
            prv[index] = false;
            return [...prv];
          });
          setGoodsList(prv=>{
            if(prv[index]){
              switch (type) {
                case 1:
                  prv[index].state = 1;
                  break;
                case 2:
                  prv[index].state = 4;
                  break;
                default:
                  break;
              }
            }
            return [...prv];
          });
        }else {
          setGoodsList([]);
          setBatch(false);
          getGoodsList(1, groupID, goodsType, true);
        }
        const types = { 1:"上架成功",2:"下架成功" };
        Taro.showToast({ title: types[type],  duration: 500 });
      }
    });
  };

  const goodsItemClick = (item) => {
    togglePopupShow(-1);

    if(item.type === 5){
      if(!!item.category && item.category.indexOf(1) > -1){
        navigateTo({
          url: "/pages/customer/level/edit/index",
          method: "navigateTo",
          params: { id: item.item_id }
        });
      }
      if(!!item.category && item.category.indexOf(2) > -1){
        navigateTo({
          url: "/pages/customer/memberCard/edit/index",
          method: "navigateTo",
          params: { id: item.item_id }
        });
      }
    }else{
      navigateTo({
        url: "/pages/shop/edit/index",
        method: "navigateTo",
        params: { id: item.id }
      });
    }
  };

  const [popupShow, setPopupShow] = useState<any[]>([]);
  const togglePopupShow = (index: number) => {
    // console.log(index);
    popupShow[index] = !popupShow[index];
    const temp = popupShow.map((i: boolean, idx) => (idx === index ? i : false));
    // console.log(temp,"temp");
    setPopupShow([...temp]);
  };

  const showPricePop = (id:number,index)=>{
    navigateTo({ url:"/pages/shop/index/editSku/index" ,method:"navigateTo",params:{ goods_id:id } });
    // shopApi.goods.stock({ goods_id:id }).then(res=>{
    //   console.log(res,"res");
    // });
    setPopupShow(prv=>{
      prv[index] = false;
      return [...prv];
    });
  };

  const allCheckedClick = (val) =>{
    setIndeterminate(false);
    setAllChecked(val);
    if(val){
      setCheckList(goodsList.map(item => item.id));
    }else{
      setCheckList([]);
    }
  };
  const goodsItemCheckboxClick = (id, val) => {
    setCheckList(prevState=>{
      let temp = JSON.parse(JSON.stringify(prevState));
      if(!val){
        temp.splice(temp.indexOf(id),1);
      }else{
        temp.push(id);
      }
      setAllChecked(temp.length === goodsList.length);
      setIndeterminate(temp.length > 0 && temp.length !== goodsList.length);
      return temp;
    });
  };
  const [popup,setPopup] = useState({
    show: false,
    title: "修改分组",
    desc: "",
    type: "",
    index:-1
  });
  // @ts-ignore
  const closePopup = ()=>{
    setPopup(prv=>{
      let pop = JSON.parse(JSON.stringify(prv));
      pop.show = false;
      return pop;
    });
    setPopupShow(prv=>{
      prv[popup.index] = false;
      return [...prv];
    });
  };
  const showGroupPop = (mode = "single", id = 0, index = -1)=>{
    console.log(id);
    setPopup(prv=>{
      let pop = JSON.parse(JSON.stringify(prv));
      if(mode === "single"){
        pop.index = index;
      }
      pop.show = true;
      return pop;
    });
  };

  const batchList = [
    {
      name: "上架",
      icon: require("@/assets/icons/batch/putaway.png"),
      type: 1
    },
    {
      name: "下架",
      icon: require("@/assets/icons/batch/soldout.png"),
      type: 2
    },
    {
      name: "库存价格",
      icon: require("@/assets/icons/batch/price.png"),
      type: 3
    },
    {
      name: "改分组",
      icon: require("@/assets/icons/batch/group.png"),
      type: 4
    },
    {
      name: "删除",
      icon: require("@/assets/icons/batch/delete.png"),
      type: 5
    }
  ];
  const renderGoodsPopup = (row:any = null, index = 0) => {
    return (
      <View className={!!row ? "goods-batch goods-list__popup" : "goods-batch__group"}>
        {!!row ? <View className="goods-list__popup-arrow" /> : null}
        {batchList.map(item=>{
          if(!!row && ((row.state === 1 && item.type === 1) || (row.state !== 1 && item.type === 2))) return null;
          if(!row && item.type === 3) return null;
          return (
            <React.Fragment key={`${item.type}`}>
              <View
                className="goods-batch__item"
                onClick={()=>{
                  if(!!row){
                    if(item.type === 1) batchClick("single",1, row.id,index);
                    if(item.type === 2) batchClick("single",2, row.id,index);
                    if(item.type === 3) showPricePop(row.id,index);
                    if(item.type === 4) showGroupPop(row.id);
                    if(item.type === 5) showGroupPop("single",row.id);
                  }else{
                    if(item.type < 3) batchClick("batch", item.type);
                    if(item.type === 4) showGroupPop("batch");
                    if(item.type === 5) showGroupPop("batch");
                  }
                }}
              >
                <Image
                  className="goods-batch__item-icon"
                  src={item.icon}
                  mode="aspectFill"
                />
                <Text className="goods-batch__item-text">{item.name}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#fff" }}>
      <Navbar
        title="商品管理"
        border
        right={
          goodsType !== 5 ? (
            <View
              style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: 30,
              color: "#333",
              fontWeight: "bold"
            }}
          >
            {batch ? "完成" : "批量管理"}
            </View>
          ) : undefined
        }
        onClickRight={()=>{
          togglePopupShow(-1);
          allCheckedClick(false);
          setBatch(prevState => { return !prevState; });
        }}
      />
      {goodsTypeList.length > 0 || groupList.length > 0 ? (
        <Dropdown>
          {groupList.length > 0 ? (
            <Dropdown.item
              title="全部类型"
              value={goodsType}
              options={goodsTypeList}
              onChange={setGoodsType}
              onClick={()=>{togglePopupShow(-1);}}
            />
          ) : null}
          {groupList.length > 0 && goodsType !== 5 ? (
            <Dropdown.item
              title="全部分组"
              value={groupID}
              options={groupList}
              format={{ label: "name", value: "id" }}
              columns={2}
              hasChildren
              onChange={setGroupID}
              onClick={()=>{togglePopupShow(-1);}}
            />
          ) : null}
        </Dropdown>
      ) : null}
      <ScrollView
        err={err}
        refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
        pullUp={!loading}
        loading={pulling}
        loadMore={total > pageSize}
        loadStart={total > page * pageSize}
        emptyText="没有更多商品啦~"
        onPullUp={onScrollToLower}
      >
        {loading ? (
          <React.Fragment>
            {Array(7)
              .fill("")
              .map((_, i) => {
                return (
                  <Skeleton
                    key={i}
                    border={i !== 0}
                    image
                    title
                    row={2}
                  />
                );
              })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {goodsList.length > 0 ? (
              <React.Fragment>
                {goodsList.map((item:any, index)=>{
                  let img_url = base.file_host + "/" + item.cover;
                  if(!item.cover) img_url = require("@/assets/nopic.png");
                  if(item.type === 5){
                    if(!!item.category && item.category.indexOf(1) > -1) img_url = require("@/assets/card/vip.png");
                    if(!!item.category && item.category.indexOf(2) > -1) img_url = require("@/assets/card/benefit.png");
                  }
                  return (
                    <View
                      key={`goods-${index}`}
                      className="goods-list__item"
                      onClick={()=>{
                        goodsItemClick(item);
                      }}
                    >
                      {index !== 0 && <View className="hairline hairline--top" style={{ left: addUnit(86) }} />}
                      {batch ? (
                        <View className="goods-list__checkbox">
                          <Checkbox
                            style={item.type === 5 ? { opacity: 0.5 } : {}}
                            disabled={item.type === 5}
                            checked={checkList.indexOf(item.id) > -1}
                            onChange={(val)=>{
                              if(item.type === 5) return;
                              goodsItemCheckboxClick(item.id,val);
                            }}
                          />
                        </View>
                      ) : null}
                      <Image
                        className="goods-list__image"
                        src={img_url}
                        mode="aspectFill"
                      />
                      <View className="goods-list__content">
                        <Text className="goods-list__title">
                          {item.name}
                        </Text>
                        <View className="goods-list__price">
                          ¥ {item.min_price === item.max_price ? (formatPrice(item.min_price)  || 0) : `${formatPrice(item.min_price)}-${formatPrice(item.max_price)}`}
                        </View>
                        <View className="goods-list__info">
                          <View className="goods-list__info-left">
                            <Text className="goods-list__info-text" style={{ marginRight: 16 }}>库存：{item.total_stock_num || "无"}</Text>
                            <Text className="goods-list__info-text">销量：{item.total_sold_num || 0}</Text>
                            {item.state !== 1 ? (<Text className="goods-list__info-text" >  {shopConfig.goodsState[item.state]}</Text>) : ""}
                          </View>
                          {!batch && item.type !== 5  ? (
                            <View className="goods-list__info-right">
                              <View
                                className="goods-list__more"
                                onClick={(e)=>{
                                  process.env.TARO_ENV !== "rn" && e.stopPropagation();
                                  togglePopupShow(index);
                                }}>
                                <View className="goods-list__more-dot" />
                                <View className="goods-list__more-dot" />
                                <View className="goods-list__more-dot" />
                              </View>
                              {popupShow[index] && renderGoodsPopup(item,index)}
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </React.Fragment>
            ) : (
              <Empty image="goods" desc="暂无相关商品" />
            )}
          </React.Fragment>
        )}
      </ScrollView>
      {batch ? (
        <BottomBar border>
          {batch ? (
            <View className="goods-batch">
              <Checkbox
                indeterminate={indeterminate}
                checked={allChecked}
                onChange={(val)=>{allCheckedClick(val); }}
              >
                全选
              </Checkbox>
              {renderGoodsPopup()}
            </View>
          ) : null}
          {/* // ) : (*/}
          {/* //   <Button*/}
          {/* //     style={{ width: "70%" }}*/}
          {/* //     type="info"*/}
          {/* //     onClick={()=>{*/}
          {/* //       Taro.navigateTo({ url:"/pages/shop/edit/index" });*/}
          {/* //     }}*/}
          {/* //   >*/}
          {/* //     发布商品*/}
          {/* //   </Button>*/}
          {/* // )}*/}
        </BottomBar>
      ) : null}
    </View>
  );
};

export default GoodsList;
