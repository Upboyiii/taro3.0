import { View } from '@tarojs/components'
import React, { FC, useEffect, useState } from "react";
import { EchartsPieProps } from "@/components/Echarts/pie/PropsType";
import { addUnit, createNamespace } from "@/components/utils";
// @ts-ignore
import * as echarts from "../../../components/Echarts/ec-canvas/echarts";
import classnames from "classnames";
import './index.scss'

let chart;

const EchartsPie: FC<EchartsPieProps> = (props) => {
  const [bem] = createNamespace("echart-pie");
  const [ecPie, setecPie] = useState({ onInit: getPieChart })
  const border = props.plain ? 100 - (props.borderWidth || 40) * 100 / (props.size || 200) : 0;

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
    const pieOptions = {
      tooltip: {
        show: true
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '10',
          fontWeight: 'bold',
        }
      },
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
    }
    setTimeout(() => {
      chart.setOption(pieOptions)
    }, 1000);
  }, [props.options])

  const pieOptions = {
    tooltip: {
      show: true
    },
    emphasis: {
      label: {
        show: true,
        fontSize: '10',
        fontWeight: 'bold',
      }
    },
    series: [
      {
        type: "pie",
        radius: [`${border}%`, "100%"], // 大小
        center: ["50%", "50%"],
        silent: true,
        labelLine: { show: false }, // 隐藏指示线
        label: { show: false }, // // 隐藏圆环上文字
        data: [{ value: 0, itemStyle: { color: "#4579f5" } }, { value: 0, itemStyle: { color: "#edf5fe" } }]
      }
    ]
  }

  function getPieChart(canvas, width, height, dpr) {
    chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // 像素
    });
    canvas.setChart(chart);

    var option = pieOptions;
    chart.setOption(option);
    return chart;
  }

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
        <ec-canvas id="mychart-dom-pie" canvas-id="mychart-pie" ec={ecPie} force-use-old-canvas="true"></ec-canvas>
      </View>
    </View>
  )
}

EchartsPie.defaultProps = {
  plain: true,
  size: 200,
  borderWidth: 40
};
export default EchartsPie;
