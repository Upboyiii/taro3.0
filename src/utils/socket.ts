import { baseApi } from "@/api/base";
import store from "@/store";
import Taro from "@tarojs/taro";
import { eventCenterTrigger } from "@/utils/library";

class socket {
  url = "";
  socket = null;
  sceneObj = {}; // 加入的场景
  close = false;

  constructor() {
  }

  getUrl(retry) {
    baseApi.device.getWsUrl({ id: store.getState().storeInfo.store_id }).then(res => {
      if (res?.code === 0) {
        this.url = res?.data.url;
        this.connect(retry);
      }
    });
  }

  connect(retry) {
    if (!this.url) {
      this.getUrl(retry);
      return;
    }
    if(this.socket){
      // @ts-ignore
      this.socket.close();
    }
    const { store_id } = store.getState().storeInfo;
    const { token } = store.getState().userInfo;
    Taro.connectSocket({
      url: `${this.url}?storeid=${store_id}&platform=${process.env.TARO_ENV}&authorization=${
        typeof token !== "string" ? token?.token : ""
      }`,
      header: {
        storeid: store_id,
        platform: process.env.TARO_ENV
      },
      success() {
      }
    }).then(task => {
      task.onOpen(() => {
        // @ts-ignore
        this.socket = task;
        this.close = false;
        // 加入系统消息场景
        // this.connectScene("coSysMsg", {});
        // 重连
        if (retry) {
          // 获取加入的场景
          if (Object.keys(this.sceneObj).length > 0) {
            for (let key in this.sceneObj) {
              if (key && this.sceneObj[key]) {
                // 加入场景
                this.connectScene(key, this.sceneObj[key].data);
              }
            }
          }
        }
      });
      task.onMessage(res => {
        this.onMessage(res.data);
      });
      task.onClose(() => {
        console.log("----------场景wsonClose了--------");
        this.socket = null;
        this.close = true;
      });
      task.onError(() => {
        this.socket = null;
        this.close = true;
      });
    });
  }

  onMessage(data) {
    const msg = JSON.parse(data);
    console.log(msg, "收到消息");
    if ("alias" in msg) {
      if ("code" in msg) {
        switch (msg.code) {
          case 100: // 连接成功
            break;
          case 101: // 加入场景成功
            this.sceneObj[msg.alias].scene_id = msg.scene_id;
            msg.data.event = "connect";
            eventCenterTrigger(msg.alias,msg.data);
            break;
          case 2: // 其他错误
          case 103: // 收到返回需要登录的数据
            break;
          case 102: // 退出场景成功
            delete this.sceneObj[msg.alias];
            break;
          default:
            if ("event" in msg) {
              msg.data.event = msg.event;
            }
            eventCenterTrigger(msg.alias,msg.data);
            break;
        }
        return;
      }
      if ("event" in msg) {
        msg.data.event = msg.event;
      }
      eventCenterTrigger(msg.alias,msg.data);
    }
  }

  send(data) {
    console.log(data);
    // 重连
    if ((this.close || !this.socket) && data.event !== "close") {
      this.connect(true);
      return;
    }
    // @ts-ignore
    this.socket.send({ data: JSON.stringify(data) });
  }

  /**
   * 加入场景
   * @param alies 场景标签
   * @param data 场景数据
   */
  connectScene(alias, data) {
    // 已经加入
    if (this.sceneObj[alias]?.scene_id) {
      return;
    }
    // @ts-ignore
    this.send({
      alias,
      event: "connect",
      data
    });
    this.sceneObj[alias] = { data: data };
  }

  closeScene(alias) {
    // 已经加入场景
    if (this.sceneObj[alias]?.scene_id) {
      this.send({
        alias,
        event: "close",
        scene_id: this.sceneObj[alias]?.scene_id
      });
    }
  }

  /**
   * 发送场景消息
   * @param alies 场景标签
   * @param data 场景数据
   * @param to_client_ids [] 指定人id 发送给谁
   * @param to_scene_id 发送给其他场景id
   */
  sendScene(alias, data, to_client_ids, to_scene_id) {
    if (!this.sceneObj[alias].scene_id) {
      // 场景未加入
      return;
    }
    console.log(alias, data.event, this.sceneObj[alias].scene_id, "-----------发送场景消息------------");
    // @ts-ignore
    this.send({
      alias,
      event: data.event,
      to_scene_id: to_scene_id,
      to_client_id: to_client_ids,
      scene_id: this.sceneObj[alias].scene_id,
      data: data
    });
  }
}

const ws = new socket();

export function connectWs() {
  console.log("-------------场景connect!");
  ws.connect(false);
}

export function connectScene(alias, data) {
  ws.connectScene(alias, data);
}

export function closeScene(alias) {
  ws.closeScene(alias);
}

export function sendScene(alias, data, to_client_ids?, to_scene_id?) {
  ws.sendScene(alias, data, to_client_ids, to_scene_id);
}