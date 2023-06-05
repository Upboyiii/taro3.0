import React, { CSSProperties, FC, isValidElement, useMemo } from "react";
import { Image, View } from "@tarojs/components";
import { createNamespace } from "@/components/utils";
import { StepsItemProps, StepsProps } from "./PropsType";
import classnames from "classnames";
import "./index.scss";

const Steps: FC<StepsProps> = ({ children, className, style, ...props }) => {
  const [bem] = createNamespace("steps");
  return (
    <View className={classnames(bem([props.direction]),className)} style={style}>
      {React.Children.toArray(children)
        .filter(Boolean)
        .map((child: React.ReactElement, index: number) =>{
          if(!child) return null;
          return React.cloneElement(child, {
            index,
            total: React.Children.toArray(children).length,
            parent: props
          });
        })}
    </View>
  );
};
Steps.defaultProps = {
  active: 0,
  direction: "horizontal"
};

const StepsItem: FC<StepsItemProps> = (props) => {
  const [bem] = createNamespace("step");

  const { index, total = 0, parent: parentProps } = props;

  if (!parentProps) {
    if (process.env.NODE_ENV !== "production") {
      console.error("步骤组件错误：步骤必须存在");
    }
  }

  const getStatus = () => {
    // @ts-ignore
    const active = +parentProps.active;
    // @ts-ignore
    if (index < active) return "finish";
    return index === active ? "active" : "waiting";
  };

  const isActive = () => getStatus() === "active";

  const status = getStatus();

  const classes = {
    [`${parentProps?.direction}`]: parentProps?.direction,
    [`${status}`]: status
  };


  const itemStyle = useMemo(() => {
    const styles: CSSProperties = {};
    if (isActive() || getStatus() === "finish") {
      styles.color = parentProps?.activeColor;
    }
    if (getStatus() === "waiting") {
      styles.color = parentProps?.inactiveColor;
    }
    /* if(parentProps?.direction === "horizontal" && index === 0){
      styles.flex = "0 1 auto";
    }*/
    return styles;
    // @ts-ignore
  }, [index, parentProps.active, parentProps.activeColor, parentProps.inactiveColor, parentProps.direction]);

  const onClickStep = () => {
    // @ts-ignore
    if (parentProps?.onClickStep) parentProps.onClickStep(index);
  };

  const renderIcon = () => {
    const finishIcon = props.finishIcon ?? parentProps?.finishIcon;
    const activeIcon = props.activeIcon ?? parentProps?.activeIcon;
    const inactiveIcon = props.inactiveIcon ?? parentProps?.inactiveIcon;

    let styles:CSSProperties = {};
    if(parentProps?.activeCheckColor && (isActive() || getStatus() === "finish")){
      styles.borderColor = parentProps.activeCheckColor;
    }

    if (isActive()) {
      if (activeIcon) {
        if (typeof activeIcon !== "string" && isValidElement(activeIcon)) {
          return activeIcon;
        }else{
          // @ts-ignore
          return <Image src={activeIcon} mode="aspectFill" />;
        }
      }else{
        return <View className={classnames(bem("check"))} style={styles} />;
      }
    }

    if (getStatus() === "finish"){
      if (finishIcon) {
        if (typeof finishIcon !== "string" && isValidElement(finishIcon)) {
          return finishIcon;
        }else{
          // @ts-ignore
          return <Image src={finishIcon} mode="aspectFill" />;
        }
      }else{
        return <View className={classnames(bem("finish"))} style={styles} />;
      }
    }

    if (inactiveIcon) {
      if (typeof inactiveIcon !== "string" && isValidElement(inactiveIcon)) {
        return inactiveIcon;
      }else{
        // @ts-ignore
        return <Image src={inactiveIcon} mode="aspectFill" />;
      }
    }

    return null;
  };

  const renderIndicator = () => {
    let lineStyle:CSSProperties = {};
    if(parentProps?.inactiveColor){
      lineStyle.backgroundColor = parentProps.inactiveColor;
    }
    if(parentProps?.activeColor && (getStatus() === "finish" || getStatus() === "active")){
      lineStyle.backgroundColor = parentProps.activeColor;
    }

    let iconStyle:CSSProperties = {};
    if(parentProps?.inactiveColor){
      iconStyle.backgroundColor = parentProps.inactiveColor;
    }
    if(parentProps?.activeColor && (getStatus() === "finish" || getStatus() === "active")){
      iconStyle.backgroundColor = parentProps.activeColor;
    }

    return (
      <View className={classnames(bem("indicator", { ...classes }))}>
        <View className={classnames(bem("line",{ ...classes }))} style={{ opacity: index === 0 ? 0 : 1, ...lineStyle }} />
        <View className={classnames(bem("icon",{ [status === "active" ? "checked" : "dot"]: status, ...classes }))} style={iconStyle}>
          {renderIcon()}
        </View>
        <View className={classnames(bem("line",{ ...classes }))} style={{ opacity: index === total - 1  ? 0 : 1, ...lineStyle }} />
      </View>
    );
  };

  const renderContent = () => {
    let styles:CSSProperties = {};
    if(parentProps?.inactiveColor){
      styles.color = parentProps.inactiveColor;
    }
    if(parentProps?.activeColor && (getStatus() === "finish" || getStatus() === "active")){
      styles.color = parentProps.activeColor;
    }
    return (
      <View
        className={classnames(bem("content",{ ...classes, reverse: parentProps?.reverse && parentProps?.direction === "horizontal" }))}
        style={props.contentStyle}
      >
        {props.children ? props.children : (
          <React.Fragment>
            <View className={classnames(bem("title",{ ...classes }))} style={{ ...styles,...props.titleStyle }}>
              {props.title}
            </View>
            {props.desc ? (
              <View className={classnames(bem("desc",{ ...classes }))} style={{ ...styles,...props.descStyle }}>
                {props.desc}
              </View>
            ) : null}
            {props.time ? (
              <View className={classnames(bem("time",{ ...classes }))} style={props.timeStyle}>
                {props.time}
              </View>
            ) : null}
          </React.Fragment>
        )}
      </View>
    );
  };

  return (
    <View
      style={itemStyle}
      className={classnames(
        bem({
          reverse: parentProps?.reverse && parentProps?.direction === "horizontal",
          active: isActive(),
          ...classes
        }),
        props.className
      )}
      onClick={onClickStep}
    >
      {parentProps?.reverse && parentProps?.direction === "horizontal" ? (
        <React.Fragment>
          {renderContent()}
          {renderIndicator()}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {renderIndicator()}
          {renderContent()}
        </React.Fragment>
      )}
    </View>
  );
};


const OwlSteps = Object.assign(Steps, { item: StepsItem });
export default OwlSteps;
