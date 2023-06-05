// @ts-ignore
import React, { FC, useEffect } from "react";
import { View } from "@tarojs/components";
import Taro, { useRouter, getCurrentInstance } from "@tarojs/taro";
import { addUnit, createNamespace } from "@/components/utils";
import Cell from "@/components/cell";
import classnames from "classnames";
import "../index/index.scss";

const CreateMode: FC = () => {
  // @ts-ignore
  const [bem] = createNamespace("store", "create");
  const router = useRouter();
  const type: any = router.params.type;   // 所属企业分类ID 主业

  return (
    <View className="flex-page" style={{ backgroundColor: "#f7f8f8", flex: 1 }}>
      {/* <View className={classnames(bem("header"))}>*/}
      {/*  <View className={classnames(bem("header-title"))}>店铺模式</View>*/}
      {/*  <View className={classnames(bem("header-desc"))}>3步极速开店</View>*/}
      {/* </View>*/}
      {/* <View className={classnames(bem("title"))}>选择店铺模式</View>*/}
      <View className={classnames("card")} style={{ marginTop: addUnit(12) }}>
        <Cell
          style={{ paddingTop: addUnit(24), paddingRight: addUnit(24), paddingBottom: addUnit(24), paddingLeft: addUnit(24) }}
          border={false}
          title="单店版"
          textStyle={{ fontSize: addUnit(24), lineHeight: addUnit(28), fontWeight: "bold", marginBottom: addUnit(8) }}
          label="适用单个网店的商家"
          labelStyle={{ fontSize: addUnit(14), color: "#666" }}
          arrow
          clickable
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/store/create/info/index?mode=1&type=${type}`
            });
          }}
        />
        <Cell
          borderStyle={{ left: addUnit(24) }}
          style={{ paddingRight: addUnit(24), paddingLeft: addUnit(24) }}
          contentStyle={{ flexDirection: "row", fontSize: addUnit(12), lineHeight: addUnit(18), color: "#999" }}
          content="单个线上网店，可一站式管理网店的店铺装修、商品、订单、营销、会员、资金等数据。"
        />
      </View>
      <View className={classnames("card")}>
        <Cell
          style={{ paddingTop: addUnit(24), paddingRight: addUnit(24), paddingBottom: addUnit(24), paddingLeft: addUnit(24) }}
          title="多店版"
          textStyle={{ fontSize: addUnit(24), lineHeight: addUnit(28), fontWeight: "bold", marginBottom: addUnit(8) }}
          label="适用多家网店的连锁商家"
          labelStyle={{ fontSize: addUnit(14), color: "#666" }}
          borderStyle={{ left: addUnit(24) }}
          arrow
          clickable
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/store/create/info/index?mode=2&type=${type}`
            });
          }}
        />
        <Cell
          borderStyle={{ left: addUnit(24) }}
          style={{ paddingRight: addUnit(24), paddingLeft: addUnit(24) }}
          contentStyle={{ flexDirection: "row", fontSize: addUnit(12), lineHeight: addUnit(18), color: "#999" }}
          content="总部可针对店铺经营模式（直营/加盟）灵活配置管理方式， 资金、商品、会员可交由店铺独立管理，营销活动和网店可由总部统一维护或由店铺自己经营。"
        />
      </View>
    </View>
  );
};

export default CreateMode;
