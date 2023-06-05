import { combineReducers } from "redux";
import user from "@/store/reducers/actionTypes/user";
import shop from "@/store/reducers/actionTypes/shop";
import config from "@/store/reducers/actionTypes/config";

// @ts-ignore
export default combineReducers({
    ...user,
    ...config,
    ...shop
});