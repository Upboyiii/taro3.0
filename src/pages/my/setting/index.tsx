import React, { FC } from "react";
import { View } from "@tarojs/components";
import { setUserInfo } from "@/store/actions/user";
import { addUnit } from "@/components/utils";
import Cell from "@/components/cell";
import Button from "@/components/button";
import Taro from "@tarojs/taro";
import store from "@/store";
import "./index.scss";

const My: FC = () => {

  const loginOut = ()=>{
    console.log("----------");
    Taro.showModal({
      title: "提示",
      content: "确定退出当前账号?",
      success:(res)=> {
        if (res.confirm) {
          store.dispatch(setUserInfo(""));
          Taro.reLaunch({ url:"/pages/sign/login/index" });
        }
      }
    });
  };

  return (
    <React.Fragment>
      <View className="card" style={{ marginTop: addUnit(12) }}>
        <Cell
          border={false}
          title="隐私政策"
          arrow
          clickable
          onClick={() => {
            Taro.navigateTo({ url: `/pages/webView/index?url=https://www.mall.com/rule/privacy/&title=隐私政策` });
          }}
        />
      </View>
      <View className="bottom-bar">
        <Button
          style={{ width: "70%" }}
          type="primary"
          plain
          hairline
          onClick={loginOut}
        >
          退出登录
        </Button>
      </View>
    </React.Fragment>
  );
};

export default My;
