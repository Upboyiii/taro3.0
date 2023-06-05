import React, { FC } from "react";
import { View, Image } from "@tarojs/components";
import { addUnit, createNamespace } from "@/components/utils";
import { navigateTo } from "@/utils/library";
import classnames from "classnames";
import "./index.scss";

const DataDashboard: FC = () => {

  const toolsList = [
    {
      icon: require("@/assets/icons/data/hour.png"),
      name: "分时统计",
      url: "/pageSub/pages/data/hour/index"
    },
    // {
    //   icon: require("@/assets/icons/data/tally.png"),
    //   name: "营收预览",
    //   url: "/pages/data/revenue/index"
    // },
    // {
    //   icon: require("@/assets/icons/data/prepay.png"),
    //   name: "盈亏分析",
    //   url: "/pages/data/profit/index"
    // },
    {
      icon: require("@/assets/icons/data/goods.png"),
      name: "商品统计",
      url: "/pageSub/pages/data/goods/index"
    },
    {
      icon: require("@/assets/icons/data/flowing.png"),
      name: "流水统计",
      url: "/pageSub/pages/data/flow/index"
    },
    {
      icon: require("@/assets/icons/data/platform.png"),
      name: "平台分析",
      url: "/pageSub/pages/data/platform/index"
    }
  ];

  const [tools] = createNamespace("tools", "finance");
  return (
    <View className="flex-page" style={{ flex: 1, backgroundColor: "#f7f8f8" }}>
      <View className="card" style={{ marginTop: addUnit(12) }}>
        <View className={classnames(tools())}>
          {toolsList.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <View
                  className={classnames(tools("item"))}
                  onClick={() => {
                    navigateTo({ method: "navigateTo", url: item.url });
                  }}
                >
                  {index < 3 ? <View className="hairline hairline--bottom" style={{ borderColor: "#eee" }} /> : null}
                  {index % 3 !== 2 ? <View className="hairline hairline--right" style={{ borderColor: "#eee" }} /> : null}
                  <Image className={classnames(tools("icon"))} src={item.icon} mode="aspectFill" />
                  <View className={classnames(tools("title"))}>{item.name}</View>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default DataDashboard;
