import Taro from "@tarojs/taro";
import store from "@/store";

/**
 * 设置本地存储（除rn，其它都是同步）
 * @param key
 * @param data
 * @param expire 到期时间戳
 */
export const setStorage = (key: string, data: any, expire?: number) => {
  if (expire != undefined && expire > 0) {
    data = {
      value: data,
      expire: expire
    };
  }
  if (process.env.TARO_ENV === "rn") {
    Taro.setStorage({
      key: key,
      data: data,
      complete: function () {
      }
    }).then();
  } else if (process.env.TARO_ENV === "alipay") {
    // @ts-ignore
    // eslint-disable-next-line
    my.setStorageSync({ key, data });
  } else {
    try {
      Taro.setStorageSync(key, data);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("setStorageSync error", key, data);
      }
    }
  }
};

/**
 *  获取本地存储（除rn，其它都是同步获取）
 **/
export const  getStorage = async  (key: string) => {
  let item: any = null;
  if (process.env.TARO_ENV === "rn") {
    // RN 兼容问题
    try {
      await Taro.getStorage({
        key: key,
        success: (res)=> {
          item = res.data;
        },
        complete:()=> {
        },fail:(err)=>{
          console.log(err,"err");
        }
      });
    }catch (e){
      console.log("---");
    }

  } else if (process.env.TARO_ENV === "alipay") {
    // @ts-ignore
    // eslint-disable-next-line
    item = my.getStorageSync({ key });
    if (item.success) {
      item = item.data;
    } else {
      item = "";
    }
  } else {
    item = Taro.getStorageSync(key);
  }
  if (item) {
    try {
      if (item.expire) {
        if (new Date().getTime() > item.expire * 1000) {
          removeStorage(key);
          return null;
        } else {
          return item.value;
        }
      } else {
        return item;
      }
    } catch (error) {
      return item;
    }
    return new Promise<any>((resolve) =>{
      resolve(item);
    });
  }
};

/**
 *  从本地缓存中移除指定 key
 **/
export const removeStorage = (key: string) => {
  if (process.env.TARO_ENV === "alipay") {
    // @ts-ignore
    // eslint-disable-next-line
    return my.removeStorage({ key: key });
  } else {
    return Taro.removeStorage({ key: key });
  }
};

/**
 *  清理本地数据缓存
 **/
export const clearStorage = () => {
  if (process.env.TARO_ENV === "alipay") {
    // @ts-ignore
    // eslint-disable-next-line
    return my.clearStorage();
  } else {
    return Taro.clearStorage();
  }
};


export interface navigateOpt {
  method: "switchTab" | "reLaunch" | "redirectTo" | "navigateTo" | "navigateBack";
  url?: string; // 页面地址
  params?: any; // 对象参数
  mustLogin?:boolean;
  delta?:number,
  option?: {
    // eslint-disable-next-line no-undef
    fail?: (res: TaroGeneral.CallbackResult) => void; // 失败
    // eslint-disable-next-line no-undef
    success?: (res: TaroGeneral.CallbackResult) => void; // 成功
  };
}

function initNavigateOpt(options: navigateOpt) {
  const defaults = {
    mustLogin: true,
    delta:1
  };
  return {
    ...defaults,
    ...options
  };
}
/**
 * url ?带参数 或 params对象传递参数
 * @param opts
 */
export function navigateTo(opts: navigateOpt) {
 let options = initNavigateOpt(opts);
    // 需要登录
  // @ts-ignore
  if(options.mustLogin && !isAuthFn()){
    Taro.reLaunch({ url:"/pages/sign/login/index" });
    return;
  }
  if (options?.params && options.url) {
    options.url += serialize(options.params);
  }
  console.log(options);
  Taro[options.method]({
    // @ts-ignore
    url:options.url,
    delta:options.delta
  });
}

/**
 * 对象url序列化
 * @param arg 对象
 */
export const serialize = (arg)=>{
  const keys = Object.keys(arg);
  if (keys.length > 0) {
    const key_value_arr = keys
      .map(key => {
        // console.log(arg[key],"arg[key]");
        if (arg[key] === undefined) {
          return "";
        }
        if(typeof arg[key] === "object"){
          return [key,JSON.stringify(arg[key])].join("=");
        }
        return [key, arg[key]].join("=");
      })
      .filter(item => !!item);
    return "?" + key_value_arr.join("&");
  }
};
/**
 * 是否登录
 */
export const isAuthFn = () => {
  let info: any = store.getState().userInfo;
  if (info?.token) {
    // 已登录
    return info.token.expire * 1000 > Date.now();
  }
  return false;
};

/**
 *监听全局消息通知
 * @param eventName
 * @param cb
 */
export const eventCenterOn = (eventName,cb:(...arg:any)=>void )=>{
  Taro.eventCenter.on(eventName,cb);
};
/**
 * 发送全局消息
 * @param eventName
 * @param arg
 */
export const eventCenterTrigger = (eventName,...arg:any)=>{
  Taro.eventCenter.trigger(eventName,arg);
};

export const eventCenterOff = (eventName)=>{
  Taro.eventCenter.off(eventName);
};

/**
 *  消息提示框
 **/
export const showToast = options => {
  const { display = true, title, duration = 2000, icon = "none", mask = false } = options;
  if (process.env.TARO_ENV == "alipay") {
    if (display) {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      my.showToast({
        content: title,
        duration: duration,
        type: icon === "error" ? "fail" : icon,
        success: function () {
          typeof options?.success === "function" && options.success();
        },
        fail: function () {
          typeof options?.fail === "function" && options.fail();
        },
        complete: function () {
          typeof options?.complete === "function" && options.complete();
        }
      });
    } else {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      my.hideToast();
    }
  } else {
    if (display) {
      Taro.showToast({
        title: title,
        duration: duration,
        mask: mask,
        icon: icon !== "none" && title.length > 7 ? "none" : icon,
        success: function () {
          typeof options?.success === "function" && options.success();
        },
        fail: function () {
          typeof options?.fail === "function" && options.fail();
        },
        complete: function () {
          typeof options?.complete === "function" && options.complete();
        }
      }).then();
    } else {
      Taro.hideToast();
    }
  }
};


/**
 * @desc 模态对话框
 */
export const showModal = options => {
  const { title = "", content = "", confirmText = "确认", cancelText = "取消", showCancel = false } = options;
  if (process.env.TARO_ENV == "alipay") {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    my.confirm({
      title,
      content,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      success: function (res) {
        if (typeof options?.success === "function") {
          if (res.confirm) {
            options.success(res);
          } else {
            options.success({ cancel: true });
          }
        }
      },
      fail: function (err) {
        typeof options?.fail === "function" && options.fail(err);
      },
      complete: function (result) {
        typeof options?.complete === "function" && options.complete(result);
      }
    });
  } else {
    let params = {
      title,
      content,
      confirmText,
      cancelText,
      showCancel
    };
    if (!!options?.confirmColor && typeof options.confirmColor === "string") {
      params["confirmColor"] = options.confirmColor;
    }
    if (!!options?.cancelColor && typeof options.cancelColor === "string") {
      params["cancelColor"] = options.cancelColor;
    }
    Taro.showModal({
      ...params,
      success: function (res) {
        typeof options?.success === "function" && options.success(res);
      },
      fail: function (err) {
        typeof options?.fail === "function" && options.fail(err);
      },
      complete: function (result) {
        typeof options?.complete === "function" && options.complete(result);
      }
    });
  }
};
