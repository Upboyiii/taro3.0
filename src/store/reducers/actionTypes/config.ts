import { persist_storage } from "@/store/persist";

const storeConfig = (state = "",action)=>{
    switch (action.type) {
        case "STORECONFIG":
            let data = action.payload == undefined ? "" : action.payload;
            persist_storage(action.type,data);
            return data;
        default:
            return state;
    }
};
const storeShop = (state = "",action)=>{
    switch (action.type) {
        case "STORESHOP":
            let data = action.payload == undefined ? "" : action.payload;
            persist_storage(action.type,data);
            return data;
        default:
            return state;
    }
};

export default {
    storeConfig,// 店铺常用配置
    storeShop// 分店商品配置数据
};