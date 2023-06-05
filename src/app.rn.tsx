// @ts-ignore
import React, { Component, PropsWithChildren } from "react";
// @ts-ignore
import { StatusBar,Platform } from "react-native";
// @ts-ignore
import { AMapSdk } from "react-native-amap3d";
import { Provider } from "react-redux";
import { setStoreInfo, setUserInfo } from "@/store/actions/user";
import { eventCenterTrigger } from "@/utils/library";
import store from "@/store/index";
import Taro from "@tarojs/taro";
import "./app.scss";
// @ts-ignore
import * as app from "@/utils/app";

// AMapSdk.init(
//     Platform.select({
//       android: "639c7fe0f1b3fae7511e75d1068032a7",
//       ios: "1aa0b8ab0c77050e0503b3327001150c"
//     })
// );

class App extends Component<PropsWithChildren> {

  async componentDidMount () {
    try {
      await Taro.getStorage({ key:"USERINFO" }).then(res=>{
        console.log(res,"USERINFO");
        if(res && res.data){
          // @ts-ignore
          store.dispatch(setUserInfo(res.data));
        }
      }).catch(()=>{
        eventCenterTrigger("home",{ type:"login" });
      });
      await Taro.getStorage({ key:"STOREINFO" }).then(res=>{
        if(res && res.data){
          // @ts-ignore
          store.dispatch(setStoreInfo(res.data));
        }
      }).finally(()=>{
        eventCenterTrigger("home",{ type:"login" });
      });
    }catch (e) {
      console.log(e,"e");
    }
    // app.update(Platform.OS); // 执行升级
    // app.jpush(); // 极光推送
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return (
      <Provider store={store}>
        <StatusBar
          translucent
          backgroundColor="rgba(0, 0, 0, 0)"
          barStyle="dark-content"
        />
        {this.props.children}
      </Provider>
    );
  }
}
export default App;
