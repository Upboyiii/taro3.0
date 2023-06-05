import React, { CSSProperties, FC } from "react";
import { View } from "@tarojs/components";
import { SafeAreaView } from "react-native";
import { BottomBarProps } from "./PropsType";
import { createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const BottomBar: FC<BottomBarProps> = props => {
  const [bem] = createNamespace("bottom-bar");

  let styles: CSSProperties = {};
  if (props.bgColor) {
    styles.backgroundColor = props.bgColor;
  }

  const renderBottomBar = () => {
    return (
      <View
        className={classnames(bem({ [`${props.direction}`]: props.direction, safeAreaBottom: props.safeAreaBottom }),props.className)}
        style={{ ...styles, ...props.style }}
      >
        <React.Fragment>
          {props.border ? <View className={classnames("hairline","hairline--top")} style={props.borderStyle} /> : null}
          {props.children}
        </React.Fragment>
      </View>
    );
  };

  if(props.safeAreaBottom){
    return (
      // @ts-ignore
      <SafeAreaView style={{ ...styles }}>
        {renderBottomBar()}
      </SafeAreaView>
    );
  }

  return renderBottomBar();
};

BottomBar.defaultProps = {
  direction: "row",
  safeAreaBottom: true
};
export default BottomBar;

