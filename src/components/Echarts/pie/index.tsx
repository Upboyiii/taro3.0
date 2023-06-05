import React, { FC, useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { ECharts } from "react-native-echarts-wrapper";
import { EchartsPieProps } from "@/components/Echarts/pie/PropsType";
import { addUnit, createNamespace } from "@/components/utils";
import classnames from "classnames";
import "./index.scss";

const EchartsPie: FC<EchartsPieProps> = (props) => {
  const [bem] = createNamespace("echart-pie");
  const [Option, setOption] = useState({});

  useEffect(() => {
    let series_data: any = [];
    if (props.options && Array.isArray(props.options) && props.options.length > 0) {
      series_data = props.options.map(item => {
        return {
          value: item.value || 0,
          itemStyle: {
            borderRadius: item.borderRadius ? item.borderRadius : props.borderRadius ? 999 : 0,
            color: item.color
          }
        };
      });
    }
    const border = props.plain ? 100 - (props.borderWidth || 40) * 100 / (props.size || 200) : 0;
    const option = {
      series: [
        {
          type: "pie",
          radius: [`${border}%`, "100%"], // 大小
          center: ["50%", "50%"],
          silent: true,
          labelLine: { show: false }, // 隐藏指示线
          label: { show: false }, // // 隐藏圆环上文字
          data: series_data
        }
      ]
    };
    setOption(option);
  }, [props.options]);

  const renderText = () => {
    if (props.title || props.text || props.desc) {
      return (
        <View className={classnames(bem("content"))}>
          {props.children ? props.children : (
            <React.Fragment>
              {props.title ? (
                <View className={classnames(bem("title"))} style={props.titleStyle}>{props.title}</View>
              ) : null}
              {props.text ? (
                <View className={classnames(bem("text"))} style={props.textStyle}>{props.text}</View>
              ) : null}
              {props.desc ? (
                <View className={classnames(bem("desc"))} style={props.descStyle}>{props.desc}</View>
              ) : null}
            </React.Fragment>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <View className={classnames(bem())}>
      <View style={{ width: addUnit(props.size), height: addUnit(props.size), position: "relative" }}>
        {renderText()}
        <ECharts option={Option} />
      </View>
    </View>
  );
};

EchartsPie.defaultProps = {
  plain: true,
  size: 200,
  borderWidth: 40
};
export default EchartsPie;
