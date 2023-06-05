// @ts-ignore
import React, { CSSProperties, FC } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import { SafeAreaView, StatusBar } from "react-native";
import { NavBarProps } from "./PropsType";
import { createNamespace } from "../utils";
import classnames from "classnames";
import "./index.scss";

const NavBar: FC<NavBarProps> = props => {
  const [bem] = createNamespace("navbar");

  const onClickLeft = () => {
    if (props.onClickBack){
      props.onClickBack();
    }else{
      Taro.navigateBack({ delta:1 });
    }
  };
  const renderLeft = () => {
    if(props.leftArrow || !!props.leftText){
      return (
        <View
          style={props.color ? { color: props.color } : {}}
          className={classnames(bem("left","float"))}
          onClick={onClickLeft}
        >
          {props.leftArrow && (
            <View className={classnames(bem("left-arrow"))} style={props.color ? { borderColor: props.color } : {}} />
          )}
          {props.leftText}
        </View>
      );
    }
    return null;
  };

  const renderRight = () => {
    if(props.right){
      let styles: CSSProperties = {};
      if(props.color){
        styles.color = props.color;
      }
      return (
        <View
          style={{ ...styles, ...props.rightStyle }}
          className={classnames(bem("right","float"))}
          onClick={props.onClickRight}
        >
          {props.right}
        </View>
      );
    }
    return null;
  };

  const renderContent = () => {
    let styles: CSSProperties = {};
    if(props.color){
      styles.color = props.color;
    }
    if(props.title || props.children){
      return (
        <View
          className={classnames(bem("title"))}
          style={{ ...styles,...props.titleStyle }}
          onClick={props.onClickTitle}
        >
          {!!props.children ? props.children : props.title}
        </View>
      );
    }
    return null;
  };

  const renderBorder = () => {
    if(props.border){
      return (
        <View className={classnames(bem("border"))} style={props.borderStyle} />
      );
    }
    return null;
  };

  const renderNavbar = () => {
    let styles: CSSProperties = {};
    if(!props.safeAreaInsetTop){
      if (props.bgColor) {
        styles.backgroundColor = props.bgColor;
      }
      if (props.transparent) {
        styles.backgroundColor = "rgba(255,255,255,0)";
      }
      if(props.opacity){
        styles.opacity = props.opacity;
      }
    }else{
      styles.backgroundColor = "transparent";
    }
    return (
      <View
        style={{ ...styles,...props.style }}
        className={classnames(bem(),props.className)}
      >
        {renderLeft()}
        {renderContent()}
        {renderRight()}
        {renderBorder()}
      </View>
    );
  };

  if(props.safeAreaInsetTop){
    const styles: Record<string, string | number> = { backgroundColor: "#fff" };
    if (props.bgColor) {
      styles.backgroundColor = props.bgColor;
    }
    if (props.transparent) {
      styles.backgroundColor = "rgba(255,255,255,0)";
    }
    if(props.opacity){
      styles.opacity = props.opacity;
    }
    if(StatusBar.currentHeight){
      styles.paddingTop = StatusBar.currentHeight;
    }
    return (
      <SafeAreaView style={styles}>{renderNavbar()}</SafeAreaView>
    );
  }
  return renderNavbar();
};

NavBar.defaultProps = {
  safeAreaInsetTop: true,
  border: false,
  leftArrow: true
};

export default NavBar;
