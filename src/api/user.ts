import { request } from "@/api/request";
import { requestPrefix } from "@/api/config";

export const userApi = {
    user:{
        login(data){
            return request({ url:requestPrefix["9002"] + "/base/signIn" ,method:"put",data, autoLogin: false });
        },
        forgot(data){
            return request({ url:requestPrefix["9002"] + "/base//user/forgot" ,method:"put",data, autoLogin: false });
        },
        register(data){
            return request({ url:requestPrefix["9002"] + "/base/signup" ,method:"put",data, autoLogin: false });
        },
        sendSMS(data){
            return request({ url:requestPrefix["9002"] + "/base/sms/send" ,method:"put", data, autoLogin: false });
        },
        getregion(data){
            return request({ url:requestPrefix["9002"] + "/base/location/region" ,method:"get" ,data });
        }
    },
    admin:{
        adminList(data) {
            return request({ url: requestPrefix["9004"] + "/user/admin/list", method: "post", data });
        },
        getMenuList(){
            return request({ url:requestPrefix["9004"] + "/user/menu/roles" ,method:"post",data:{ is_app:true } });
        },
        typeList() {
            return request({ url: requestPrefix["9004"] + "/user/type/list", method: "get" });
        },
        registerUser(data,opts){
            return request({ url:requestPrefix["9004"] + "/user/register" ,method:"put",data,...opts });
        },
        registerState(data,opts){
            return request({ url:requestPrefix["9004"] + "/user/register/state" ,method:"get",data ,...opts });
        },
        delStore(data) {
            return request({ url: requestPrefix["9004"] + "/user/store/delete", method: "delete", data });
        },
        cancelDelStore(data) {
            return request({ url: requestPrefix["9004"] + "/user/store/delete/cancel", method: "put", data });
        },
        init(data) {
            return request({ url: requestPrefix["9004"] + "/user/store/init", method: "put", data });
        }
    }
};

export default {
    userApi
};
