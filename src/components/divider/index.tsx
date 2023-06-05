// @ts-ignore
import React, { CSSProperties, FC } from "react";
import { View } from "@tarojs/components";
import { DividerProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const Divider: FC<DividerProps> = props => {
  const [bem] = createNamespace("divider");

  const renderLine = (position) => {
    let styles: CSSProperties = {};
    if (props.lineColor){ styles.borderColor = props.lineColor; }

    const { inline, hairline } = props;
    return (
      <View
        className={classnames(
          bem("line",{
            inline,
            hairline,
            [`${position}`]: position,
            [`${props.type}`]: props.type,
            align: props.align === position
          })
        )}
        style={styles}
      />
    );
  };

  let styles: CSSProperties = {};
  if (props.textColor){ styles.color = props.textColor; }
  if (props.textSize) { styles.fontSize = addUnit(props.textSize); }
  if (props.textBold) { styles.fontWeight = "bold"; }
  return (
    <View
      className={classnames(bem({ [`${props.align}`]: props.align }),props.className)}
      style={props.style}
    >
      {renderLine("left")}
      <View
        className={classnames(bem("text"))}
        style={styles}
      >
        {props.children || props.text}
      </View>
      {renderLine("right")}
    </View>
  );
};

Divider.defaultProps = {
  type: "solid",
  align: "center",
  inline: true,
  hairline: true
};

export default Divider;
