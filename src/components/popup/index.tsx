// @ts-ignore
import React, { FC, useEffect, CSSProperties } from "react";
import { View, ScrollView } from "@tarojs/components";
import { PopupProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import Navbar from "@/components/navbar";
import classnames from "classnames";
import "./index.scss";


const Popup: FC<PopupProps> = props => {
  const [bem] = createNamespace("popup");

  useEffect(() => {
    if (process.env.TARO_ENV === "h5") {
      let ele = document.querySelector(".taro_page");
      if (ele) {
        if (props.show) {
          ele.setAttribute("style", "overflow:hidden");
        } else {
          ele.setAttribute("style", "");
        }
      }
    }
  }, [props.show]);

  const closeClick = () => {
    props.onClose && props.onClose();
  };

  const onClickOverlay = () => {
    props.overlayClickable && closeClick();
  };

  const renderOverlay = () => {
    if (props.overlay) {
      return (
        <View
          className={classnames(bem("overlay", { in: props.show }))}
          style={props.overlayStyle}
          onClick={onClickOverlay}
        />
      );
    }
    return null;
  };

  const renderClose = () => {
    if (props.closeable && props.position !== "full" && props.position !== "pageSheet") {
      return (
        <View
          style={props.closeStyle}
          className={classnames(bem("close", { [`${props.closePosition}`]: props.closePosition }))}
          onClick={closeClick}
        >
          <View className={classnames(bem("plus"))}>
            <View className="plus-item plus-item--v" />
            <View className="plus-item plus-item--h" />
          </View>
        </View>
      );
    }
    return null;
  };

  const renderHeader = () => {
    if(props.position === "full" || props.position === "pageSheet"){
      return (
        <Navbar
          title={props.title}
          titleStyle={props.titleStyle}
          bgColor={props.bgColor}
          border={props.headerBorder}
          onClickBack={closeClick}
        />
      );
    }else{
      const hasHeader = props.title || props.desc;
      if (hasHeader) {
        return (
          <View className={classnames(bem("header", { [`${props.headerAlign}`]: props.headerAlign }))}>
            {props.title ? (
              <View className={classnames(bem("title"))} style={props.titleStyle}>
                {props.title}
              </View>
            ) : null}
            {props.desc ? (
              <View className={classnames(bem("desc"))} style={props.descStyle}>
                {props.desc}
              </View>
            ) : null}
            {props.headerBorder ? <View className={classnames(bem("border", "header"))} /> : null}
          </View>
        );
      }
      return null;
    }
  };

  const renderTabs = () => {
    if(!!props.tabs){
      return props.tabs;
    }
    return null;
  };

  const renderBody = () => {
    if(props.scroll){
      let styles: CSSProperties = {};
      if(props.position !== "full" && props.position !== "pageSheet"){
        if (props.minHeight) {
          styles.minHeight = addUnit(props.minHeight);
        }
        if (props.maxHeight) {
          styles.maxHeight = addUnit(props.maxHeight);
        }
      }
      return (
        <ScrollView
          style={{ ...styles, ...props.bodyStyle }}
          className={classnames(bem("body",{ card: props.bodyCard }))}
          scrollWithAnimation
          scrollY
        >
          {props.children}
        </ScrollView>
      );
    }
    return (
      <View className={classnames(bem("body",{ card: props.bodyCard }))} style={props.bodyStyle}>{props.children}</View>
    );
  };

  const renderTips = () => {
    if (props.tips) {
      return (
        <View className={classnames(bem("tips"))} style={props.tipsStyle}>
          {props.tips}
        </View>
      );
    }
    return null;
  };

  const renderAction = () => {
    if (props.action) {
      return (
        <View className={classnames(bem("action"), props.actionClass)} style={props.actionStyle}>
          {props.actionBorder ? <View className={classnames(bem("border", "action"))} /> : null}
          {props.action}
        </View>
      );
    }
    return null;
  };

  const renderPopup = () => {
    let styles: CSSProperties = {};
    if(props.bgColor){
      styles.backgroundColor = props.bgColor;
    }
    if (props.round) {
      if(props.position === "bottom" || props.position === "center" || props.position === "pageSheet"){
        styles.borderTopLeftRadius = addUnit(16);
        styles.borderTopRightRadius = addUnit(16);
      }
      if(props.position === "top" || props.position === "center"){
        styles.borderBottomLeftRadius = addUnit(16);
        styles.borderBottomRightRadius = addUnit(16);
      }
    }
    return (
      <View
        className={classnames(
          bem("content", { round: props.round, [`${props.position}`]: props.position }),
          {
            "safe-area-inset-bottom": props.position === "bottom" || props.position === "full",
            "safe-area-inset-top": props.position === "top" || props.position === "full"
          }
        )}
        style={{ ...styles, ...props.customStyle }}
      >
        {renderClose()}
        {renderHeader()}
        {renderTabs()}
        {renderBody()}
        {renderTips()}
        {renderAction()}
      </View>
    );
  };

  if(!props.show) return null;
  return (
    <View className={classnames(bem({ open: props.show }))} style={{ zIndex: props.zIndex }}>
      {renderOverlay()}
      {renderPopup()}
    </View>
  );
};

Popup.defaultProps = {
  position: "bottom",
  zIndex: 100,
  round: true,
  overlay: true,
  overlayClickable: true,
  closeable: true,
  closePosition: "top-right",
  headerAlign: "center",
  minHeight: 320,
  maxHeight: 600,
  scroll: true
};

export default Popup;
