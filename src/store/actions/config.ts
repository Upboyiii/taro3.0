export const setStoreConfig = (data: string ) => {
    return { type: "STORECONFIG", payload: data };
};

// 分店连锁店商品配置
export const setStoreShop = (data: string ) => {
    return { type: "STORESHOP", payload: data };
};