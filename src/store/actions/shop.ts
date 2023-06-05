

// export const setToken = (data?: { expire: number; token: string }, expire?: number) => {
//   return { type: "TOKEN", payload: data, expire: expire ? expire : data?.expire };
// };

export const setSelectShop = (data?: any) => {
    return { type: "SELECTSHOP", payload: data };
};

export const setSelectGift = (data?: any) => {
    return { type: "SELECTGIFT", payload: data };
};

export const setSelectCoupon = (data?: any) => {
    return { type: "SELECTCOUPON", payload: data };
};

export const setSelectDetail = (data?: any) => {
    return { type: "SELECTDEATIL", payload: data };
};