import store from "@/store";
import Taro from "@tarojs/taro";
import to from "await-to-js";
import { base,APILayout } from "@/api/config";

export async function request(options){
    // if(options.url.indexOf("/v1/stat") > -1){
    //     options.url = base.api_stat + options.url;
    // }else{
        options.url = base.api_host + options.url;
    // }
    let [error, result] = await to(requests(options));
    if(error){
        console.log(error,"request-error");
    }
    const resul: APILayout<any> = result?.data;
    return resul;
}

function requests(options){
    const {
        url,
        data,
        method = "GET",
        load = true,
        loadText = "加载中...",
        autoLogin = true,
        successToast = false,
        failToast = true,
        headers = null,
        isStoreId = true
    } = options;
    const promise = new Promise<Taro.request.SuccessCallbackResult>((resolve, reject)=>{
        const { userInfo,storeInfo } = store.getState();
        const token = userInfo?.token?.token;
        if (autoLogin && !token) {
            reject();
        }
        let header: any = {
            "Content-Type": "application/json",
            platform: "rn"
        };
        if (storeInfo && storeInfo.store_id && isStoreId) {
            header["storeid"] = storeInfo.store_id;
        }
        if (token) {
            header["Authorization"] = token;
        }
        if (headers) {
            header = Object.assign({}, header, headers);
        }
        if (load) Taro.showLoading({ title: loadText, mask: false });
        Taro.request({
            url,
            data,
            method,
            header
        }).then((res: Taro.request.SuccessCallbackResult )=> {
            if (res.statusCode === 200) {
                if(successToast) {
                    setTimeout(()=>{
                        Taro.showToast({ title:res.data?.message,icon:"none" ,duration:3000 });
                    },300);
                };
                resolve(res);
            }
            reject("err");
        }).catch(err=>{
            console.log(err,"err");
            if(failToast) Taro.showToast({ title:err.errMsg,icon:"none" });
            reject(err);
        }).finally(()=>{
            if(load) Taro.hideLoading();
        });
    });
    return promise;
}
