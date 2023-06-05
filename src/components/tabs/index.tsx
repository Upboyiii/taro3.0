import React, { CSSProperties, FC } from "react";
import { View, ScrollView } from "@tarojs/components";
import { TabsProps } from "./PropsType";
import { createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const Tabs: FC<TabsProps> = props => {
  const [bem] = createNamespace("tabs");

  const itemClick = (value) => {
    props.onChange && props.onChange(value);
  };

  const renderItems = () => {
    if(!!props.options && Array.isArray(props.options) && props.options.length > 0){
      return props.options.map((item,index)=>{
        let styles: CSSProperties = {};
        if (props.color && (props.active !== (item[props.format?.value || "value"]))) {
          styles.color = props.color;
        }
        if(props.type === "line" && props.space && !Number.isNaN(Number(props.space))){
          styles.marginLeft = props.space;
          styles.marginRight = props.space;
        }
        if((props.active === (item[props.format?.value || "value"] || index))){
          if (props.activeColor) {
            styles.color = props.activeColor;
          }
          if (props.activeBgColor) {
            styles.backgroundColor = props.activeBgColor;
          }
        }
        if(!item[props.format?.label || "label"]) return null;
        return (
          <React.Fragment key={`tabs-${index}`}>
            {props.type === "line" && props.divider && index !== 0 ? (
              <View className={classnames(bem("divider"))} style={props.color ? { backgroundColor: props.color } : {}} />
            ) : null}
            <View
              className={classnames(bem("item",
                {
                  [`${props.type}`]: props.type,
                  [`${props.align}`]: props.align && props.type === "line",
                  [`${props.type}-active`]: props.type && props.active === (item[props.format?.value || "value"] || index),
                  scroll: props.scroll
                }
              ))}
              style={(props.active === (item[props.format?.value || "value"] || index)) && !!props.activeColor ? { color: props.activeColor } : styles}
              onClick={()=>{
                itemClick(item[props.format?.value || "value"] || index);
              }}
            >
              {item[props.format?.label || "label"]}
              {props.type === "line" && props.active === (item[props.format?.value || "value"] || index) ? (
                <View className={classnames(bem("activer"))} />
              ) : null}
            </View>
          </React.Fragment>
        );
      });
    }else{
      return null;
    }
  };

  const renderContent = () => {
    if(props.scroll){
      return (
        <ScrollView className={classnames(bem("scroll-view"))} scrollWithAnimation style={{ flex: 1, width: "100%" }} scrollX>
          {renderItems()}
        </ScrollView>
      );
    }else{
      return renderItems();
    }
  };

  const renderBorder = () => {
    if(props.border){
      return (
        <React.Fragment>
          {props.border !== "top" ? (
            <View className={classnames(bem("border"),"hairline","hairline--bottom")} />
          ) : null}
          {props.border === "top" || props.border === "top-bottom" ? (
            <View className={classnames(bem("border"),"hairline","hairline--top")} />
          ) : null}
        </React.Fragment>
      );
    }
    return null;
  };

  if(!!props.options && Array.isArray(props.options) && props.options.length > 0){
    let styles: CSSProperties = {};
    if (props.bgColor) {
      styles.backgroundColor = props.bgColor;
    }
    return (
      <View
        className={classnames(
          bem({
            [`${props.type}`]: props.type,
            [`${props.align}`]: props.align,
            scroll: props.scroll
          }),
          props.className
        )}
        style={{ ...props.style,...styles }}
      >
        {renderContent()}
        {renderBorder()}
      </View>
    );
  }else{
    return null;
  }
};

export default Tabs;

Tabs.defaultProps = {
  type: "line",
  align: "center",
  format: {
    label: "label",
    value: "value"
  }
};
