// @ts-ignore
import React, { CSSProperties, FC, useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
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
  const renderLeft = (pill = false) => {
    if(props.leftArrow || !!props.leftText){
      return (
        <View
          style={props.color ? { color: props.color } : {}}
          className={classnames(bem("left",{ pill }))}
          onClick={onClickLeft}
        >
          {props.leftArrow && (
            <View className={classnames(bem("left-arrow",{ pill }))} style={props.color ? { borderColor: props.color } : {}} />
          )}
          {props.leftText}
        </View>
      );
    }
    return null;
  };

  const renderRight = (pill = false) => {
    if(props.right){
      let styles: CSSProperties = {};
      if(props.color){
        styles.color = props.color;
      }
      return (
        <View
          style={{ ...styles, ...props.rightStyle }}
          className={classnames(bem("right",{ pill }))}
          onClick={props.onClickRight}
        >
          {props.right}
        </View>
      );
    }
    return null;
  };

  // 小程序中右侧内容放到左侧
  const renderLeftRight = () => {
    if(props.leftArrow || !!props.leftText || props.right){
      const pill = (props.leftArrow || !!props.leftText) && !!props.right;
      return (
        <View className={classnames(bem("action",{ pill }))}>
          {renderLeft(pill)}
          {pill ? (<View className={classnames(bem("sep"))} />) : null}
          {renderRight(pill)}
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
        {renderLeftRight()}
        {renderContent()}
        {renderBorder()}
      </View>
    );
  };

  const [statusBarHeight, setStatusBarHeight] = useState(0);
  useEffect(() => {
    Taro.getSystemInfo({
      success: (resp: any) => {
        setStatusBarHeight(resp.statusBarHeight || 0);
      }
    });
  }, []);

  if(props.safeAreaInsetTop){
    const styles: Record<string, string | number> = {
      minHeight: statusBarHeight + 44,
      paddingTop: statusBarHeight,
      backgroundColor: "#fff"
    };
    if (props.bgColor) {
      styles.backgroundColor = props.bgColor;
    }
    if (props.transparent) {
      styles.backgroundColor = "rgba(255,255,255,0)";
    }
    if(props.opacity){
      styles.opacity = props.opacity;
    }
    return (
      <View className={classnames(bem("h5"))} style={styles}>
        {renderNavbar()}
      </View>
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
