

// export const setToken = (data?: { expire: number; token: string }, expire?: number) => {
//   return { type: "TOKEN", payload: data, expire: expire ? expire : data?.expire };
// };

export const setStoreInfo = (data?: any) => {
  return { type: "STOREINFO", payload: data };
};

export const setUserInfo = (data?: any) => {
  return { type: "USERINFO", payload: data };
};
