import React, { FC, useRef, useState } from "react";
import Taro, { useLoad ,useUnload } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { eventCenterOff, eventCenterOn, getStorage, isAuthFn, navigateTo, setStorage } from "@/utils/library";
import { userApi } from "@/api/user";
import { setStoreConfig } from "@/store/actions/config";
import { defaultToolHot, toolIcons } from "@/pages/category/data";
import { connectWs } from "@/utils/socket";
import { refStoreShopConfig } from "@/utils/app";
import { setUserInfo } from "@/store/actions/user";
import { formatPrice, secToDate } from "@/utils/common";
import { statsApi } from "@/api/stats";
import { base } from "@/api/config";
import ScrollView from "@/components/scroll-view";
import store from "@/store";
import Navbar from "@/components/navbar";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import Skeleton from "@/components/skeleton";
import classnames from "classnames";
import "./index.scss";

const Dashboard: FC = () => {

  let common_key = useRef("");
  let all_key = useRef("");
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<any[]>([]);
  const _storeInfo = store?.getState()?.storeInfo || {};

  useLoad(() => {
    eventCenterOn("home",(res)=>{
      console.log(res,"isLogin来通知啦");
      const msg = res[0];
      switch (msg.type) {
        case "login":
          if(!store.getState().userInfo || !isAuthFn()){
            navigateTo({ method:"reLaunch",url:"/pages/sign/login/index" });
          }else {
            if(!store.getState().storeInfo){
              console.log("选择店铺1111");
              // Taro.navigateTo({ url:"/pages/amap/index" });
              navigateTo({ method:"reLaunch",url:"/pages/store/list/index" });
              return;
            }
            all_key.current = store.getState().userInfo.info.id + "_" + store.getState().storeInfo.store_id + "_all_menu";
            common_key.current = store.getState().userInfo.info.id + "_" + store.getState().storeInfo.store_id + "_common_menu";
            // 获取首页数据
            getHomeData().then();
            // 加入 ws
            connectWs();
          }
          break;
        case "ref_common_menu":
          setTools(msg?.data || []);
          break;
        default:
          break;
      }
    });
    // 重新reLaunch到首页
    if(store.getState().userInfo && store.getState().storeInfo.store_id){
      all_key.current = store.getState().userInfo.info.id + "_" + store.getState().storeInfo.store_id + "_all_menu";
      common_key.current = store.getState().userInfo.info.id + "_" + store.getState().storeInfo.store_id + "_common_menu";
      getHomeData().then();
    }
  });
  useUnload(() => {
    eventCenterOff("home");
    console.log("onUnload");
  });

  const getHomeData = async ()=>{
    // let a:any = common_key.current
    // Taro.clearStorage(a)

    console.log("--------getHomeData--------");
    // 获取菜单
    const menu = await getMenuList();
    console.log(menu,"menu");
    // @ts-ignore
    setTools(menu || []);
    // 连接ws
    // connectWs();
    // 获取店铺配置
    getStorage("STORECONFIG").then(res=>{
      if(res){
        store.dispatch(setStoreConfig(res));
      }
    });
    if(store.getState().storeInfo.mode > 1){
      refStoreShopConfig().then();
    }
  };

  const getMenuList =  ()=>{
    // 获取本地缓存菜单
    return new Promise(resolve => {
      setLoading(true);
      userApi.admin.getMenuList().then(res=>{
        if(res && res.code === 0){
          const list = res.data;
          // @ts-ignore
          getStorage(common_key.current).then(commonList=>{
            // 是否有常用
            let arr = [];
            if(commonList){
              for(let a = 0;a < commonList.length;a++){
                for(let i = 0;i < list.length;i++){
                  if(list[i].path === commonList[a].path){
                    // @ts-ignore
                    arr.push(list[i]);
                    break;
                  }
                }
              }
            }else {
              const defaultMenu = defaultToolHot;
              for(let a = 0;a < defaultMenu.length;a++){
                for(let i = 0;i < list.length;i++){
                  if(list[i].path === defaultMenu[a]){
                    // @ts-ignore
                    arr.push(list[i]);
                    break;
                  }
                }
              }
            }
            resolve(arr);
            getStats();
            setTimeout(()=>{
              // console.log("缓存所有菜单",common_key.current,all_key.current);
              // 保存缓存
              setStorage(common_key.current,arr);
              // 缓存所有菜单
              setStorage(all_key.current,list);

            });
          });
        }
      }).finally(()=>{
        setLoading(false);
      });
    });
  };

  const init = {
    goods_sales: 0, // 商品销量
    order_nums: 0, // 下单总数
    order_amount: 0, // 支付金额
    join_nums: 0, // 加入的人数
    refund_nums: 0, // 拒绝的人数
    exit_nums: 0 // 退出的人数
  };
  const [stats, setStats] = useState(init);

  // 获取进入实收金额
  const [statsLoading, setStatsLoading] = useState(false);
  const getStats  = ()=>{
    // console.log("_storeInfo",store.getState().storeInfo.store_id);
    const filter = {
      page:1,
      page_size: 99,
      store_id: store.getState().storeInfo.store_id,
      start_at: secToDate(new Date().getTime(), "{y}-{M}-{d}")
    };
    setStatsLoading(true);
    statsApi.access.operation(filter).then(res=>{
      if(!!res && res.code === 0){
        let _list = res?.data?.list || [];
        let _stats = init;
        if(_list.length > 0){
          _list.forEach(item=>{
            _stats.goods_sales = item?.goods_sales || 0;
            _stats.order_nums = item?.order_nums || 0;
            _stats.order_amount = item?.order_amount || 0;
            _stats.join_nums = item?.join_nums || 0;
            _stats.refund_nums = item?.refund_nums || 0;
            _stats.exit_nums = item?.exit_nums || 0;
          });
        }
        // console.log(_stats,"aaaa");
        setStats(_stats);
      }
    }).catch(res=>{
      Taro.showToast({ title: res.message, icon: "none" });
    }).finally(() => {
      setStatsLoading(false);
      setRefreshing(false);
    });
  };

  // @ts-ignore
  const [refreshing, setRefreshing] = useState(false);
  // @ts-ignore
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      getStats();
    },500);
  };

  const loginOut = ()=>{
    console.log("----------");
    Taro.showModal({
      title: "提示",
      content: "确定退出当前账号?",
      success:(res)=> {
        if (res.confirm) {
          store.dispatch(setUserInfo(""));
          Taro.reLaunch({ url:"/pages/sign/login/index" });
        }
      }
    });
  };

  const [bem] = createNamespace("stats","dashbord");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <Navbar
        leftArrow={false}
        title="彩豚商家"
        bgColor="#f7f8f8"
        right="退出"
        onClickRight={loginOut}
      />
      <ScrollView
        // refresh
        // refreshing={refreshing}
        // onRefresh={onRefresh}
      >
        {!loading ? (
          <React.Fragment>
            {!!_storeInfo && Object.keys(_storeInfo).length > 0 ? (
              <View className="card" style={{ marginTop: addUnit(12) }}>
                <Cell
                  border={false}
                  icon={base.file_host + "/" + _storeInfo.logo}
                  iconSize={44}
                  title={_storeInfo.name}
                  textStyle={{ fontSize: addUnit(16), fontWeight: "bold", marginBottom: addUnit(4) }}
                  labelStyle={{ marginTop: 0 }}
                  label={
                    <Tag type="primary" size="small" plain={false}>
                      {_storeInfo.chain === 1 ? "单店" : _storeInfo.mode === 1 ? "主店" : "分店"}
                    </Tag>
                  }
                  size="large"
                  arrow
                  onClick={() => {
                    // if(_storeInfo.chain === 1) return;
                    navigateTo({ method:"navigateTo",url:"/pages/store/list-detail/index?coid=" + _storeInfo.coid });
                    // navigateTo({ method:"navigateTo", url: "/pages/store/list/index" });
                  }}
                />
              </View>
            ) : null}
            <View
              className={classnames("card", bem())}
              style={!!_storeInfo && Object.keys(_storeInfo).length > 0 ? {} : { marginTop: addUnit(12) }}
              onClick={getStats}
            >
              <Image className={classnames(bem("bg"))} src={require("@/assets/others/stats-bg.png")} mode="aspectFill" />
              <View className={classnames(bem("body"))}>
                <View className={classnames(bem("due"))}>
                  <View className={classnames(bem("title","due"))}>今日销售额(元)</View>
                  <View className={classnames(bem("nums","due"))}>
                    {!statsLoading ? formatPrice(stats.order_amount) : "-.--"}
                  </View>
                </View>
                <View className={classnames(bem("list"))}>
                  <View className={classnames("hairline","hairline--top")} style={{ borderColor: "rgba(255,255,255,.2)" }} />
                  {/* <View className={classnames(bem("item","primary"))}>*/}
                  {/*  <View className={classnames(bem("title"))}>未收金额(元)</View>*/}
                  {/*  <View className={classnames(bem("nums"))}>*/}
                  {/*    0.00*/}
                  {/*  </View>*/}
                  {/* </View>*/}
                  <View className={classnames(bem("item"))}>
                    <View className={classnames(bem("title"))} style={{ textAlign: "left" }}>订单总数</View>
                    <View className={classnames(bem("nums"))} style={{ textAlign: "left" }}>
                      {!statsLoading ? stats.order_nums : "-"}
                    </View>
                  </View>
                  <View className={classnames(bem("item"))}>
                    <View className={classnames(bem("title"))} style={{ textAlign: "left" }}>商品销量</View>
                    <View className={classnames(bem("nums"))} style={{ textAlign: "left" }}>
                      {!statsLoading ? stats.goods_sales : "-"}
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View className="card" style={{ paddingTop: addUnit(16), paddingBottom: addUnit(8) }}>
              <View className="tool-group">
                 {tools.length > 0 ? tools.map((item,idx)=>{
                  return (
                    <View
                      className="tool-item"
                      key={`hot-${idx}`}
                      onClick={()=>{
                        navigateTo({ method:"navigateTo",url: item.path });
                      }}
                    >
                      <Image className="tool-item__icon" src={toolIcons[item.icon]} mode="aspectFill" />
                      <Text className="tool-item__text">{item.title}</Text>
                    </View>
                  );
                 }) : null}
                <View
                  className="tool-item"
                  onClick={()=>{
                    navigateTo({ url:"/pages/category/index",method:"navigateTo" });
                  }}
                >
                  <Image className="tool-item__icon" src={require("@/assets/category/all.png")} mode="aspectFill" />
                  <Text className="tool-item__text">全部</Text>
                </View>
              </View>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Skeleton card image imageSize={40} title row={1} />
            <View className="card" style={{ marginTop: addUnit(12) }}>
              <Skeleton title titleSize={[96, 16]} row={1} rowWidth={128} rowHeight={32} />
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Skeleton title titleSize={[96, 12]} row={1} rowWidth={128} rowHeight={24} style={{ flex: 1 }} border />
                <Skeleton title titleSize={[96, 12]} row={1} rowWidth={128} rowHeight={24} style={{ flex: 1 }} border />
              </View>
            </View>
            <View className="card" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
              {Array(10)
                .fill("")
                .map((_, i) => {
                  return (
                    <Skeleton
                      key={i}
                      animate={false}
                      align="center"
                      direction="column"
                      contentAlign="center"
                      image
                      imageShape="round"
                      imageSize={40}
                      title
                      titleSize={[36, 10]}
                      style={{ width: "20%" }}
                    />
                  );
                })}
            </View>
          </React.Fragment>
        )}
      </ScrollView>
    </View>
  );
};

export default Dashboard;
