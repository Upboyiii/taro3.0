import { request } from "@/api/request";
import { requestPrefix } from "@/api/config";

export const statsApi = {
  access: {
    hour(data){
      return request({ url:requestPrefix["9009"] + "/access/order/hour", method: "post", data });
    },
    flow(data){
      return request({ url:requestPrefix["9009"] + "/access/order/flow", method: "post", data });
    },
    details(data){
      return request({ url:requestPrefix["9009"] + "/access/order/details", method: "post", data });
    },
    goods(data){
      return request({ url:requestPrefix["9009"] + "/access/order/goods", method: "post", data });
    },
    operation(data){
      return request({ url:requestPrefix["9009"] + "/access/order/operation", method: "post", data });
    }
  }
};

export default {
  statsApi
};
