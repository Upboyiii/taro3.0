import { setStoreInfo, setUserInfo } from "@/store/actions/user";
import { setStorage ,getStorage,removeStorage } from "@/utils/library";
import store from "@/store/index";
import { setStoreConfig } from "@/store/actions/config";

export const persist_map: { [key: string]: Function } = {
  ["STOREINFO"]:setStoreInfo,
  ["USERINFO"]:setUserInfo,
  ["STORECONFIG"]:setStoreConfig
};

export const persist_keys = Object.keys(persist_map);

const persist = async () => {
  if (persist_keys.length > 0) {
    persist_keys.forEach(key => {
      let value =  getStorage(key); // 同步，rn异步
      if (value) {
        store.dispatch(persist_map[key](value, -1));
      }
    });
  }
};

/**
 * 根据缓存配置操作持久化
 * @param name
 * @param data
 * @param expire 到期时间戳 -1 不操作缓存
 */
export const persist_storage = (name: string, data?: any, expire?: number) => {
    if (persist_keys.indexOf(name) != -1) {
      data ? setStorage(name, data, expire) : removeStorage(name);
    }
};
export default persist;
