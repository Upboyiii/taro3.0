import React, { CSSProperties, FC, isValidElement } from "react";
import { View, Image } from "@tarojs/components";
import { CellProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const Cell: FC<CellProps> = props => {
  const [bem] = createNamespace("cell");

  const renderBorder = () => {
    if(props.border || props.divider){
      return (
        <View className={classnames(bem("border", { hasicon: props.icon && props.border }))} style={props.borderStyle} />
      );
    }
    return null;
  };

  const renderIcon = () => {
    let styles: CSSProperties = {};
    if (props.iconSize) {
      styles.width = addUnit(props.iconSize);
      styles.height = addUnit(props.iconSize);
    }

    if (props.icon) {
      return (
        <React.Fragment>
          {typeof props.icon !== "string" && isValidElement(props.icon) ? (
            <View
              className={classnames(bem("icon"), props.iconClass)}
              style={props.iconStyle}
            >
              {props.icon}
            </View>
          ) : (
            <Image
              className={classnames(bem("icon",{ image: true, round: props.iconRound }), props.iconClass)}
              style={{ ...styles, ...props.iconStyle }}
              // @ts-ignore
              src={props.icon}
              mode="aspectFill"
            />
          )}
        </React.Fragment>
      );
    }
    return null;
  };

  const renderLabel = () => {
    if (props.label) {
      return (
        <View className={classnames(bem("label"), props.labelClass)} style={props.labelStyle}>
          {props.label}
        </View>
      );
    }
    return null;
  };
  const renderTitle = () => {
    if (props.title) {
      return (
        <View
          className={classnames(bem("title",{ full: !props.content && !props.children }), props.titleClass)}
          style={props.titleStyle}
        >
          <View className={classnames(bem("text", { [`${props.size}`]: props.size }))} style={props.textStyle}>
            {props.title}
          </View>
          {renderLabel()}
        </View>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (!!props.content || !!props.children) {
      return (
        <View
          style={props.contentStyle}
          className={classnames(
            bem("content", { [`${props.contentAlign}`]:props.contentAlign, [`${props.size}`]: props.size }),
            props.contentClass
          )}
        >
          {!!props.children ? props.children : props.content}
        </View>
      );
    }
  };

  const renderExtra = () => {
    if (props.extra) {
      return (
        <View className={classnames(bem("extra", { [`${props.size}`]: props.size }), props.extraClass)} style={props.extraStyle}>
          {props.extra}
        </View>
      );
    }
    return null;
  };

  const onRightClick = e => {
    if (props.onRight) {
      process.env.TARO_ENV !== "rn" && e.stopPropagation();
      props.onRight();
    }
  };
  const renderRight = () => {
    if (props.rightIcon) {
      return (
        <View
          className={classnames(bem("right-icon"),props.rightClass)}
          style={props.rightStyle}
          onClick={onRightClick}
        >
          {props.rightIcon}
        </View>
      );
    }
    return null;
  };

  const renderArrow = () => {
    if (props.arrow) {
      return (
        <View
          className={classnames(bem("arrow",{ [`${props.arrowDirection}`]:props.arrowDirection, [`${props.size}`]: props.size }))}
        />
      );
    }
    return null;
  };

  return (
    <View
      style={props.style}
      // hoverStyle={!!props.clickable ? { backgroundColor: "#f9fafa" } : {}}
      className={classnames(
        bem({
          [`${props.align}`]: props.align,
          [`${props.size}`]: props.size,
          divider: props.divider,
          clickable: props.clickable,
          compact: props.compact
        }),
        props.className
      )}
      onClick={props.onClick}
    >
      {renderBorder()}
      {renderIcon()}
      {renderTitle()}
      {renderContent()}
      {renderExtra()}
      {renderRight()}
      {renderArrow()}
    </View>
  );
};

Cell.defaultProps = {
  border: true,
  align: "center",
  contentAlign: "right",
  arrowDirection: "right"
};

export default Cell;
