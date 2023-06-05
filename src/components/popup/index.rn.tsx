// @ts-ignore
import React, { FC, CSSProperties } from "react";
import { View, ScrollView } from "@tarojs/components";
import { SafeAreaView, Modal } from "react-native";
import { PopupProps } from "./PropsType";
import { addUnit, createNamespace } from "../utils";
import Navbar from "@/components/navbar";
import classnames from "classnames";
import "./index.scss";


const Popup: FC<PopupProps> = props => {
  const [bem] = createNamespace("popup");

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
    if(props.position === "pageSheet" && props.drag){
      return (
        <View
          style={props.closeStyle}
          className={classnames(bem("drag"))}
          onClick={closeClick}
        >
          <View className={classnames(bem("drag-bar"))} />
        </View>
      );
    }
    if (props.closeable && props.position !== "full" && props.position !== "pageSheet") {
      return (
        <View
          style={props.closeStyle}
          className={classnames(bem("close", { [`${props.closePosition}`]: props.closePosition }))}
          hoverStyle={{ backgroundColor: "#fff0f2" }}
          onClick={closeClick}
        >
          <View className={classnames(bem("plus"))} style={{ width: addUnit(12), height: addUnit(12) }}>
            <View className="plus-item plus-item--v" style={{ backgroundColor: "#bbb" }} />
            <View className="plus-item plus-item--h" style={{ backgroundColor: "#bbb" }} />
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
          style={props.position === "pageSheet" ? { marginTop: addUnit(12) } : {}}
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
    let styles: Record<string, string | number> = {};
    if(props.position === "full" || props.position === "pageSheet"){
      styles.flex = 1;
    }
    if(props.bgColor){
      styles.backgroundColor = props.bgColor;
    }
    if (props.round) {
      if(props.position === "bottom" || props.position === "center"){
        styles.borderTopLeftRadius = 16;
        styles.borderTopRightRadius = 16;
      }
      if(props.position === "top" || props.position === "center"){
        styles.borderBottomLeftRadius = 16;
        styles.borderBottomRightRadius = 16;
      }
    }
    return (
      <SafeAreaView
        // @ts-ignore
        style={{ ...styles, ...props.customStyle }}
        className={classnames(bem("content", { [`${props.position}`]: props.position }))}
      >
        {renderClose()}
        {renderHeader()}
        {renderTabs()}
        {renderBody()}
        {renderTips()}
        {renderAction()}
      </SafeAreaView>
    );
  };

  if(!props.show) return null;
  return (
    <Modal
      visible={props.show}
      transparent={props.position !== "pageSheet"}
      animationType={props.position === "center" || props.position === "top" ? "fade" : "slide"}
      onRequestClose={closeClick}
      presentationStyle={props.position === "pageSheet" ? "pageSheet" : undefined}
    >
      <View
        className={classnames(bem("wrapper", { [`${props.position}`]: props.position }))}
      >
        {renderOverlay()}
        {renderPopup()}
      </View>
    </Modal>
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
  minHeight: 360,
  maxHeight: 600,
  scroll: true
};

export default Popup;
