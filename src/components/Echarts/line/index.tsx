import React, { FC, useEffect, useState } from "react";
import { Text, View } from "@tarojs/components";
import { ECharts } from "react-native-echarts-wrapper";
import { EchartsLineProps } from "./PropsType";
import { addUnit, createNamespace } from "@/components/utils";
import classnames from "classnames";
import "./index.scss";

let chart;
const EchartsLine: FC<EchartsLineProps> = (props) => {
  const [bem] = createNamespace("echart-line");
  const [Option, setOption] = useState({});
  const [legend, setLegend] = useState<any>([]);
  const onRef = ref => {
    chart = ref;
  };

  useEffect(() => {
    LineList();
  }, []);

  useEffect(() => {
    initChart();
  }, [props.options]);

  const LineList = () => {
    let series_data: any = [];
    let legend_data: any = [];
    if (props.options && Array.isArray(props.options) && props.options.length > 0) {
      series_data = props.options.map(item => {
        legend_data.push({
          name: item?.name || "",
          color: item?.color || "#0080ff"
        });
        return {
          data: item.data,
          name: item?.name || "",
          type: "line",
          symbol: "none",
          smooth: true,
          lineStyle: {
            width: props.borderWidth,
            color: item?.color || "#0080ff"
          }
        };
      });
    }

    const option = {
      xAxis: {
        type: "category",
        data: props.label.data,
        axisLabel: {
          interval: props.label?.interval || 0,
          rotate: props.label?.rotate || "0"
        }
      },
      yAxis: { type: "value" },
      series: series_data
    };
    setOption(option);
    setLegend(legend_data);
  };

  const initChart = () => {
    let series_data1: any = [];
    let legend_data1: any = [];
    if (props.options && Array.isArray(props.options) && props.options.length > 0) {
      series_data1 = props.options.map(item => {
        legend_data1.push({
          name: item?.name || "",
          color: item?.color || "#0080ff"
        });
        return {
          data: item.data,
          name: item?.name || "",
          type: "line",
          symbol: "none",
          smooth: true,
          lineStyle: {
            width: props.borderWidth,
            color: item?.color || "#0080ff"
          }
        };
      });
    }

    const option = {
      xAxis: {
        type: "category",
        data: props.label.data,
        axisLabel: {
          interval: props.label?.interval || 0,
          rotate: props.label?.rotate || "0"
        }
      },
      yAxis: { type: "value" },
      series: series_data1
    };
    chart.setOption(option);
  };

  return (
    <View className={classnames(bem())}>
      {legend.length > 0 ? (
        <View className={classnames(bem("legend"))}>
          {legend.map((item, index) => {
            if (!item.name) return null;
            return (
              <React.Fragment key={`echarts-legend-${index}`}>
                <View className={classnames(bem("legend-item"))}>
                  <View className={classnames(bem("legend-icon"))} style={{ backgroundColor: item.color }} />
                  <Text className={classnames(bem("legend-text"))}>{item.name}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      ) : null}
      <View style={{ height: addUnit(props.height), position: "relative" }}>
        <ECharts
          option={Option}
          ref={onRef}
        />
      </View>
    </View>
  );
};

EchartsLine.defaultProps = {
  height: 300,
  borderWidth: 1
};

export default EchartsLine;
