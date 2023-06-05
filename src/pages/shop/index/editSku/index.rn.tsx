import React, { FC, useEffect, useRef, useState } from "react";
import { ScrollView, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getMainStore } from "@/utils/app";
import { shopApi } from "@/api/co_admin";
import { list2Tree } from "@/utils/common";
import { addUnit, scrollViewStyle } from "@/components/utils";
import { navigateTo } from "@/utils/library";
import store from "@/store";
import Field from "@/components/field";
import Switch from "@/components/switch";
import Cell from "@/components/cell";
import BottomBar from "@/components/bottom-bar";
import Button from "@/components/button";

const ShopEditSku: FC = () => {
  const router = useRouter();
  const [goodDetail,setGoodDetail] = useState({ goods_rule_sku:[] ,type:0 ,item_type:0 });
  const [goodSkus,setGoodSkus] = useState({});
  const [skuList,setSkuList] = useState<any>([]);
  const [loading,setLoading] = useState(false);

  // item_type 1 正常商品 2连锁商品 3分销商品
  const mainStore = useRef(0);// 店铺类型
  const isShowCustom = useRef({ price:false,stock:false });// 是否展示跟随上一级

  useEffect(() =>{
    mainStore.current = getMainStore();
    if(router.params?.goods_id){
      getGoodsDetail(parseInt(router.params?.goods_id));
    }
  },[]);

  const getGoodsDetail = async (goods_id)=>{
    setLoading(true);
    const resGood = await shopApi.goods.get({ id:goods_id });
    if(resGood.code === 0){
      setGoodDetail(resGood.data);
      // 分店获取是否可以设置价格
      // @ts-ignore
      if(mainStore.current > 2){
        if((resGood.data.item_type === 2 && store.getState().storeShop && store.getState().storeShop.custom_price === "1") ||  resGood.data.item_type === 3 ){
          isShowCustom.current.price = true;
        }
        // 分销商品不允许设置库存
        if(resGood.data.item_type === 2 && store.getState().storeShop && store.getState().storeShop.custom_stock === "1"){
          isShowCustom.current.stock = true;
        }
      }
    }
    const stocks = await shopApi.goods.stock({ goods_id });
    if(stocks.code === 0){
      setGoodSkus(stocks.data);
    }
    setLoading(false);
  };
  useEffect(()=>{
    if(goodDetail.goods_rule_sku && goodDetail.goods_rule_sku.length > 0){
      // 多sku
      if(goodDetail.goods_rule_sku.length > 1) {
        let list = list2Tree(goodDetail.goods_rule_sku, "pid", "sku_id");
        // @ts-ignore
        let newObj = getSku(list);
        if(newObj.newList && newObj.newList.length > 0){
          let newList = newObj.newList;
          newList.forEach(item=>{
              item.sku_price = goodSkus[item.sku_id] ? goodSkus[item.sku_id][0] : null;
              item.sku_price.price = item.sku_price.price ? item.sku_price.price / 100 : 0;
              item.sku_price.stock_num = item.sku_price.stock_num ?  item.sku_price.stock_num : 0;
              if(item.data.price_max || item.data.price_min){
                item.data.price_max = item.data.price_max ? item.data.price_max / 100 : 0;
                item.data.price_min = item.data.price_min ? item.data.price_min / 100 : 0;
              }
              item.pid_name = getPidName(item.pid,newObj.newMap);
              // 分店连锁
              if(mainStore.current > 2){
                if(isShowCustom.current.price && item.sku_price.price_id && item.sku_price.price_id > 0){
                  item.sku_price.is_price_up = true;
                }
                if(isShowCustom.current.stock && item.sku_price.stock_id && item.sku_price.stock_id > 0){
                  item.sku_price.is_stock_up = true;
                }
              }

          });
          console.log(newList, "newObj");
          setSkuList(newList);
        }
      }else {
        let item :any = goodDetail.goods_rule_sku[0];
        // @ts-ignore
        item.sku_price = goodSkus[item.sku_id] ? goodSkus[item.sku_id][0] : null;
        if(item.sku_price){
          item.sku_price.price = item.sku_price.price ? item.sku_price.price / 100 : 0;
          item.sku_price.stock_num = item.sku_price.stock_num ?  item.sku_price.stock_num : 0;
        }
        if(item?.data.price_max || item?.data.price_min){
          item.data.price_max = item.data.price_max ? item.data.price_max / 100 : 0;
          item.data.price_min = item.data.price_min ? item.data.price_min / 100 : 0;
        }

        if(mainStore.current > 2){
          if(isShowCustom.current.price && item.sku_price && item.sku_price.price_id && item.sku_price.price_id > 0){
            item.sku_price.is_price_up = true;
          }
          if(isShowCustom.current.stock && item.sku_price &&  item.sku_price.stock_id && item.sku_price.stock_id > 0){
            item.sku_price.is_stock_up = true;
          }
        }
        setSkuList([item]);
      }
   }
  },[goodSkus]);
  const getPidName = (pid,map,name = "")=>{
      let obj = map.get(pid);
      if(obj.pid > 0){
        name += getPidName(obj.pid,map,name) + "," + obj.name;
      }else {
        name = obj.name;
      }
      return name;
  };
  const getSku = (list,newList:any = [],newMap:Map<any, any> )=>{
    if(!newMap){
      newMap = new Map();
    }
    list.forEach(item=>{
      if(item.children){
        newMap.set(item.sku_id,{ name:item.name,pid:item.pid });
        getSku(item.children,newList,newMap);
      }else {
        newList.push(item);
      }
    });
    return { newList,newMap };
  };

  const saveSku = ()=>{
    if(skuList.length > 0){
      let list = JSON.parse(JSON.stringify(skuList));
      let index = -1,priceErrMsg = "",stockErrMsg = "",focus = "";
      for(let i = 0 ;i < list.length;i++){
        if(!list[i].sku_price.price || list[i].sku_price.price < 0){
          index = i;
          focus = "price_focus";
          priceErrMsg = list[i].pid_name + "销售价格不能为空";
          break;
        }
        if(!list[i].sku_price.stock_num || ( list[i].sku_price.stock_num !== -999 && list[i].sku_price.stock_num < 0)){
          index = i;
          focus = "stock_focus";
          stockErrMsg = list[i].pid_name + "库存不能为空";
          break;
        }
        list[i].sku_price.price = list[i].sku_price.price * 100;
        if(list[i].data.price_min){
          list[i].data.price_min = list[i].data.price_min * 100;
        }else {
          delete list[i].data.price_min;
        }
        if(list[i].data.price_max){
          list[i].data.price_max = list[i].data.price_max * 100;
        }else {
          delete list[i].data.price_max;
        }

      }
      if(index >= 0){
        setSkuList(val=>{
          val[index][focus] = true;
          if(priceErrMsg){
            val[index].priceErrMsg = priceErrMsg;
          }
          if(stockErrMsg){
            val[index].stockErrMsg = stockErrMsg;
          }
          return [...val];
        });
        return;
      }
      let sku_list = [];
      list.forEach(item=>{
        let obj:any = {};
        if(!item.data.price_max &&  !item.data.price_min) {
          delete item.data;
        }else {
          obj.data = item.data;
        }
        obj.sku_id = item.sku_id;

        if(item.sku_price.is_price_up){
          item.sku_price.price = -2;
        }
        if(item.sku_price.is_stock_up){
          item.sku_price.stock_num = -2;
        }
        if(item.sku_price.is_sell <= 2){
          obj.goods_price = [item.sku_price];
          // @ts-ignore
          sku_list.push(obj);
        }

      });
      if(sku_list.length <= 0){
        Taro.showToast({ title:"没有库存价格",icon:"error" });
        return;
      }
      let obj = {
        type:7,
        goods_rule_sku:{
          // @ts-ignore
          goods_id:parseInt(router.params?.goods_id),
          type:goodDetail.type,
          sku_list:sku_list
        }
      };
      // console.log(obj,"list");
      setLoading(true);
      shopApi.goods.operate(obj,{}).then(res=>{
        // console.log(res,"res");
        if(res.code === 0){
          Taro.showToast({ title:"保存成功",icon:"success" });
          setTimeout(()=>{
            navigateTo({ method:"navigateBack" });
          },800);
        } else {
          Taro.showToast({ title: res.message, icon:"error" });
        }
      }).catch((res)=>{
        Taro.showToast({ title: res.message, icon:"error" });
      })
      .finally(()=>{
        setLoading(false);
      });
    }
  };

  // 自己添加的商品  is_retail true 分销出去的商品 需要设置分销价格
  // 需设置售价区间
  const item_type1 = (item,index)=>{
    return (
      <View key={item.sku_id}  className="card" style={index === 0 ? { marginTop: addUnit(12) } : {}}>
        {skuList.length > 1 ? (
          <View className="card-header">
            <View className="card-header__title">{`${item.pid_name} - ${item.name}`}</View>
          </View>
        ) : null}
        <Field
          titleWidth={100}
          required
          type="number"
          title="零售价格(元)"
          focus={item.price_focus}
          errorMessage={item.priceErrMsg}
          error={!!item.priceErrMsg}
          errorIcon={false}
          value={item.sku_price.price}
          placeholder="零售价格"
          onChange={(val)=>{
            setSkuList(prevState => {
              let temp = JSON.parse(JSON.stringify(prevState));
              temp[index].sku_price.price = val;
              temp[index].priceErrMsg = "";
              return temp;
            });
          }}
        />
        {mainStore.current < 2 ? (
          <Field
            input={false}
            titleWidth={100}
            title="售价区间(元)"
            inputStyle={{ lineHeight: 1, display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 0, paddingBottom: 0 }}
          >
            <Field
              border={false}
              type="number"
              placeholder="最低售价"
              value={item.data.price_min}
              onChange={(val)=>{
                setSkuList(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp[index].data.price_min = val;
                  return temp;
                });
              }}
              style={{ paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 }}
            />
            <View style={{ paddingRight: addUnit(16) }}>至</View>
            <Field
              border={false}
              type="number"
              placeholder="最高售价"
              value={item.data.price_max}
              onChange={(val)=>{
                setSkuList(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp[index].data.price_max = val;
                  return temp;
                });
              }}
              style={{ paddingTop: 0, paddingLeft: 0, paddingBottom: 0, flex: 1 }}
            />
          </Field>
        ) : null}
        <Cell title="无限库存">
          <Switch checked={item.sku_price.stock_num === -999}
            onChange={(val)=>{
                setSkuList(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp[index].sku_price.stock_num = val ?  -999 : 0;
                  return temp;
                });
              }
            }>
          </Switch>
        </Cell>
        {item.sku_price.stock_num !== -999 ? (
          <Field
            required
            type="number"
            title="库存"
            focus={item.stock_focus}
            errorMessage={item.stockErrMsg}
            error={!!item.stockErrMsg}
            errorIcon={false}
            value={item.sku_price.stock_num}
            placeholder="输入库存数量"
            onChange={(val)=>{
              console.log(val);
              setSkuList(prevState => {
                let temp = JSON.parse(JSON.stringify(prevState));
                temp[index].sku_price.stock_num = parseInt(val) ;
                temp[index].stockErrMsg = "";
                return temp;
              });

            }}
          />
        ) : null}
        <Cell title="销售">
          <Switch checked={item.sku_price.is_sell === 1}
            onChange={(val)=>{
                setSkuList(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp[index].sku_price.is_sell = val ? 1 : 2 ;
                  return temp;
                });
              }}>
          </Switch>
        </Cell>
      </View>
    );
  };

  // 连锁商品
  // 需判断是否 可以自己设置价格 库存  可以设置跟随上一级或者自定义
  const item_type2 = (item,index)=>{
    return (
      <View key={item.sku_id}  className="card" style={index === 0 ? { marginTop: addUnit(12) } : {}}>
        {skuList.length > 1 ? (<View className="card-header"><View className="card-header__title">{`${item.pid_name} - ${item.name}`}</View></View>) : null}
        {isShowCustom.current.price ? (
          <React.Fragment>
            <Cell title="跟随主店价格">
              <Switch checked={item.sku_price.is_price_up}
                onChange={(val)=>{
                    setSkuList(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp[index].sku_price.is_price_up = val;
                      return temp;
                    });
                  }
                  }>
              </Switch>
            </Cell>
            <Field
              titleWidth={100}
              required
              disabled={item.sku_price.is_price_up}
              type="number"
              title="零售价格(元)"
              focus={item.price_focus}
              errorMessage={item.priceErrMsg}
              error={!!item.priceErrMsg}
              errorIcon={false}
              value={item.sku_price.price}
              placeholder="零售价格"
              onChange={(val)=>{
                setSkuList(prevState => {
                  let temp = JSON.parse(JSON.stringify(prevState));
                  temp[index].sku_price.price = val;
                  temp[index].priceErrMsg = "";
                  return temp;
                });
              }}
            />
          </React.Fragment>
        ) : (
          <Field
            titleWidth={100}
            required
            disabled
            type="number"
            title="零售价格(元)"
            value={item.sku_price.price}
            placeholder="零售价格"
            onChange={()=>{}}
          />
        )}

        {isShowCustom.current.stock ? (
          <React.Fragment>
          <Cell
            title="跟随主店库存"
            content={
              <Switch
                checked={item.sku_price.is_stock_up}
                onChange={(val)=>{
                  setSkuList(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp[index].sku_price.is_stock_up = val;
                    return temp;
                  });
                }}
              />
            }
          />
          {item.sku_price.is_stock_up ? (
            <React.Fragment>
              {item.sku_price.stock_num !== -999 ? (
                <Field
                  required
                  type="number"
                  title="库存"
                  disabled={item.sku_price.is_stock_up}
                  value={item.sku_price.stock_num}
                  placeholder="输入库存数量"
                  onChange={(val)=>{
                    setSkuList(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp[index].sku_price.stock_num = val;
                      temp[index].stockErrMsg = "";
                      return temp;
                    });
                  }}
                />
              ) : (
                <Cell
                  title="无限库存"
                  content={
                    <Switch
                      disabled={item.sku_price.is_stock_up}
                      checked={item.sku_price.stock_num === -999}
                      onChange={(val)=>{
                         setSkuList(prevState => {
                           let temp = JSON.parse(JSON.stringify(prevState));
                           temp[index].sku_price.stock_num = val ?  -999 : 0;
                           temp[index].stockErrMsg = "";
                           return temp;
                         });
                       }}
                    />
                  }
                />
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Cell
                title="无限库存"
                content={
                  <Switch
                    disabled={item.sku_price.is_stock_up}
                    checked={item.sku_price.stock_num === -999}
                    onChange={(val)=>{
                      setSkuList(prevState => {
                        let temp = JSON.parse(JSON.stringify(prevState));
                        temp[index].sku_price.stock_num = val ?  -999 : 0;
                        temp[index].stockErrMsg = "";
                        return temp;
                      });
                    }}
                  />
                }
              />
              {item.sku_price.stock_num !== -999 ? (
                <Field
                  required
                  type="number"
                  title="库存"
                  disabled={item.sku_price.is_stock_up}
                  focus={item.stock_focus}
                  errorMessage={item.stockErrMsg}
                  error={!!item.stockErrMsg}
                  errorIcon={false}
                  value={item.sku_price.stock_num}
                  placeholder="输入库存数量"
                  onChange={(val)=>{
                    setSkuList(prevState => {
                      let temp = JSON.parse(JSON.stringify(prevState));
                      temp[index].sku_price.stock_num = parseInt(val) ;
                      temp[index].stockErrMsg = "";
                      return temp;
                    });
                  }}
                />
              ) : null}
            </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {item.sku_price.stock_num !== -999 ? (
              <Field
                required
                type="number"
                title="库存"
                disabled
                value={item.sku_price.stock_num}
                placeholder="输入库存数量"
                onChange={()=>{}}
              />
            ) : (
            <Cell title="无限库存" >
               <Switch disabled checked onChange={()=>{}}></Switch>
            </Cell>
            )}
          </React.Fragment>
        )}
        <Cell
          title="销售"
          content={
            item.sku_price.is_sell <= 2 ? (
              <Switch checked={item.sku_price.is_sell === 1}
                onChange={(val)=>{
                  setSkuList(prevState => {
                    let temp = JSON.parse(JSON.stringify(prevState));
                    temp[index].sku_price.is_sell = val ? 1 : 2 ;
                    return temp;
                  });
                }}
              />
            ) : (
              <View style={{ color:"#999" }}>{item.sku_price.is_sell === 3 ? "待同步" : "已停止分销"}</View>
            )
          }
        />
      </View>
    );
  };
  // 分销商品
  // 只能修改价格 自己设置 或者跟随上一级
  // const item_type3 = ()=>{};
  return (
      <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }} >
        <KeyboardAwareScrollView extraScrollHeight={40}>
        <ScrollView scrollWithAnimation style={scrollViewStyle()} scrollY>
          {skuList.length > 0 ? (
            <React.Fragment>
              {skuList.map((item,index)=>{
                return (
                  <React.Fragment key={item.sku_id}>
                    {goodDetail.item_type === 1 ? item_type1(item,index) : item_type2(item,index)}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ) : null}
        </ScrollView>
        </KeyboardAwareScrollView>
        <BottomBar>
          <React.Fragment>
            <Button
              style={{ width: "70%" }}
              type="primary"
              loading={loading}
              onClick={saveSku}
            >
              保存
            </Button>
          </React.Fragment>
        </BottomBar>
      </View>
  ) ;
};
export default ShopEditSku;
