// @ts-ignore
import React, { CSSProperties, FC, useEffect, useMemo, useState } from "react";
import { Picker, View } from "@tarojs/components";
import { DateFilterProps } from "./PropsType";
import { createNamespace } from "../utils";
import { secToDate } from "@/utils/common";
import classnames from "classnames";
import "./index.scss";

const DateFilter: FC<DateFilterProps> = props => {
  const [bem] = createNamespace("date-filter");

  const [nowValue, setNowValue] = useState(props.value);
  const [nowLabel, setNowLabel] = useState(props.value);

  useEffect(()=>{
    setNowValue(props.value);
  },[props.value]);

  useEffect(()=>{
    const _format = props.type === "day" ? "{y}年{M}月{d}日" : props.type === "month" ? "{y}年{M}月" : "{y}年";
    const _now = secToDate(new Date(nowValue).getTime(),_format);
    setNowLabel(_now);
    props.onChange && props.onChange(nowValue);
  },[nowValue]);

  const disabledPrev = useMemo(()=>{
    if(props.type === "day" && nowValue === "2020-01-01") return true;
    if(props.type === "month" && nowValue === "2020-01") return true;
    if(props.type === "year" && nowValue === "2020") return true;
    return props.disabledPrev;
  },[nowValue]);
  const disabledNext = useMemo(()=>{
    const _now = secToDate(new Date().getTime(),"{y}-{M}-{d}");
    const _nowSplit = _now.split("-");
    const _year = _nowSplit[0];
    const _month = _nowSplit[0] + "-" + _nowSplit[1];

    if(props.type === "day" && nowValue === _now) return true;
    if(props.type === "month" && nowValue === _month) return true;
    if(props.type === "year" && nowValue === _year) return true;
    return props.disabledNext;
  },[nowValue]);

  const getDate = (date, step, type) => {
    let _date = new Date(date);
    if(type === "day") _date.setDate(_date.getDate() + step);
    if(type === "month") _date.setMonth(_date.getMonth() + step);
    if(type === "year") _date.setFullYear(_date.getFullYear() + step);

    const _year = _date.getFullYear();
    const _month = _date.getMonth() + 1 < 10 ? "0" + (_date.getMonth() + 1) : _date.getMonth() + 1;
    const _day = _date.getDate() < 10 ? "0" + _date.getDate() : _date.getDate();
    if(type === "year") return String(_year);
    if(type === "month") return _year + "-" + _month;
    return _year + "-" + _month + "-" + _day;
  };
  const btnClick = (type) => {
    if(type === "prev" && disabledPrev) return;
    if(type === "next" && disabledNext) return;
    const step = type === "prev" ? -1 : 1;
    let _now = getDate(nowValue, step, props.type);
    setNowValue(_now);
  };
  const renderButton = (type) => {
    if(props.showPrev || props.showNext){
      return (
        <View
          className={classnames(bem("btn",{
            [`${type}`]: !!type,
            disbaled: (type === "prev" && disabledPrev) || (type === "next" && disabledNext)
          }))}
          onClick={()=>{ btnClick(type);}}
        >
          {type === "prev" ? <View className={classnames(bem("btn-arrow",type))} /> : null}
          <View className={classnames(bem("btn-text"))}>
            {`${type === "prev" ? "前" : "后"}一${props.type === "year" ? "年" : props.type === "month" ? "月" : "天"}`}
          </View>
          {type === "next" ? <View className={classnames(bem("btn-arrow",type))} /> : null}
        </View>
      );
    }
    return null;
  };

  const renderPicker = () => {
    return (
      <Picker
        mode="date"
        fields={props.type}
        value={nowValue}
        start={secToDate(new Date(2020,0,1).getTime(),"{y}-{M}-{d}")}
        end={secToDate(new Date().getTime(),"{y}-{M}-{d}")}
        onChange={(val)=>{setNowValue(val.detail.value);}}
      >
        <View className={classnames(bem("time"))}>
          <View className={classnames(bem("btn", "time"))}>
            <View className={classnames(bem("btn-text", "time"))}>{nowLabel}</View>
            <View className={classnames(bem("btn-triangle"))} />
          </View>
          {props.desc ? <View className={classnames(bem("desc"))}>按小时统计: 环比昨日</View> : null}
        </View>
      </Picker>
    );
  };

  const renderBorder = () => {
    if(props.border){
      return (
        <View className={classnames(bem("border"),"hairline","hairline--bottom")} style={{ borderColor: "#eeefef" }} />
      );
    }
    return null;
  };

  let styles: CSSProperties = {};
  if (props.bgColor) {
    styles.backgroundColor = props.bgColor;
  }
  return (
    <View
      className={classnames(bem(), props.className)}
      style={{ ...props.style,...styles }}
    >
      {renderButton("prev")}
      {renderPicker()}
      {renderButton("next")}
      {renderBorder()}
    </View>
  );
};

DateFilter.defaultProps = {
  type: "day",
  showPrev: true
};
export default DateFilter;

