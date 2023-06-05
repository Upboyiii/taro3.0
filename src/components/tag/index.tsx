// @ts-ignore
import React, { CSSProperties, FC } from "react";
import { View } from "@tarojs/components";
import { TagProps } from "./PropsType";
import { createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const Tag: FC<TagProps> = props => {
  const [bem] = createNamespace("tag");

  // @ts-ignore
  const onClick = () => {
    !props.disabled && props.onClick && props.onClick();
  };

  let styles: CSSProperties = {};
  if (props.color) {
    styles.color = props.dark ? "#ffffff" : props.color;
    if (props.plain) {
      styles.borderColor = props.color;
    } else {
      styles.backgroundColor = props.color;
    }
  }
  if (props.textColor) {
    styles.color = props.textColor;
  }

  return (
    <View
      className={classnames(
        bem({
          round: props.round && !props.mark,
          mark: props.mark,
          dark: props.dark,
          [`dark-${props.type}`]: props.dark && props.type,
          plain: props.plain && !props.dark,
          [`plain-${props.type}`]: props.plain && props.type && !props.dark,
          [`${props.type}`]: !props.dark && !props.plain,
          disabled: props.disabled,
          [`${props.size}`]: props.size
        }),
        props.className
      )}
      style={{ ...styles, ...props.style }}
      onClick={props.onClick}
    >
      {props.children}
    </View>
  );
};

export default Tag;

Tag.defaultProps = {
  type: "default",
  plain: true
};
