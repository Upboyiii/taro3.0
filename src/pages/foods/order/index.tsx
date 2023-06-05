import React, { FC, useEffect, useState } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, ScrollView, Image, Text } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { formatPrice, list2Tree } from "@/utils/common";
import { navigateTo } from "@/utils/library";
import { shopApi, orderApi } from "@/api/co_admin";
import { pluginApi } from "@/api/base";
import { base } from "@/api/config";
import Button from "@/components/button";
import Skeleton from "@/components/skeleton";
import Empty from "@/components/empty";
import Tag from "@/components/tag";
import Field from "@/components/field";
import Popup from "@/components/popup";
import Cell from "@/components/cell";
import Stepper from "@/components/stepper";
import BottomBar from "@/components/bottom-bar";
import classnames from "classnames";
import "./index.scss";

const FoodsOrder: FC = () => {
  const _params:any = getCurrentInstance().router?.params;

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState<any>([]);
  const [groupList, setGroupList] = useState<any>([]);
  const [groupID, setGroupID] = useState(0);

  // 加载所有餐饮商品
  const getFoodsList = (groupID = 0) => {
    setErr(false);
    setPageList([]);
    setLoading(true);
    shopApi.goods.page({ page: 1, page_size: 999, type: 8, state: 1, group_id: groupID }).then(res => {
      if (!!res && res.code === 0) {
        if (res.data?.list && res.data?.list.length > 0) {
          setPageList(res.data.list || []);
        }
      } else {
        setErr(true);
      }
    }).catch(() => {
      setErr(true);
    }).finally(() => {
      setLoading(false);
    });
  };
  const getFoodsGroup = () =>{
    shopApi.group.page({ page: 1, page_size: 999, pid: 0 }).then(res=>{
      if(res && res.code === 0){
        const list = res.data.list ? res.data.list : [];
        let _tempGroupList = JSON.parse(JSON.stringify(list));
        _tempGroupList.unshift({ name: "全部分组", id: 0 });
        setGroupList(_tempGroupList);
      }
    });
  };
  useEffect(() => {
    if(_params?.tableNumber){
      Taro.setNavigationBarTitle({ title: `在线点餐 - 桌号${_params.tableNumber}` });
    }
    getFoodsGroup();
  }, []);

  useEffect(() => {
    getFoodsList(groupID);
  }, [groupID]);

  const [popupShow, setPopupShow] = useState({
    visable: false,
    title: "",
    type: 1
  });
  const [popupLoading, setPopupLoading] = useState(false);
  const [stocks, setStocks] = useState<any>({});
  const getGoodsStock = (id) =>{
    setStocks({});
    setPopupLoading(true);
    shopApi.goods.stock({ goods_id: id }).then(res => {
      console.log(res,"getGoodsStock");
      if (res.code === 0) {
        setStocks(res?.data || []);
      }
    }).finally(()=>{
      setPopupLoading(false);
    });
  };
  const [detail, setDetail] = useState<any>({});
  const getGoodsDetail = (id) =>{
    setDetail({});
    setPopupLoading(true);
    shopApi.goods.info({ id: id }).then(res => {
      if (res.code === 0) {
        setDetail(res?.data || {});
      }
    }).finally(()=>{
      setPopupLoading(false);
    });
  };
  const defulteCheckSku = {
    stocks: {
      price: 0,
      stock_num: 0,
      is_sell: 0
    },
    sku_id: null,
    pay_num: 1,
    attrs_price: 0,
    attrs_ids: []
  };
  const [goodsDetail, setGoodsDetail] = useState<any>({
    goodsAttrs: [],
    goodsInfo: {},
    checkSku: {}
  });
  const formatGoodsDetail = () =>{
    let _goodsAttrs = detail?.goods_attrs_ids || [];
    let _goodsInfo = detail?.Info || {};
    let _stocks = stocks;
    let _checkSku = Object.assign({}, JSON.parse(JSON.stringify(defulteCheckSku)));
    if(!!_goodsInfo.goods_rule_sku){
      (_goodsInfo?.goods_rule_sku || []).forEach(item => {
        if (_stocks[item.sku_id]) {
          item.stocks = _stocks[item.sku_id][0];
        }
      });
      if (_goodsInfo.goods_rule_sku.length > 1) {
        _goodsInfo.goods_rule_sku = list2Tree(_goodsInfo.goods_rule_sku, "pid", "sku_id");
      } else if(_goodsInfo.goods_rule_sku.length === 1) {
        _checkSku = Object.assign(
          JSON.parse(JSON.stringify(defulteCheckSku)),
          JSON.parse(JSON.stringify(_goodsInfo.goods_rule_sku[0]))
        );
      }
      if(_goodsInfo?.goods_rule_sku.length > 0 && _goodsInfo.goods_rule_sku[0].children){
        if(_goodsInfo.goods_rule_sku[0].children.length > 0 && _goodsInfo.goods_rule_sku[0].children[0].sku_id){
          _checkSku.sku_id = _goodsInfo.goods_rule_sku[0].children[0].sku_id;
        }
      }
    }

    // console.log(_goodsInfo.goods_rule_sku,"_goodsInfo.goods_rule_sku");
    // console.log(_checkSku,"_checkSku");

    if (_goodsAttrs.length > 0) {
      _goodsAttrs.forEach(item => {
        item.sub_ids = [item.list[0].sub_id];
        // item.sub_ids = [];
        // if(item.necessary === 2){
        //   item.sub_ids = [item.list[0].sub_id];
        // }
      });
    }
    setGoodsDetail({
      goodsAttrs: _goodsAttrs,
      goodsInfo: _goodsInfo,
      checkSku: _checkSku
    });
  };
  useEffect(() => {
    formatGoodsDetail();
  }, [stocks,detail]);

  const itemClick = async (id) => {
    if(!!id){
      setPopupShow(prevState => {
        let temp = JSON.parse(JSON.stringify(prevState));
        temp.visable = true;
        return temp;
      });
      await getGoodsStock(id);
      await getGoodsDetail(id);
    }
  };

  const [checkListTotal, setCheckListTotal] = useState({
    price: 0,
    nums: 0
  });
  const [checkList, setCheckList] = useState<any[]>([]);
  const [orderListTotal, setOrderListTotal] = useState({
    price: 0,
    nums: 0
  });
  const [orderList, setOrderList] = useState<any[]>([]);
  const getOrderInfo = (order_id)=> {
    orderApi.userOrder.info({ id: order_id }).then(res => {
      if (res.code === 0) {
        setOrderList(res.data?.order_shop?.list ?? []);
      }
    });
  };

  const [allListTotal, setAllListTotal] = useState({
    price: 0,
    nums: 0
  });
  const [otherListTotal, setOtherListTotal] = useState({
    price: 0,
    nums: 0
  });
  const [orderForm, setOrderForm] = useState({
    note: "",
    otherShopList: [],
    person_nums: parseInt(_params?.person_nums || "0") // 用餐人数
  });
  const getOtherShop = () => {
    if (orderForm.otherShopList.length === 0) {
      pluginApi.page({ apply_id: 19848070, plugin_label: "getShop", plugin_id: 312, state: 1 }).then(res => {
        if (res.code === 0) {
          if (res.data && res.data.length > 0) {
            setOrderForm(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              const _otherShopList = res?.data || [];
              temp.otherShopList = _otherShopList.map(item => {
                if (item.is_nums) {
                  item.checkNum = temp.person_nums;
                } else {
                  item.checkNum = item.is_must ? 1 : 0;
                }
                return item;
              });
              return temp;
            });
          }
        }
      });
    }
  };

  useEffect(()=>{
    if(!!_params?.order_id){
      getOrderInfo(parseInt(_params.order_id));
    }
    if (!_params?.flow_id) {
      getOtherShop();
    }
  },[]);

  useEffect(()=>{
    if(!!_params?.order_id){
      setOrderListTotal(prevState => {
        let temp = JSON.parse(JSON.stringify(prevState));
        let _price = 0;
        let _nums = 0;
        if (orderList.length > 0) {
          orderList.forEach(item => {
            _price += item.price * item.pay_num;
            _nums += item.pay_num;
          });
        }
        temp.price = _price;
        temp.nums = _nums;
        return temp;
      });
    }
  },[orderList]);

  useEffect(()=>{
    setCheckListTotal(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let _price = 0;
      let _nums = 0;
      if (checkList.length > 0) {
        checkList.forEach(item => {
          _price += item.price * item.pay_num;
          _nums += item.pay_num;
        });
      }
      temp.price = _price;
      temp.nums = _nums;
      return temp;
    });
  },[checkList]);

  useEffect(()=>{
    console.log("orderForm变化啦",orderForm);
    setOtherListTotal(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      let _price = 0;
      let _nums = 0;
      if (orderForm.otherShopList.length > 0) {
        orderForm.otherShopList.forEach((item:any) => {
          _price += item.price * item.checkNum;
          _nums += item.checkNum;
        });
      }
      temp.price = _price;
      temp.nums = _nums;
      return temp;
    });
  },[orderForm]);

  useEffect(()=>{
    setAllListTotal(prevState => {
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.price = checkListTotal.price + orderListTotal.price + otherListTotal.price;
      temp.nums = checkListTotal.nums + orderListTotal.nums + otherListTotal.nums;
      return temp;
    });
  },[checkListTotal,orderListTotal,otherListTotal]);

  const addCart = () =>{
    let isRepeat = false;
    let _attrList = JSON.parse(JSON.stringify(goodsDetail.goodsAttrs));
    console.log(_attrList,"_attrList");

    let _checkList = JSON.parse(JSON.stringify(checkList));
    for (let key in _checkList) {
      if (_checkList[key].id === goodsDetail.goodsInfo.id) {
        isRepeat = true;
        break;
      }
    }
    let _checkSku = JSON.parse(JSON.stringify(goodsDetail.checkSku));
    let _attrs_ids:any = [];
    let verify = true;
    for (let a in _attrList) {
      if (_attrList[a].sub_ids.length > 0) {
        let _list:any = [];
        _attrList[a].sub_ids.forEach(item => {
          for (let b in _attrList[a].list) {
            if (item === _attrList[a].list[b].sub_id) {
              _list.push(_attrList[a].list[b]);
              break;
            }
          }
        });
        _attrs_ids.push({
          attrs_id: _attrList[a].id,
          attrs_name: _attrList[a].name,
          sub_ids: _attrList[a].sub_ids,
          list: _list
        });
        _attrList[a].err = "";
      }else {
        // 必选
        if(_attrList[a].necessary === 2){
          verify = false;
          _attrList[a].err = "请选择" + _attrList[a].name;
        }
      }
    }

    setGoodsDetail(prevState=>{
      let temp = JSON.parse(JSON.stringify(prevState));
      temp.goodsAttrs = _attrList;
      return temp;
    });

    if(!verify) return;

    let obj = {
      type: 2, // 1已有订单  2下单类型
      sku_id: _checkSku.sku_id,
      is_repeat: isRepeat, // 之前是否有商品
      name: goodsDetail.goodsInfo.name,
      sku_name: _checkSku.name,
      pay_num: _checkSku.pay_num,
      id: goodsDetail.goodsInfo.id,
      price: (_checkSku.stocks.price + _checkSku.attrs_price) * _checkSku.pay_num,
      attrs_ids: _attrs_ids
    };
    _checkList.push(obj);
    setCheckList(_checkList);
    setPopupShow({
      visable: false,
      title: "",
      type: 1
    });
  };

  const getAttrsPrice = (list)=>{
    let prices = 0;
    if(list && list.length > 0){
      list.forEach(item=>{
        if(item.sub_ids.length > 0){
          let itms = item.list;
          itms.forEach(ite=>{
            if(ite.price && item.sub_ids.indexOf(ite.sub_id) != -1){
              prices += ite.price;
            }
          });
        }
      });
    }
    return prices;
  };

  const addOrder = ()=>{
    console.log("addOrder");

    if(!_params.flow_id && checkList.length <= 0){
      setPopupShow({
        visable: false,
        title: "",
        type: 1
      });
      Taro.showToast({ title: "请选择菜品", icon: "none" });
      return;
    }

    let list = [],order_list = [];
    if(checkList && checkList.length > 0){
      list = JSON.parse(JSON.stringify(checkList));
      list.forEach((item:any) => {
        let attrs_ids = item.attrs_ids;
        attrs_ids.forEach(ite => {
          delete ite.attrs_name;
          delete ite.list;
        });
        // @ts-ignore
        order_list.push({
          attrs_ids: attrs_ids,
          id: item.id,
          pay_num: item.pay_num,
          sku_id: item.sku_id
        });
      });
    }
    let order = {
      customer_id: 0,
      is_query: 1,
      note: orderForm.note,
      order_list: order_list,
      use_apply: {
        19848070: {
          aid: Number(_params.desk_id),
          serials: [0],
          value: {
            desk_source: "2",
            order_source: "2",
            p_nums:orderForm.person_nums + "",
            params: JSON.stringify(
              orderForm.otherShopList
                .map((item:any) => {
                  if (item.is_must || item.checkNum > 0) {
                    return { id: item.id, nums: item.checkNum };
                  }
                  return undefined;
                })
                .filter(item => !!item)
            )
          }
        }
      }
    };
    orderApi.userOrder.addOrder(order,{ successToast:true }).then(res=>{
      if(res.code === 0){
        setPopupShow({
          visable: false,
          title: "",
          type: 1
        });
        navigateTo({ method:"navigateBack" });
      }else {
        setPopupShow({
          visable: false,
          title: "",
          type: 1
        });
        Taro.showToast({ title: res.message, icon: "error" });
      }
    });
  };

  const [bem] = createNamespace("booking", "foods");
  return (
    <View className="flex-page">
      <View className={classnames(bem())}>
        <View className={classnames(bem("aside"))}>
          <View className="hairline hairline--right" />
          <ScrollView style={{ flex: 1, width: addUnit(120) }} scrollWithAnimation scrollY enhanced showScrollbar={false}>
            {groupList.map((item,index)=>{
              return (
                <View
                  key={`group-menu-${item.id}`}
                  className={classnames(
                    bem("aside-item",
                      {
                        "active": item.id === groupID,
                        "active-first": item.id === groupID && index === 0,
                        "active-last": item.id === groupID && index === groupList.length
                      })
                  )}
                  onClick={()=>{
                    setGroupID(item.id);
                  }}
                >
                  {/* @ts-ignore*/}
                  <Text className={classnames(bem("aside-text", { "active": item.id === groupID }))} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {index === 0 ? (<View  className={classnames(bem("aside-badge"))}>5</View>) : null}
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View className={classnames(bem("content"))}>
          <ScrollView style={{ flex: 1 }} scrollWithAnimation scrollY>
            {loading ? (
              <React.Fragment>
                {Array(7)
                  .fill("")
                  .map((_, i) => {
                    return (
                      <Skeleton
                        key={i}
                        image
                        imageSize={64}
                        title
                        titleSize={[120, 18]}
                        row={2}
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
                        {pageList.map((item, index) => {
                          return (
                            <View
                              key={`goods-${index}`}
                              className={classnames(bem("goods"))}
                              onClick={() => {
                                itemClick(item.id);
                              }}
                            >
                              <Image
                                className={classnames(bem("goods-image"))}
                                src={base.file_host + "/" + item.cover}
                                mode="aspectFill"
                              />
                              <View className={classnames(bem("goods-content"))}>
                                {/* @ts-ignore*/}
                                <Text className={classnames(bem("goods-title"))} numberOfLines={2}>
                                  {item.name}
                                </Text>
                                <View className={classnames(bem("goods-info"))}>
                                  <View className={classnames(bem("goods-price"))}>
                                    <View className={classnames(bem("goods-price__currency"))}>¥</View>
                                    <View className={classnames(bem("goods-price__price"))}>{item.min_price / 100}</View>
                                    {item.min_price !== item.max_price ? (
                                      <View className={classnames(bem("goods-price__unit"))}>起</View>
                                    ) : null}
                                  </View>
                                  {item.min_price !== item.max_price ? (
                                    <Tag type="primary" plain={false} dark style={{ fontWeight: "bold" }}>选规格</Tag>
                                  ) : (
                                    <Tag type="primary" plain={false} dark style={{ height: addUnit(18) }}>
                                      <View className="plus" style={{ width: addUnit(8), height: addUnit(8) }}>
                                        <View className="plus-item plus-item--v" style={{ backgroundColor: "#fff", height: addUnit(2) }} />
                                        <View className="plus-item plus-item--h" style={{ backgroundColor: "#fff", width: addUnit(2) }} />
                                      </View>
                                    </Tag>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </React.Fragment>
                    ) : (
                      <Empty desc="暂无相关菜品" />
                    )}
                  </React.Fragment>
                ) : (
                  <Empty desc="加载错误，请返回重试" image="error" />
                )}
              </React.Fragment>
            )}
          </ScrollView>
        </View>
      </View>
      <BottomBar bgColor="#fff" border>
        <View
          className={classnames(bem("cart"))}
          onClick={() => {
            setPopupShow({
              visable: true,
              title: "订单信息",
              type: 2
            });
          }}
        >
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <View style={{ fontSize: addUnit(12), color: "#666" }}>总金额：</View>
            <View style={{ fontSize: addUnit(14), color: "#ff2340" }}>¥</View>
            <View  style={{ fontSize: addUnit(20), color: "#ff2340" }}>{formatPrice(allListTotal.price )}</View>
          </View>
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <View style={{ fontSize: addUnit(12), color: "#666" }}>总数量：</View>
            <View  style={{ fontSize: addUnit(14), color: "#333" }}>{allListTotal.nums}</View>
          </View>
        </View>
        <Button
          type="info"
          onClick={() => {
            if(!_params.flow_id && checkList.length <= 0){
              Taro.showToast({ title:"请选择菜品", icon:"none" });
              return;
            }
            setPopupShow({
              visable: true,
              title: "订单信息",
              type: 2
            });
          }}
        >
          确认订单
        </Button>
      </BottomBar>
      <Popup
        show={popupShow.visable}
        title={popupShow.title}
        position={popupShow.type === 1 ? "center" : "pageSheet"}
        bgColor={popupShow.type === 1 ? "#fff" : "#f7f8f8"}
        scroll={popupShow.type !== 1}
        closeStyle={{ top: addUnit(12), right: addUnit(12) }}
        onClose={()=>{
          setPopupShow({
            visable: false,
            title: "",
            type: 1
          });
        }}
        actionStyle={{ justifyContent: "space-between" }}
        action={
          popupShow.type === 2 ? (
            <React.Fragment>
              <View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ fontSize: addUnit(12), color: "#666" }}>总金额：</View>
                  <View style={{ fontSize: addUnit(14), color: "#ff2340" }}>¥</View>
                  <View  style={{ fontSize: addUnit(20), color: "#ff2340" }}>{(allListTotal.price / 100).toFixed(2)}</View>
                </View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ fontSize: addUnit(12), color: "#666" }}>总数量：</View>
                  <View  style={{ fontSize: addUnit(14), color: "#333" }}>{allListTotal.nums}</View>
                </View>
              </View>
              <Button
                type="info"
                onClick={addOrder}
              >
                提交订单
              </Button>
            </React.Fragment>
          ) : null
        }
      >
        {popupShow.type === 1 ? (
          <React.Fragment>
            {!popupLoading ? (
              <React.Fragment>
                <View className={classnames(bem("goods","popup"))}>
                  <Image
                    className={classnames(bem("goods-image","popup"))}
                    src={base.file_host + "/" + goodsDetail.goodsInfo.cover}
                    mode="aspectFill"
                  />
                  <View className={classnames(bem("goods-content"))}>
                    {/* @ts-ignore*/}
                    <Text className={classnames(bem("goods-title","popup"))} numberOfLines={2}>
                      {goodsDetail.goodsInfo.name}
                    </Text>
                    <View className={classnames(bem("goods-info"))}>
                      <View className={classnames(bem("goods-price"))}>
                        <View className={classnames(bem("goods-price__currency"))}>¥</View>
                        <View className={classnames(bem("goods-price__price"))}>
                          {formatPrice(((goodsDetail.checkSku?.stocks?.price || 0) + (goodsDetail.checkSku?.attrs_price || 0)) * (goodsDetail.checkSku?.pay_num || 0))}
                        </View>
                      </View>
                      {(goodsDetail.checkSku?.stocks?.stock_num || -1) >= 0 ? (
                        <View className={classnames(bem("goods-stock"))}>
                          <View className={classnames(bem("goods-stock__label"))}>库存</View>
                          <View className={classnames(bem("goods-stock__num"))}>{goodsDetail.checkSku?.stocks?.stock_num || 0}</View>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
                {!!(goodsDetail.goodsInfo?.goods_rule_sku || [])[0]?.children || goodsDetail.goodsAttrs.length > 0 ? (
                  <View className={classnames(bem("skus"))}>
                    <ScrollView style={{ height: "100%" }} scrollWithAnimation scrollY>
                      {!!(goodsDetail.goodsInfo?.goods_rule_sku || [])[0]?.children ? (
                        <View className={classnames(bem("sku"))}>
                          {!!goodsDetail.goodsInfo?.goods_rule_sku[0]?.name ? (
                            <View className={classnames(bem("sku-title"))}>{goodsDetail.goodsInfo?.goods_rule_sku[0]?.name}</View>
                          ) : null}
                          <View className={classnames(bem("sku-group"))}>
                            {goodsDetail.goodsInfo?.goods_rule_sku[0]?.children.map((item,idx)=>{
                              return (
                                <View
                                  key={`rule-sku-${idx}`}
                                  className={classnames(bem("sku-item", { active: goodsDetail.checkSku.sku_id === item.sku_id }))}
                                  onClick={()=>{
                                    setGoodsDetail(prevState=>{
                                      let temp = JSON.parse(JSON.stringify(prevState));
                                      temp.checkSku = Object.assign({}, temp.checkSku, item);
                                      return temp;
                                    });
                                  }}
                                >
                                  {item.name}
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      ) : null}
                      {goodsDetail.goodsAttrs.length > 0 ? (
                        <React.Fragment>
                          {goodsDetail.goodsAttrs.map((sku, index)=>{
                            if(!sku.list) return null;
                            return (
                              <View className={classnames(bem("sku"))} key={`sku-${index}`}>
                                {!!sku.name ? (
                                  <View className={classnames(bem("sku-title"))}>
                                    <View className={classnames(bem("sku-name"))}>{sku.name}</View>
                                    {sku.sub_ids.length === 0 ? <View className={classnames(bem("sku-err"))}>{sku.err}</View> : null}
                                  </View>
                                ) : null}
                                <View className={classnames(bem("sku-group"))}>
                                  {sku.list.map((item,idx)=>{
                                    return (
                                      <View
                                        key={`sku-${index}-${idx}`}
                                        className={classnames(bem("sku-item", { active: sku.sub_ids.indexOf(item.sub_id) > -1 }))}
                                        onClick={()=>{
                                          setGoodsDetail(prevState=>{
                                            let temp = JSON.parse(JSON.stringify(prevState));
                                            if(sku.multi === 2){
                                              if(sku.sub_ids.indexOf(item.sub_id) > -1){
                                                temp.goodsAttrs[index].sub_ids.splice(sku.sub_ids.indexOf(item.sub_id),1);
                                              }else{
                                                temp.goodsAttrs[index].sub_ids.push(item.sub_id);
                                              }
                                            }else{
                                              if(item.sub_id === temp.goodsAttrs[index].sub_ids[0]){
                                                temp.goodsAttrs[index].sub_ids = [];
                                              }else {
                                                temp.goodsAttrs[index].sub_ids = [item.sub_id];
                                              }
                                            }
                                            temp.checkSku.attrs_price = getAttrsPrice(temp.goodsAttrs);
                                            return temp;
                                          });
                                        }}
                                      >
                                        {`${item.name}${!!item.price ? `(¥${formatPrice(item.price)})` : ""}`}
                                      </View>
                                    );
                                  })}
                                </View>
                              </View>
                            );
                          })}
                        </React.Fragment>
                      ) : null}
                    </ScrollView>
                  </View>
                ) : null}
                <View className={classnames(bem("action"))}>
                  <View className="hairline hairline--top" />
                  <View className={classnames(bem("action-nums"))}>
                    <View className={classnames(bem("action-label"))}>购买数量</View>
                    <View className={classnames(bem("action-input"))}>
                      <Stepper
                        value={goodsDetail.checkSku.pay_num}
                        theme="tinge"
                        max={goodsDetail.checkSku?.stocks?.stock_num < 0 ? 999999 : goodsDetail.checkSku?.stocks?.stock_num}
                        round
                        plain
                        onChange={(val)=>{
                          setGoodsDetail(prevState => {
                            let temp = JSON.parse(JSON.stringify(prevState));
                            temp.checkSku.pay_num = val;
                            return temp;
                          });
                        }}
                      />
                    </View>
                  </View>
                  <Button
                    type="primary"
                    onClick={addCart}
                  >
                    加入订单列表
                  </Button>
                </View>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Skeleton
                  image
                  title
                  row={2}
                  style={{ marginRight: addUnit(32) }}
                />
                <Skeleton
                  title
                  titleSize={[48,16]}
                  row={2}
                  style={{ height: addUnit(80) }}
                />
                <Skeleton
                  title
                  titleSize={[48,16]}
                  row={2}
                  style={{ height: addUnit(90) }}
                />
                <Skeleton
                  border
                  direction="column"
                  image
                  imageSize={["100%", 36]}
                  imageShape="round"
                  style={{ paddingTop: addUnit(16), paddingBottom: addUnit(10) }}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {orderList.length > 0 || checkList.length > 0 ? (
              <React.Fragment>
                <View className="card-title">菜品信息</View>
                {orderList.length > 0 ? (
                  <React.Fragment>
                    <View className="card">
                      {orderList.map((item,index)=>{
                        return (
                          <Cell
                            key={`order-${index}`}
                            align="start"
                            border={index !== 0}
                            title={item.name}
                            label={
                              !!item?.sku_name || (!!item?.custom && !!item?.custom?.attrs_ids && item?.custom?.attrs_ids.length > 0) ? (
                                <React.Fragment>
                                  {!!item?.sku_name ? `${item.sku_name};` : null}
                                  {!!item?.custom && !!item?.custom?.attrs_ids && item?.custom?.attrs_ids.length > 0 ? item.custom.attrs_ids.map(sku=>{
                                    return `${sku.name};`;
                                  }) : null}
                                </React.Fragment>
                              ) : null
                            }
                            content={`¥${(item.price / 100).toFixed(2)}`}
                            extraStyle={{ marginLeft: addUnit(16) }}
                            extra={
                              <Stepper
                                value={item.pay_num}
                                theme="tinge"
                                min={0}
                                round
                                plain
                                showPlus={item.pay_num > 0}
                                showInput={item.pay_num > 0}
                                buttonPlusPrimary
                                onChange={(val)=>{
                                  setCheckList(prevState => {
                                    let temp = JSON.parse(JSON.stringify(prevState));
                                    if(val === 0){
                                      temp.splice(index,1);
                                    }else{
                                      temp[index].pay_num = val;
                                    }
                                    return temp;
                                  });
                                }}
                              />
                            }
                          />
                        );
                      })}
                    </View>
                    <View
                      className="card-tips"
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <View style={{ fontSize: addUnit(12), color: "#666" }}>金额：</View>
                        <View  style={{ fontSize: addUnit(14), color: "#333" }}>{`¥${(orderListTotal.price / 100).toFixed(2)}`}</View>
                      </View>
                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <View style={{ fontSize: addUnit(12), color: "#666" }}>数量：</View>
                        <View  style={{ fontSize: addUnit(14), color: "#333" }}>{orderListTotal.nums}</View>
                      </View>
                    </View>
                  </React.Fragment>
                ) : null}
                {checkList.length > 0 ? (
                  <React.Fragment>
                    <View className="card">
                      {checkList.map((item,index)=>{
                        return (
                          <Cell
                            key={`check-${index}`}
                            border={index !== 0}
                            title={item.name}
                            labelStyle={{ marginTop: 0 }}
                            label={
                              !!item?.sku_name || (!!item?.attrs_ids && item?.attrs_ids.length > 0) ? (
                                // @ts-ignore
                                <Text style={{ fontSize: addUnit(10), color: "#999", lineHeight: addUnit(12) }}>
                                  {!!item?.sku_name ? `${item.sku_name};` : null}
                                  {!!item?.attrs_ids && item?.attrs_ids.length > 0 ? item.attrs_ids.map(sku => {
                                    return `${sku.list.map(row => `${row.name}`)};`;
                                  }) : null}
                                </Text>
                              ) : null
                            }
                            content={`¥${(item.price / 100).toFixed(2)}`}
                            extraStyle={{ marginLeft: addUnit(16) }}
                            extra={
                              <Stepper
                                value={item.pay_num}
                                theme="tinge"
                                min={0}
                                round
                                plain
                                showPlus={item.pay_num > 0}
                                showInput={item.pay_num > 0}
                                buttonPlusPrimary
                                onChange={(val)=>{
                                  setCheckList(prevState => {
                                    let temp = JSON.parse(JSON.stringify(prevState));
                                    if(val === 0){
                                      temp.splice(index,1);
                                    }else{
                                      temp[index].pay_num = val;
                                    }
                                    return temp;
                                  });
                                }}
                              />
                            }
                          />
                        );
                      })}
                    </View>
                    <View
                      className="card-tips"
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <View style={{ fontSize: addUnit(12), color: "#666" }}>金额：</View>
                        <View  style={{ fontSize: addUnit(14), color: "#333" }}>{`¥${(checkListTotal.price / 100).toFixed(2)}`}</View>
                      </View>
                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <View style={{ fontSize: addUnit(12), color: "#666" }}>数量：</View>
                        <View  style={{ fontSize: addUnit(14), color: "#333" }}>{checkListTotal.nums}</View>
                      </View>
                    </View>
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            ) : null}
            <View className="card-title">其它信息</View>
            <View className="card">
              <Cell
                border={false}
                title="用餐人数"
                extra={
                  <Stepper
                    value={orderForm.person_nums}
                    theme="tinge"
                    round
                    min={0}
                    plain
                    buttonPlusPrimary
                    onChange={(val)=>{
                      setOrderForm(prevState => {
                        let temp = JSON.parse(JSON.stringify(prevState));
                        temp.person_nums = val;
                        temp.otherShopList.forEach(item => {
                          if (item.is_nums) {
                            item.checkNum = temp.person_nums;
                          }
                        });
                        return temp;
                      });
                    }}
                  />
                }
              />
              {!_params?.flow_id && orderForm.otherShopList.length > 0 ? (
                <React.Fragment>
                  {orderForm.otherShopList.map((item:any,index)=>{
                    return (
                      <Cell
                        key={`other-${item.id + item.checkNum}`}
                        title={item?.name}
                        content={`¥${formatPrice(item.price)}/${item.unit}`}
                        extraStyle={{ marginLeft: addUnit(16) }}
                        extra={
                          <Stepper
                            value={item.checkNum}
                            theme="tinge"
                            min={item.is_must ? 1 : 0}
                            round
                            plain
                            buttonPlusPrimary
                            onChange={(val)=>{
                              setOrderForm(prevState => {
                                let temp = JSON.parse(JSON.stringify(prevState));
                                temp.otherShopList[index].checkNum = val;
                                return temp;
                              });
                            }}
                          />
                        }
                      />
                    );
                  })}
                </React.Fragment>
              ) : null}
            </View>
            {!_params?.flow_id && orderForm.otherShopList.length > 0 ? (
              <View
                className="card-tips"
                style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
              >
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ fontSize: addUnit(12), color: "#666" }}>金额：</View>
                  <View  style={{ fontSize: addUnit(14), color: "#333" }}>{`¥${(otherListTotal.price / 100).toFixed(2)}`}</View>
                </View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ fontSize: addUnit(12), color: "#666" }}>数量：</View>
                  <View  style={{ fontSize: addUnit(14), color: "#333" }}>{otherListTotal.nums}</View>
                </View>
              </View>
            ) : null}
            <View className="card-title">订单备注</View>
            <View className="card">
              <Field
                type="textarea"
                value={orderForm.note}
                placeholder="请输入订单备注信息"
                onChange={(val)=>{
                  setOrderForm(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp.note = val;
                    return temp;
                  });
                }}
              />
            </View>
          </React.Fragment>
        )}
      </Popup>
    </View>
  );
};

export default FoodsOrder;
