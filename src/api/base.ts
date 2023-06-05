import { request } from "@/api/request";
import { requestPrefix } from "@/api/config";

export const baseApi = {
  app:{
    Config(data){
      return request({ url:requestPrefix["9005"] + "/app/config" ,method:"post",data:data });
    }
  },
  device:{
    getWsUrl(data){
      return request({ url:requestPrefix["9006"] + "/device/ws" ,method:"post",data });
    }
  },
  region: {
    GetRegion(id) {
      return request({ url: requestPrefix["9002"] + "/base/location/region?id=" + id, method: "get" });
    },
    regionLngLat(data) {
      return request({ url: requestPrefix["9002"] + "/base/location/lngLat", method: "post", data });
    },
    regionName(data) {
      return request({ url: requestPrefix["9002"] + "/base/location/info", method: "post", data });
    }
  }
};

export const pluginApi = {
  plugin(method: string, plugin_id: number, plugin_label: string, plugin_data: string, apply_id: number = 0, rest = {}) {
    return request({
      url: `${requestPrefix["9004"]}/co/plugin/api`,
      method: method.toLocaleUpperCase(),
      data: {
        plugin_id,
        plugin_label,
        plugin_data,
        apply_id
      },
      ...rest
    });
  },

  // plugin({ method, plugin_id, plugin_label, plugin_data, apply_id }) {
  //   let options:any = {
  //     url: `${requestPrefix["9004"]}/co/plugin/api`,
  //     method: method,
  //     data: {
  //       apply_id: apply_id,
  //       plugin_label,
  //       plugin_id,
  //       plugin_data
  //     }
  //   };
  //   if (method.toLocaleLowerCase() === "get") {
  //     options.params = {
  //       apply_id: apply_id,
  //       plugin_label,
  //       plugin_id,
  //       plugin_data
  //     };
  //     delete options.data;
  //   }
  //   return request(options);
  // },
  page(data) {
    let { plugin_label, plugin_id, apply_id, params = null } = data;
    let obj = {
      apply_id,
      plugin_label,
      plugin_id,
      plugin_data: ""
    };
    if (!params) {
      !!data.apply_id && delete data.apply_id;
      !!data.plugin_label && delete data.plugin_label;
      !!data.plugin_id && delete data.plugin_id;
      obj.plugin_data = JSON.stringify(data);
      // console.log(obj.plugin_data);
    } else {
      obj.plugin_data = JSON.stringify(Object.prototype.toString.call(params) === "[object Object]" ? params : null);
    }
    return request({ url: requestPrefix["9004"] + "/co/plugin/api", method: "post", data: obj });
  }
};

export default {
  baseApi,
  pluginApi
};
