import React, { FC } from "react";
import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import { addUnit } from "@/components/utils";
import Cell from "@/components/cell";
import Tag from "@/components/tag";
import "./index.scss";
import store from "@/store";
import { navigateTo } from "@/utils/library";
import { base } from "@/api/config";

const My: FC = () => {
  const _user = store.getState().userInfo;
  const _storeInfo = store.getState().storeInfo;

  return (
    <React.Fragment>
      <View className="cards">
        <Cell
          border={false}
          // icon="https://img14.360buyimg.com/pop/jfs/t1/138480/1/24677/141681/61a239e4Effd6e2ab/ea09bd3fbcc6270b.jpg"
          iconSize={44}
          iconStyle={{ marginRight: addUnit(12) }}
          icon={
            <View
              style={{
                width: addUnit(4),
                height: addUnit(36),
                backgroundColor: "#e5e5e5",
                borderRadius: addUnit(4)
              }}
            />
          }
          title={_user?.info?.nick_name}
          textStyle={{ fontSize: addUnit(16), fontWeight: "bold" }}
          label={_user?.info?.phone}
          size="large"
          rightIcon={
            <Image
              style={{ width: addUnit(24), height: addUnit(24) }}
              src={require("@/assets/icons/setting.png")}
              mode="aspectFill"
            />
          }
          onRight={() => {
            Taro.navigateTo({ url: "/pages/my/setting/index" });
          }}
          onClick={() => {
            Taro.navigateTo({ url: "/pages/my/info/index" });
          }}
        />
      </View>
      <View className="card">
        <Cell
          border={false}
          icon={base.file_host + "/" + _storeInfo.logo}
          iconSize={44}
          title={_storeInfo.name}
          textStyle={{ fontSize: addUnit(16), fontWeight: "bold", marginBottom: addUnit(4) }}
          labelStyle={{ marginTop: 0 }}
          label={
            <Tag type="primary" size="small" plain={false}>
              {_storeInfo.chain === 1 ? "单店" : _storeInfo.mode === 1 ? "主店" : "分店"}
            </Tag>
          }
          size="large"
          arrow
          onClick={() => {
            navigateTo({ method:"navigateTo",url:"/pages/store/list/index" });
          }}
        />
      </View>
    </React.Fragment>
  );
};

export default My;
