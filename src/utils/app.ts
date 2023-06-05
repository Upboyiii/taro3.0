// import { NativeModules } from "react-native";
import Taro from "@tarojs/taro";
import { settingApi } from "@/api/co_admin";
import store from "@/store";
// import RNFetchBlob from "rn-fetch-blob";
import { setStoreConfig, setStoreShop } from "@/store/actions/config";
import { showModal } from "@/utils/library";
// import JPush from "@/utils/push";
import { baseApi } from "@/api/base";
/**
 * 获取来源类型
 */
export const getPlatform = () => {
  if (process.env.TARO_ENV === "h5") {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i)?.includes("micromessenger")) {
      return { name: "wechat", id: 4 }; // 公众号、微信内置浏览器
    } else if (ua.match(/Alipay/i)?.includes("alipay")) {
      return { name: "alipay", id: 6 }; // 支付宝
    }
  }
  return { name: process.env.TARO_ENV || "", id: getPlatformId(process.env.TARO_ENV) };
};

/**
 * 获取接口对应的 平台ID
 * @param name
 */
export const getPlatformId = name => {
  switch (name) {
    case "web":
      return 1; // PC
    case "h5": // H5
      return 2;
    case "rn": // APP
      return 3;
    case "wechat": // 微信公众号
      return 4;
    case "weapp": // 微信小程序
      return 5;
    case "alipay": // 支付宝
      return 6;
    case "swan": // 百度小程序
      return 7;
    case "quickapp": // 快手小程序
      return 8;
    case "qq": // QQ小程序
      return 9;
    default:
      return 0;
  }
};

/**
 * 获取宿主 app 对应的 appId
 */
export const getHostAppid = () => {
  let ext: { id: string; appid: string; ver: string } = { id: "", appid: "", ver: "" };
  let extConfig;
  switch (process.env.TARO_ENV) {
    case "weapp":
      extConfig = Taro.getExtConfigSync ? Taro.getExtConfigSync() : {};
      ext.id = extConfig?.id ? extConfig?.id : "";
      ext.appid = extConfig?.appid ? extConfig?.appid : "";
      break;
    // case "alipay":
    //   // @ts-ignore
    //   // eslint-disable-next-line
    //   extConfig = my.getExtConfigSync ? my.getExtConfigSync() : {};
    //   ext.id = extConfig?.id ? extConfig?.id : "";
    //   ext.appid = extConfig?.appid ? extConfig?.appid : "";
    //   if (ext.appid === "") {
    //     // @ts-ignore
    //     // eslint-disable-next-line
    //     const appIdRes = my.getAppIdSync();
    //     ext.appid = appIdRes.appId;
    //   }
    //   break;
  }
  ext.ver = process.env.Ver || "";
  return ext;
};

/**
 * 更新获取企业配置信息
 */
export const refStoreConfig = () => {
  return new Promise((resolve,reject) => {
    settingApi.config.info({ alias: ["storeConfig", "store", "storePay", "coConfig", "coFood"] }).then(res=>{
      if(res.code === 0){
        store.dispatch(setStoreConfig(res.data));
        resolve(true);
      }
    }).catch(()=>{
      reject();
    });
  });
};

export const refStoreShopConfig = ()=>{
  return new Promise((resolve,reject) => {
    settingApi.config.info({ alias: ["storeShop"] }).then(res=>{
      if(res.code === 0){
        store.dispatch(setStoreShop( res.data.storeShop));
        resolve(true);
      }
    }).catch(()=>{
      reject();
    });
  });
};

/**
 * 获取店铺类型
 */
export const getMainStore = ()=>{
  let { storeInfo } = store.getState();
  if(!storeInfo){
    return 0;
  }
  let state = 0;
  if (storeInfo.chain === 2 && storeInfo.mode === 1) {
    state = 1; // 主店
  } else if (storeInfo.chain === 1) {
    state = 2; // 单店
  } else if (storeInfo.chain === 2 && storeInfo.mode === 2) {
    state = 3; // 分店
  } else if (storeInfo.chain === 2 && storeInfo.mode === 3) {
    state = 4; // 连锁店
  }
  return state;
};

/**
 * 更新App
 */
// export const update = (platform:string) => {
//   if (process.env.TARO_ENV === "weapp" || process.env.TARO_ENV === "tt") {
//     // 微信
//     const updateManager = Taro.getUpdateManager();
//     updateManager.onUpdateReady(function () {
//       showModal({
//         title: "更新提示",
//         content: "新版本已经准备好，是否重启应用？",
//         success: function (res) {
//           if (res.confirm) {
//             // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
//             updateManager.applyUpdate();
//           }
//         }
//       });
//     });
//   } else if (process.env.TARO_ENV === "rn") {
//     // React Native
//     let data = {};
//     if (platform == "android") {
//       data = { platform: 1,type:2, ver:"1.0.0" };
//     } else {
//       data = { platform: 2,type:2, ver:"1.0.0" };
//     }
//     baseApi.app.Config(data).then(res => {
//       console.log(res,"reeeeeeeeee");
//       if (res?.code === 0) {
//         if (res.data.android_ver) {
//           let data = res.data;
//           Taro.showModal({
//             title: "发现新版本-" + res.data.android_ver,
//             content: res.data.android_note,
//             success: function (res) {
//               if (res.confirm) {
//                 // 存在最新版本
//                 if (platform == "android") {
//                   const android = RNFetchBlob.android;
//                   // 配置手机系统通知栏下载文件通知，下载成功后点击通知可运行apk文件
//                   RNFetchBlob.config({
//                     addAndroidDownloads: {
//                       useDownloadManager: true,
//                       title: data.android_ver,
//                       mime: "application/vnd.android.package-archive",
//                       path: `${RNFetchBlob.fs.dirs.DownloadDir}/update.apk`,
//                       mediaScannable: true,
//                       notification: true
//                     }
//                   }).fetch(
//                       "GET", data.android_url
//                   ).then(res => {
//                     // 下载成功后自动打开安装已下载apk文件
//                     android.actionViewIntent(
//                         res.path(), "application/vnd.android.package-archive"
//                     );
//                   });
//                   console.log(res, platform);
//                 } else {
//                   // IOS 跳转到应用市场更新
//                   NativeModules.upgrade.upgrade(data.ios_storeid, msg => {
//                     if (msg === "YES") {
//                       NativeModules.upgrade.openAPPStore(data.ios_storeid);
//                     }
//                   });
//                 }
//               }
//             }
//           });
//         }
//       }
//     });
//   } else if (process.env.TARO_ENV === "alipay") {
//     // 支付宝
//     // @ts-ignore
//     // eslint-disable-next-line
//     const updateManager = my.getUpdateManager();
//     updateManager.onUpdateReady(function () {
//       // @ts-ignore
//       // eslint-disable-next-line
//       my.confirm({
//         title: "更新提示",
//         content: "新版本已经准备好，是否重启应用？",
//         success: function (res) {
//           if (res.confirm) {
//             // 新版本已经下载好，调用 applyUpdate 应用新版本并重启
//             updateManager.applyUpdate();
//           }
//         }
//       });
//     });
//   } else {
//     console.warn("请使用对应端的 getUpdateManager API");
//   }
//   return true;
// };

export const jpush = () => {
  // 初始化极光推送
  // JPush.setLoggerEnable(true);
  JPush.init({ appKey:"2f32881d538fb4e3536933d6",titchannelle:"dev",production:true });
  // 通知回调
  JPush.addNotificationListener(result => {
    console.log("notificationListener:" + JSON.stringify(result));
  });
  // 本地通知回调
  JPush.addLocalNotificationListener(result => {
    console.log("notificationListener:" + JSON.stringify(result));
  });
  JPush.addTagAliasListener(result => {
    console.log("notificationListener:" + JSON.stringify(result));
  });
  JPush.addMobileNumberListener(result => {
    console.log("mobileNumberListener:" + JSON.stringify(result));
  });
  JPush.getRegistrationID(result =>
      console.log("极光推送注册ID:" + JSON.stringify(result))
  );
};
