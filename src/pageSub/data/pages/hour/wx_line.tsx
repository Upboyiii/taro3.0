import React, { FC, useEffect, useState } from "react";
import { EchartsLineProps } from "@/components/Echarts/line/PropsType";
import { addUnit, createNamespace } from "@/components/utils";
import { Text, View } from "@tarojs/components";
// @ts-ignore
import * as echarts from "../../../../components/Echarts/ec-canvas/echarts";
import classnames from "classnames";

let chart;

const EchartsLine: FC<EchartsLineProps> = (props) => {
  const [bem] = createNamespace("echart-pie");
  const [ecLine, setecLine] = useState({ onInit: getLineChart })
  const [legend, setlegend] = useState<any>([])

  useEffect(() => {
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
    setlegend(legend_data)
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
    setTimeout(() => {
      chart.setOption(option)
    }, 1000);

  }, [props.options])

  function getLineChart(canvas, width, height, dpr) {
    chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // 像素
    });
    canvas.setChart(chart);

    var option = LineOptions;
    chart.setOption(option);
    return chart;
  }

  const LineOptions = {
    xAxis: {
      type: "category",
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
        interval: props.label?.interval || 0,
        rotate: props.label?.rotate || "0"
      }
    },
    yAxis: { type: "value" },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
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
        <ec-canvas id="mychart-dom-line" canvas-id="mychart-line" ec={ecLine} force-use-old-canvas="true"></ec-canvas>
      </View>
    </View>
  )
}

EchartsLine.defaultProps = {
  height: 300,
  borderWidth: 1
};
export default EchartsLine;
