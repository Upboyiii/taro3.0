import { persist_storage } from "@/store/persist";
// import { connect } from "react-redux";

// interface Action<T, D = string, N = number> {
//   type: T;
//   payload: D;
//   expire: N;
// }

// const token = (state = "",action)=>{
//   switch (action.type) {
//     case "TOKEN":
//       let data = action.payload == undefined ? "" : action.payload;
//       persist_storage(action.type,data.token,action.expire);
//       return data;
//     default:
//       return state;
//   }
// };
/**
 * cert_type//认证类型
 * chain// 单店或连锁(1,2)
 * mode// mode 经营模式 1主店 2直营 3加盟
 * state// state 店铺状态 0初始胡 1正常 2打烊 3禁止
 * @param state
 * @param action
 */
const storeInfo = (state = 0,action)=>{
  switch (action.type) {
    case "STOREINFO":
      persist_storage(action.type,action.payload);
      return action.payload;
    default:
      return state;
  }

};
const userInfo = (state = "",action)=>{
  console.log(action,"action");
  switch (action.type) {
    case "USERINFO":
      persist_storage(action.type,action.payload);
      return action.payload;
    default:
      return state;
  }

};
const SelectShop = (state = "",action)=>{
  console.log(action,"action");
  switch (action.type) {
    case "SELECTSHOP":
      persist_storage(action.type,action.payload);
      return action.payload;
    default:
      return state;
  }

};

export default {
  storeInfo,
  userInfo,
  SelectShop
};